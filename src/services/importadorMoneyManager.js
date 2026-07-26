/* Convierte los movimientos de Money Manager en transacciones de Balance.

   Money Manager usa partida simple: una fila es un movimiento con su cuenta y
   su categoría. Aquí se arma el asiento de dos patas que exige el motor. */

import { construir, conNombresCuenta } from "../motor/motor.js";
import { resolverCuenta } from "../motor/asientos.js";

/* "Modificar saldo" no es un gasto ni un ingreso: es el ajuste que hacía la
   app para cuadrar el saldo real. Va contra patrimonio, como un aporte. */
const AJUSTE_SALDO = /modificar saldo|ajuste de saldo/i;

export function aImportablesMoneyManager(movimientos, { cuentas, importadoEl }) {
  const marca = importadoEl || new Date().toISOString();

  return movimientos.map((mov) => {
    const idFondos = resolverCuenta(cuentas, mov.idCuentaFondos, "activo");
    const esAjuste = AJUSTE_SALDO.test(mov.categoria);

    const idContrapartida = esAjuste
      ? resolverCuenta(cuentas, "pt-inicial", "patrimonio")
      : resolverCuenta(cuentas, mov.idCuentaCategoria, mov.esIngreso ? "ingreso" : "gasto");

    const movimientosAsiento = mov.esIngreso
      ? construir.ingreso({
          categoriaId: idContrapartida,
          cuentaDestinoId: idFondos,
          monto: mov.monto,
        })
      : construir.gasto({
          categoriaId: idContrapartida,
          cuentaPagoId: idFondos,
          monto: mov.monto,
        });

    return {
      id: `tx-mm-${mov.fingerprint.slice(0, 12)}`,
      fecha: mov.fecha,
      descripcion: mov.descripcion,
      movimientos: conNombresCuenta(movimientosAsiento, cuentas),
      metadatos: {
        fuente: "MoneyManager",
        fingerprint: mov.fingerprint,
        archivoOrigen: mov.archivoNombre,
        importadoEl: marca,
        // Se conserva lo que el usuario escribió en la app original.
        categoria: mov.categoria,
        subcategoria: mov.subcategoria,
        detalle: mov.detalle,
        cuentaOriginal: mov.nombreCuentaOriginal,
      },
    };
  });
}

/** Categorías del Excel que aún no existen en el plan de cuentas. */
export function categoriasFaltantes(categorias, cuentas) {
  const existentes = new Set(cuentas.map((c) => c.id));
  // Los padres primero: una subcategoría sin su padre queda huérfana.
  return categorias
    .filter((c) => !existentes.has(c.id))
    .sort((a, b) => (a.idPadre ? 1 : 0) - (b.idPadre ? 1 : 0))
    .map((c) => ({ ...c, activa: true }));
}
