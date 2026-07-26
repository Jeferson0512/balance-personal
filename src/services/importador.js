/* Convierte transacciones de extracto en transacciones de Balance.

   Es el punto donde se juntan parser, clasificador, categorizador y motor.
   Está fuera de los componentes para que una importación pueda ejecutarse,
   probarse o repetirse sin montar la interfaz. */

import { descripcionDe, contraparteDe } from "./normalizarTx.js";
import { clasificarContraparte } from "./clasificador.js";
import { determinarCuentaGasto } from "./categorizador.js";
import { generarAsiento } from "../motor/asientos.js";
import { conNombresCuenta } from "../motor/motor.js";

/**
 * @param {Array}  transacciones  crudas del parser (ya revisadas por el usuario)
 * @param {object} opts
 * @param {Array}  opts.cuentas   plan de cuentas vigente
 * @param {object} opts.config    { nombreTitular, aliasTitular }
 * @param {string} [opts.importadoEl] marca de tiempo común al lote
 * @returns {Array} transacciones listas para guardar
 */
export function aImportables(transacciones, { cuentas, config, importadoEl }) {
  const marca = importadoEl || new Date().toISOString();

  return transacciones.map((tx) => {
    const contraparteBase = contraparteDe(tx);
    const clasificada = contraparteBase
      ? clasificarContraparte(tx, contraparteBase.nombre, config)
      : null;

    return {
      // El id debe ser estable y único: sin él, borrar una transacción
      // borraría todas las importadas (filter por id undefined).
      id: `tx-${tx.fuente.toLowerCase()}-${tx.fingerprint.slice(0, 12)}`,
      fecha: tx.fecha,
      // La edición hecha en la vista previa manda sobre lo derivado.
      descripcion: (tx.descripcion || "").trim() || descripcionDe(tx),
      contraparte: contraparteBase
        ? {
            ...contraparteBase,
            nombre: clasificada.nombre,
            tipo: clasificada.tipo,
            institucion: clasificada.institucion,
            ...(clasificada.beneficiario ? { beneficiario: clasificada.beneficiario } : {}),
          }
        : null,
      movimientos: conNombresCuenta(
        generarAsiento(tx, {
          cuentas,
          clasificada,
          contraparte: contraparteBase,
          idCuentaGasto: determinarCuentaGasto(tx, cuentas, clasificada),
        }),
        cuentas
      ),
      metadatos: {
        fuente: tx.fuente,
        fingerprint: tx.fingerprint,
        archivoOrigen: tx.archivoNombre,
        importadoEl: marca,
        // Se conserva el crudo del extracto para poder re-derivar cualquier
        // cosa sin volver a pedir el archivo.
        origen: tx.origen ?? null,
        destino: tx.destino ?? null,
        mensaje: tx.mensaje ?? null,
        tipoOriginal: tx.tipo ?? null,
        tipoTransaccion: tx.tipoTransaccion ?? null,
      },
    };
  });
}
