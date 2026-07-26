/* Compras en cuotas y comisiones vinculadas.

   En Perú una compra con tarjeta a 12 meses no es un gasto de S/1,200 hoy:
   es una deuda que se paga en 12 tramos. Registrarla como un solo gasto
   distorsiona el mes de la compra y deja invisibles los 11 meses siguientes.

   El ITF y las comisiones se guardan como transacción propia, ligada a la que
   las originó (`idOrigen`), para que se vean sin ensuciar el importe real. */

import { construir, conNombresCuenta } from "../motor/motor.js";

/**
 * Genera las cuotas de una compra financiada.
 *
 * @param {object} compra
 * @param {string} compra.descripcion
 * @param {number} compra.monto        importe total de la compra
 * @param {string} compra.fecha        fecha de la compra (ISO)
 * @param {number} compra.cuotas       número de cuotas (>= 2)
 * @param {string} compra.idCuentaGasto categoría del gasto
 * @param {string} compra.idCuentaTarjeta cuenta pasivo que financia
 * @param {Array}  cuentas
 */
export function generarCuotas(compra, cuentas) {
  const total = Math.abs(compra.monto);
  const n = Math.max(2, Math.round(compra.cuotas));

  // El redondeo va en la última cuota: 100/3 no puede ser 33.33 x3, o el
  // total financiado no cuadraría con la compra.
  const base = Math.floor((total / n) * 100) / 100;
  const ultima = Math.round((total - base * (n - 1)) * 100) / 100;

  const idCompra = `tx-cuota-${Date.now().toString(36)}`;
  const inicio = new Date(compra.fecha);

  return Array.from({ length: n }, (_, i) => {
    const fecha = new Date(inicio);
    fecha.setMonth(fecha.getMonth() + i);
    const monto = i === n - 1 ? ultima : base;

    return {
      id: `${idCompra}-${i + 1}`,
      fecha: fecha.toISOString(),
      descripcion: `${compra.descripcion} (${i + 1}/${n})`,
      movimientos: conNombresCuenta(
        construir.gasto({
          categoriaId: compra.idCuentaGasto,
          cuentaPagoId: compra.idCuentaTarjeta,
          monto,
        }),
        cuentas
      ),
      financiacion: {
        idCompra,
        cuota: i + 1,
        totalCuotas: n,
        montoTotal: total,
        pendiente: i > 0, // la primera se considera cargada ya
      },
    };
  });
}

/**
 * Comisión ligada a un movimiento (ITF, mantenimiento, interplaza).
 * Va aparte para que el importe de la compra siga siendo el real.
 */
export function generarComision({ idOrigen, descripcion, monto, fecha, idCuentaFondos }, cuentas) {
  return {
    id: `${idOrigen}-fee`,
    fecha,
    descripcion: descripcion || "Comisión bancaria",
    movimientos: conNombresCuenta(
      construir.gasto({
        categoriaId: "g-comisiones",
        cuentaPagoId: idCuentaFondos,
        monto: Math.abs(monto),
      }),
      cuentas
    ),
    comisionDe: idOrigen,
  };
}

/** Cuotas que aún no han vencido, agrupadas por compra. */
export function cuotasPendientes(transacciones, hoy = new Date()) {
  const compras = new Map();

  transacciones
    .filter((t) => t.financiacion && !t.eliminada)
    .forEach((t) => {
      const { idCompra, totalCuotas, montoTotal } = t.financiacion;
      if (!compras.has(idCompra)) {
        compras.set(idCompra, {
          idCompra,
          descripcion: t.descripcion.replace(/\s*\(\d+\/\d+\)$/, ""),
          totalCuotas,
          montoTotal,
          pagadas: 0,
          pendientes: 0,
          importePendiente: 0,
          proximaFecha: null,
        });
      }

      const compra = compras.get(idCompra);
      const vencida = new Date(t.fecha) <= hoy;
      const importe = Math.abs(t.movimientos?.[0]?.monto ?? 0);

      if (vencida) {
        compra.pagadas++;
      } else {
        compra.pendientes++;
        compra.importePendiente += importe;
        if (!compra.proximaFecha || t.fecha < compra.proximaFecha) {
          compra.proximaFecha = t.fecha;
        }
      }
    });

  return [...compras.values()]
    .filter((c) => c.pendientes > 0)
    .sort((a, b) => String(a.proximaFecha).localeCompare(String(b.proximaFecha)));
}
