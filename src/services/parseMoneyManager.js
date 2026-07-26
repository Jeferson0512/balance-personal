/* Importador del Excel de Money Manager (la app coreana).

   Formato: Fecha | Cuenta | Categoría | Subcategorías | Nota | PEN |
            Ingreso/Gasto | Descripción | Importe | Moneda | Cuenta

   A diferencia de YAPE/BCP, aquí la categoría ya viene dada por el usuario:
   no hay que adivinarla, hay que crearla en el plan de cuentas si no existe. */

import * as XLSX from "xlsx";
import CryptoJS from "crypto-js";

const CABECERAS = ["fecha", "cuenta", "categor", "importe"];

/** Cuentas de Money Manager → cuentas de Balance. */
const MAPA_CUENTAS = {
  bcp: "a-banco",
  yape: "a-yape",
  plin: "a-plin",
  efectivo: "a-efectivo",
  interbank: "a-interbank",
  "tarjetas de credito interbank": "p-tarjeta",
  "pagar interbank": "p-tarjeta",
};

const normalizar = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** ¿Este Excel es un export de Money Manager y no de YAPE? */
export function esFormatoMoneyManager(filas) {
  return filas.slice(0, 5).some((fila) => {
    if (!Array.isArray(fila)) return false;
    const texto = fila.map(normalizar).join("|");
    return CABECERAS.every((c) => texto.includes(c)) && texto.includes("ingreso");
  });
}

export function parseMoneyManagerExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (evento) => {
      try {
        const wb = XLSX.read(new Uint8Array(evento.target.result), {
          type: "array",
          cellDates: true,
        });
        const hoja = wb.Sheets[wb.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, raw: false, dateNF: "yyyy-mm-dd" });

        const iCabecera = filas.findIndex((f) => {
          const t = (f || []).map(normalizar).join("|");
          return CABECERAS.every((c) => t.includes(c));
        });
        if (iCabecera === -1) {
          throw new Error(
            "No se reconoció el formato. Se esperaban las columnas: Fecha, Cuenta, Categoría, Importe."
          );
        }

        const cabecera = filas[iCabecera].map(normalizar);
        const col = (...alias) =>
          cabecera.findIndex((c) => alias.some((a) => c.includes(a)));

        const iFecha = col("fecha");
        const iCuenta = col("cuenta");
        const iCategoria = col("categor");
        const iSub = col("subcategor");
        const iNota = col("nota");
        const iTipo = col("ingreso/gasto", "ingreso");
        const iDesc = col("descripcion", "descripción");
        const iImporte = col("importe");

        const transacciones = [];
        const categorias = new Map();
        // Las cuentas del histórico pueden estar cerradas hoy: se listan para
        // que el usuario diga cuáles sigue usando.
        const cuentasUsadas = new Map();

        filas.slice(iCabecera + 1).forEach((fila, indice) => {
          if (!fila || !fila[iFecha]) return;

          const importe = parseFloat(String(fila[iImporte] ?? "").replace(/,/g, ""));
          if (!Number.isFinite(importe) || importe === 0) return;

          const esIngreso = normalizar(fila[iTipo]).startsWith("ingreso");
          const nombreCategoria = String(fila[iCategoria] ?? "").trim() || "Otros";
          const nombreSub = String(fila[iSub] ?? "").trim();
          const nota = String(fila[iNota] ?? "").trim();
          const descripcion = String(fila[iDesc] ?? "").trim();
          const fecha = parsearFecha(fila[iFecha]);

          // Se registra la categoría para poder crearla luego en el plan.
          const tipoCuenta = esIngreso ? "ingreso" : "gasto";
          const idPadre = idCategoria(nombreCategoria, tipoCuenta);
          categorias.set(idPadre, { id: idPadre, nombre: nombreCategoria, tipo: tipoCuenta, idPadre: null });

          let idCuentaCategoria = idPadre;
          if (nombreSub) {
            idCuentaCategoria = idCategoria(`${nombreCategoria} ${nombreSub}`, tipoCuenta);
            categorias.set(idCuentaCategoria, {
              id: idCuentaCategoria,
              nombre: nombreSub,
              tipo: tipoCuenta,
              idPadre,
            });
          }

          const idFondos = mapearCuenta(fila[iCuenta]);
          const nombreCuenta = String(fila[iCuenta] ?? "").trim() || "Efectivo";
          if (!cuentasUsadas.has(idFondos)) {
            cuentasUsadas.set(idFondos, { id: idFondos, nombre: nombreCuenta, movimientos: 0 });
          }
          cuentasUsadas.get(idFondos).movimientos++;

          transacciones.push({
            fuente: "MoneyManager",
            fecha,
            // La nota suele ser el concepto corto; la descripción, el detalle.
            descripcion: nota || descripcion || nombreSub || nombreCategoria,
            detalle: descripcion && descripcion !== nota ? descripcion : null,
            monto: Math.abs(importe),
            esIngreso,
            idCuentaFondos: idFondos,
            nombreCuentaOriginal: nombreCuenta,
            idCuentaCategoria,
            categoria: nombreCategoria,
            subcategoria: nombreSub || null,
            fingerprint: huella(fecha, importe, fila[iCuenta], nombreCategoria, nota || descripcion),
            archivoNombre: file.name,
            indiceFila: indice,
          });
        });

        if (transacciones.length === 0) {
          throw new Error("El archivo no contiene movimientos legibles.");
        }

        resolve({
          transacciones,
          categorias: [...categorias.values()],
          cuentasUsadas: [...cuentasUsadas.values()].sort((a, b) => b.movimientos - a.movimientos),
        });
      } catch (error) {
        reject(new Error(`Error al leer el Excel de Money Manager: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsArrayBuffer(file);
  });
}

function mapearCuenta(nombre) {
  const n = normalizar(nombre);
  // De la clave más específica a la más corta: "tarjetas de credito interbank"
  // es un pasivo y no debe resolverse por el simple "interbank".
  const clave = Object.keys(MAPA_CUENTAS)
    .sort((a, b) => b.length - a.length)
    .find((k) => n.includes(k));
  return clave ? MAPA_CUENTAS[clave] : "a-efectivo";
}

/** Id estable a partir del nombre: si reimportas, no se duplican categorías. */
function idCategoria(nombre, tipo) {
  const slug = normalizar(nombre)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return `${tipo === "ingreso" ? "i" : "g"}-mm-${slug || "otros"}`;
}

/** Money Manager exporta la fecha como serial de Excel o como texto. */
function parsearFecha(valor) {
  if (valor instanceof Date && !isNaN(valor)) return valor.toISOString();

  const texto = String(valor).trim();
  const serial = parseFloat(texto);
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    return new Date(Date.UTC(1899, 11, 30) + serial * 86400000).toISOString();
  }

  const iso = new Date(texto);
  return isNaN(iso) ? new Date().toISOString() : iso.toISOString();
}

function huella(fecha, monto, cuenta, categoria, concepto) {
  const dia = String(fecha).slice(0, 10);
  return CryptoJS.SHA256(`mm|${dia}|${monto}|${cuenta}|${categoria}|${concepto}`).toString();
}
