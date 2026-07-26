/* ==========================================================================
   ASIENTOS DESDE MOVIMIENTOS IMPORTADOS — lógica pura, sin React

   Traduce una transacción de extracto (YAPE/BCP) al asiento de partida doble
   que le corresponde. Vive junto al motor y no en el componente de
   importación: son reglas contables, no interfaz, y deben poder probarse y
   reutilizarse desde cualquier origen de datos.
   ========================================================================== */

import { construir } from "./motor.js";
import { TIPO_CONTRAPARTE } from "../services/clasificador.js";
import { INSTITUCIONES } from "../datos/instituciones.js";

/**
 * Un movimiento apuntando a una cuenta inexistente descuadra el balance en
 * silencio, así que se cae a cualquier cuenta real del mismo tipo.
 */
export function resolverCuenta(cuentas, idPreferido, tipo) {
  if (cuentas.some((c) => c.id === idPreferido)) return idPreferido;
  return cuentas.find((c) => c.tipo === tipo && c.activa)?.id || idPreferido;
}

export function cuentaDeInstitucion(idInstitucion) {
  return INSTITUCIONES.find((i) => i.id === idInstitucion)?.idCuenta || null;
}

/**
 * Genera los movimientos de partida doble de una transacción importada.
 *
 * @param {object} tx        transacción cruda del parser
 * @param {object} opts
 * @param {Array}  opts.cuentas       plan de cuentas vigente
 * @param {object} opts.clasificada   resultado de clasificarContraparte
 * @param {object} opts.contraparte   contraparte normalizada (para la dirección)
 * @param {string} opts.idCuentaGasto categoría de gasto ya resuelta
 */
export function generarAsiento(tx, { cuentas, clasificada, contraparte, idCuentaGasto }) {
  const idCuentaFondos = resolverCuenta(
    cuentas,
    tx.fuente === "YAPE" ? "a-yape" : "a-banco",
    "activo"
  );

  // Traspaso entre cuentas propias: no toca ingresos ni gastos, solo mueve
  // saldo de una cuenta tuya a otra. Contarlo como ingreso infla el total.
  if (clasificada?.tipo === TIPO_CONTRAPARTE.PROPIA) {
    const otraCuenta = resolverCuenta(
      cuentas,
      cuentaDeInstitucion(clasificada.institucion) || "a-efectivo",
      "activo"
    );
    const monto = Math.abs(tx.monto ?? tx.debito ?? tx.credito ?? 0);
    const entra = contraparte?.direccion === "recibido";

    return construir.transferencia({
      origenId: entra ? otraCuenta : idCuentaFondos,
      destinoId: entra ? idCuentaFondos : otraCuenta,
      monto,
    });
  }

  const idCuentaIngreso = resolverCuenta(cuentas, "i-transferencias", "ingreso");

  if (tx.fuente === "YAPE") {
    const monto = Math.abs(tx.monto);
    return tx.tipo === "PAGASTE"
      ? construir.gasto({ categoriaId: idCuentaGasto, cuentaPagoId: idCuentaFondos, monto })
      : construir.ingreso({ categoriaId: idCuentaIngreso, cuentaDestinoId: idCuentaFondos, monto });
  }

  if (tx.fuente === "BCP") {
    return tx.debito > 0
      ? construir.gasto({
          categoriaId: idCuentaGasto,
          cuentaPagoId: idCuentaFondos,
          monto: Math.abs(tx.debito),
        })
      : construir.ingreso({
          categoriaId: idCuentaIngreso,
          cuentaDestinoId: idCuentaFondos,
          monto: Math.abs(tx.credito),
        });
  }

  return [];
}
