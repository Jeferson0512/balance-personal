import CryptoJS from 'crypto-js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// Vite resuelve esto a una URL servida por el propio proyecto. Con un worker
// de CDN, el parseo falla en cuanto no hay internet o el CDN cambia de ruta.
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/** El estado de cuenta de BCP viene cifrado con el DNI del titular. */
export class PDFProtegidoError extends Error {
  constructor({ incorrecta }) {
    super(
      incorrecta
        ? 'La contraseña no es correcta.'
        : 'Este PDF está protegido con contraseña.'
    );
    this.name = 'PDFProtegidoError';
    this.requierePassword = true;
    this.incorrecta = Boolean(incorrecta);
  }
}

/**
 * Parsea el estado de cuenta PDF de BCP.
 * @param {File} file
 * @param {string} [password] contraseña del PDF (para BCP, el DNI del titular)
 */
export async function parseBCPPDF(file, password) {
  const arrayBuffer = await file.arrayBuffer();

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      password: password || undefined,
    }).promise;
  } catch (error) {
    if (error?.name === 'PasswordException') {
      // code 2 = contraseña incorrecta; 1 = hace falta una.
      throw new PDFProtegidoError({ incorrecta: error.code === 2 });
    }
    throw new Error(`No se pudo abrir el PDF: ${error.message}`);
  }

  const transacciones = [];
  const lineasSinReconocer = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const lineas = agruparPorLinea(textContent.items);

    for (const linea of lineas) {
      const texto = String(linea || '').trim();
      if (!texto || texto.length < 5) continue;
      if (/TOTAL|SALDO|MENSA/i.test(texto)) continue;

      const tx = parsearLineaTransaccion(texto);
      if (tx) {
        tx.id = `bcp_${transacciones.length}`;
        tx.fuente = 'BCP';
        tx.archivoNombre = file.name;
        tx.estado = 'pendiente';
        transacciones.push(tx);
      } else if (lineasSinReconocer.length < 15) {
        lineasSinReconocer.push(texto);
      }
    }
  }

  if (transacciones.length === 0) {
    // El PDF se abrió pero el formato de tabla no coincide. Se adjunta una
    // muestra del texto real para poder ajustar los patrones sin adivinar.
    const error = new Error(
      'El PDF se abrió correctamente, pero no se reconoció ninguna transacción. ' +
        'El formato de la tabla puede ser distinto al esperado.'
    );
    error.muestra = lineasSinReconocer;
    throw error;
  }

  return transacciones;
}

/**
 * Agrupa items de PDF por línea (coordenada Y similar)
 */
function agruparPorLinea(items) {
  if (!items || items.length === 0) return [];

  const lineas = [];
  let lineaActual = [];
  let yActual = null;

  items.forEach((item) => {
    if (!item || !item.str) return;

    const y = Math.round(item.transform ? item.transform[5] : 0);

    if (yActual === null || Math.abs(y - yActual) < 5) {
      lineaActual.push(String(item.str).trim());
      yActual = y;
    } else {
      if (lineaActual.length > 0) {
        lineas.push(lineaActual.join(' '));
      }
      lineaActual = [String(item.str).trim()];
      yActual = y;
    }
  });

  if (lineaActual.length > 0) {
    lineas.push(lineaActual.join(' '));
  }

  return lineas;
}

/**
 * Parsea una línea individual de transacción BCP
 */
function parsearLineaTransaccion(linea) {
  // Patrones flexibles para parsear
  const patrones = [
    /^(\d{1,2}[A-Z]+)\s+(\d{1,2}[A-Z]+)\s+(.+?)\s+([\d,.]+)\s+([\d,.]+)$/,
    /^(\d{1,2}[A-Z]+)\s+(\d{1,2}[A-Z]+)\s+(.+?)\s+([\d,.]+)$/,
    /^(\d{2}\/\d{2})\s+(\d{2}\/\d{2})\s+(.+?)\s+([\d,.]+)\s*([\d,.]*)$/,
  ];

  for (const regex of patrones) {
    const match = linea.match(regex);
    if (match) {
      const [, fechaProd, fechaVal, descripcion, monto1, monto2] = match;

      let debito = 0;
      let credito = 0;

      if (monto2) {
        debito = parseFloat(String(monto1).replace(/,/g, '')) || 0;
        credito = parseFloat(String(monto2).replace(/,/g, '')) || 0;
      } else {
        const monto = parseFloat(String(monto1).replace(/,/g, '')) || 0;
        if (descripcion.toUpperCase().includes('PAGO')) {
          debito = monto;
        } else {
          credito = monto;
        }
      }

      const fecha = parsearFechaBCP(String(fechaVal));
      const fingerprint = generarFingerprintBCP(fecha, debito || credito, descripcion);

      return {
        fechaProd,
        fechaVal,
        descripcion: String(descripcion).trim(),
        debito,
        credito,
        monto: debito || credito,
        fecha,
        tipo: debito > 0 ? 'débito' : 'crédito',
        fingerprint,
      };
    }
  }

  return null;
}

/**
 * Parsea fecha BCP
 */
function parsearFechaBCP(fechaStr) {
  fechaStr = String(fechaStr).trim();

  // Formato: "01ABER" o "01/04"
  let match = fechaStr.match(/(\d{1,2})([A-Z]+)/);
  if (match) {
    const [, dia, mesStr] = match;
    const meses = {
      ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6,
      JUL: 7, AGO: 8, SEP: 9, OCT: 10, NOV: 11, DIC: 12,
    };
    const mes = meses[mesStr.substring(0, 3).toUpperCase()] || 1;
    const año = new Date().getFullYear();
    return new Date(año, mes - 1, parseInt(dia)).toISOString();
  }

  // Formato: "01/04"
  match = fechaStr.match(/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    const [, dia, mes] = match;
    const año = new Date().getFullYear();
    return new Date(año, parseInt(mes) - 1, parseInt(dia)).toISOString();
  }

  return new Date().toISOString();
}

/**
 * Genera fingerprint para deduplicación
 */
function generarFingerprintBCP(fecha, monto, descripcion) {
  const fechaFormato = fecha.split('T')[0];
  const key = `${fechaFormato}|${monto}|${descripcion}`;
  return CryptoJS.SHA256(key).toString();
}

/**
 * Extrae categoría sugerida
 */
export function extraerCategoriaBCP(descripcion, tipo) {
  const desc = String(descripcion || '').toLowerCase();

  const categorias = {
    'Pago/Transferencia': ['pago', 'abono', 'transferencia', 'tranf', 'yape', 'plin'],
    'Servicios': ['servicio', 'comisión', 'itf', 'impuesto'],
    'Otros': [],
  };

  for (const [categoria, palabras] of Object.entries(categorias)) {
    if (categoria !== 'Otros' && palabras.some((p) => desc.includes(p))) {
      return categoria;
    }
  }

  return tipo === 'débito' ? 'Gasto' : 'Ingreso';
}
