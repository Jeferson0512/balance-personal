import * as XLSX from 'xlsx';
import CryptoJS from 'crypto-js';

/**
 * Parsea archivo Excel de YAPE y extrae transacciones
 * Retorna array de transacciones con estructura normalizada
 */
export function parseYAPEExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Obtener datos sin headers automáticos primero
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Detectar headers buscando por palabras clave comunes en YAPE
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const rowText = row.map((c) => String(c).toLowerCase()).join('|');

          // Buscar combinación de palabras clave de YAPE
          if (
            (rowText.includes('tipo') || rowText.includes('transacción')) &&
            (rowText.includes('origen') || rowText.includes('destino')) &&
            (rowText.includes('monto') || rowText.includes('fecha'))
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('No se encontraron headers válidos en el archivo YAPE. Verifica que contenga: Tipo de Transacción, Origen, Destino, Monto, Fecha de operación');
        }

        // Convertir a JSON con headers detectados
        const headerRow = rows[headerRowIndex];
        const headers = headerRow
          .map((h) => String(h).trim())
          .filter((h) => h);

        const transacciones = rows
          .slice(headerRowIndex + 1)
          .filter((row) => row.length > 0 && row[0])
          .map((row, index) => {
            const rowObj = {};
            headers.forEach((header, idx) => {
              rowObj[header] = row[idx];
            });

            let tipo, origen, destino, monto, mensaje, fechaStr;

            if (headers.length > 0) {
              tipo = findValue(rowObj, ['Tipo de Transacción', 'Tipo', 'TIPO', 'tipo', 'Tipo de transacción']) || String(row[0] || '');
              origen = findValue(rowObj, ['Origen', 'ORIGEN', 'origen']) || String(row[1] || '');
              destino = findValue(rowObj, ['Destino', 'DESTINO', 'destino']) || String(row[2] || '');
              monto = parseFloat(findValue(rowObj, ['Monto', 'MONTO', 'Importe', 'monto']) || row[3]) || 0;
              mensaje = findValue(rowObj, ['Mensaje', 'MENSAJE', 'Concepto', 'mensaje']) || String(row[4] || '');
              fechaStr = findValue(rowObj, ['Fecha de operación', 'Fecha operación', 'Fecha', 'FECHA', 'fecha operación']) || String(row[5] || '');
            } else {
              tipo = String(row[0] || '').trim();
              origen = String(row[1] || '').trim();
              destino = String(row[2] || '').trim();
              monto = parseFloat(String(row[3] || '0').replace(/,/g, '')) || 0;
              mensaje = String(row[4] || '').trim();
              fechaStr = String(row[5] || '').trim();
            }

            // Parsear fecha (formato: DD/MM/YYYY HH:MM:SS)
            const fecha = parseYAPEDate(fechaStr);

            // Determinar tipo de transacción
            let tipoTransaccion = 'transferencia';
            if (mensaje.toLowerCase().includes('cuota') ||
                mensaje.toLowerCase().includes('prestamo') ||
                mensaje.toLowerCase().includes('deuda')) {
              tipoTransaccion = 'deuda';
            } else if (mensaje.toLowerCase().includes('pago') ||
                       mensaje.toLowerCase().includes('servicio') ||
                       origen.toUpperCase().includes('PLIN') ||
                       destino.toUpperCase().includes('PLIN')) {
              tipoTransaccion = 'servicio';
            }

            // Generar fingerprint único
            const fingerprint = generarFingerprintYAPE(fecha, monto, origen, destino, tipo);

            return {
              id: `yape_${index}`,
              fuente: 'YAPE',
              tipo: tipo, // "PAGASTE" o "TE PAGÓ"
              tipoTransaccion, // "transferencia", "servicio", "deuda"
              origen,
              destino,
              monto,
              mensaje,
              fecha, // ISO format: "2026-05-17T20:00:00Z"
              fechaFormato: fechaStr,
              fingerprint,
              archivoNombre: file.name,
              estado: 'pendiente', // pendiente, duplicado, nuevo, importado
            };
          });

        resolve(transacciones);
      } catch (error) {
        reject(new Error(`Error al parsear YAPE Excel: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer archivo YAPE'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parsea fecha de formato "DD/MM/YYYY HH:MM:SS" a ISO string
 */
function parseYAPEDate(dateStr) {
  if (!dateStr) return new Date().toISOString();

  // Formato esperado: "20/05/2026 12:24:14"
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [, dia, mes, año, hora, minuto, segundo] = match;
    return new Date(año, mes - 1, dia, hora, minuto, segundo).toISOString();
  }

  return new Date().toISOString();
}

/**
 * Genera fingerprint único para deduplicación
 * Hash de: fecha + monto + origen + destino + tipo
 */
function generarFingerprintYAPE(fecha, monto, origen, destino, tipo) {
  const fechaFormato = fecha.split('T')[0]; // YYYY-MM-DD
  const key = `${fechaFormato}|${monto}|${origen}|${destino}|${tipo}`;
  return CryptoJS.SHA256(key).toString();
}

/**
 * Extrae categoría sugerida de YAPE basada en mensaje
 */
export function extraerCategoriaYAPE(mensaje, tipo) {
  const msg = mensaje.toLowerCase();

  // Palabras clave por categoría
  const categorias = {
    'Comida': ['almuerzo', 'cena', 'desayuno', 'restaurant', 'café', 'comida', 'pizza', 'buffet'],
    'Transporte': ['pasaje', 'taxi', 'bus', 'uber', 'transporte', 'tren'],
    'Entretenimiento': ['cine', 'cinema', 'película', 'show', 'concierto', 'disco', 'bar'],
    'Servicios': ['safetypay', 'pago', 'servicio', 'netflix', 'spotify', 'suscripción'],
    'Salud': ['farmacia', 'medicamento', 'doctor', 'hospital', 'medicina'],
    'Compras': ['tienda', 'mall', 'compra', 'supermercado', 'mercado'],
    'Utilidades': ['luz', 'agua', 'internet', 'teléfono', 'electricidad', 'gas'],
    'Préstamo': ['cuota', 'préstamo', 'deuda', 'pagare'],
    'Persona': ['hermana', 'hermano', 'papá', 'mamá', 'tía', 'tío', 'primo', 'amiga', 'amigo'],
  };

  for (const [categoria, palabras] of Object.entries(categorias)) {
    if (palabras.some(palabra => msg.includes(palabra))) {
      return categoria;
    }
  }

  // Por defecto
  return tipo === 'PAGASTE' ? 'Gasto General' : 'Ingreso';
}

/**
 * Busca un valor en un objeto por múltiples claves posibles (tolerante)
 */
function findValue(obj, keys) {
  for (const key of keys) {
    // Búsqueda exacta
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
    // Búsqueda case-insensitive
    const matchKey = Object.keys(obj).find(
      (k) => k.toLowerCase().trim() === key.toLowerCase().trim()
    );
    if (matchKey && obj[matchKey] !== undefined && obj[matchKey] !== null) {
      return obj[matchKey];
    }
  }
  return null;
}
