/* Saldos de apertura.

   Un extracto trae movimientos, nunca cuánto había antes de empezar. Sin
   apertura, una cuenta con gastos previos a la importación queda en negativo:
   pasó con Efectivo, que salía en -S/2.532 solo porque su saldo inicial no
   existía en Money Manager.

   La apertura es un asiento normal contra patrimonio, no un campo de la
   cuenta: así entra en el balance, respeta la partida doble y se puede
   corregir o borrar como cualquier otra transacción. */

import { construir, conNombresCuenta, saldoCrudo } from "../motor/motor.js";

const ID_PATRIMONIO = "pt-inicial";

/** Id determinista: refijar la apertura sustituye, no acumula. */
export const idApertura = (idCuenta) => `tx-apertura-${idCuenta}`;

export function aperturaDe(transacciones, idCuenta) {
  return transacciones.find((t) => t.id === idApertura(idCuenta)) || null;
}

/**
 * Construye (o rehace) el asiento de apertura de una cuenta.
 * @param {string} idCuenta
 * @param {number} saldo    saldo real a esa fecha, con su signo natural
 * @param {string} fecha    ISO; por defecto, el día anterior al primer movimiento
 */
export function crearApertura({ idCuenta, saldo, fecha, cuentas }) {
  const cuenta = cuentas.find((c) => c.id === idCuenta);
  if (!cuenta) throw new Error(`No existe la cuenta ${idCuenta}`);

  const monto = Math.abs(saldo);
  const esActivo = cuenta.tipo === "activo";

  // Un activo entra por débito y un pasivo por crédito; con saldo negativo,
  // al revés (un activo en descubierto es, de hecho, una deuda).
  const positivo = saldo >= 0;
  const movimientos =
    esActivo === positivo
      ? construir.ingreso({
          categoriaId: ID_PATRIMONIO,
          cuentaDestinoId: idCuenta,
          monto,
        })
      : construir.gasto({
          categoriaId: ID_PATRIMONIO,
          cuentaPagoId: idCuenta,
          monto,
        });

  return {
    id: idApertura(idCuenta),
    fecha,
    descripcion: `Saldo de apertura · ${cuenta.nombre}`,
    movimientos: conNombresCuenta(movimientos, cuentas),
    apertura: { idCuenta, saldo },
  };
}

/**
 * Fija el saldo de apertura reemplazando el asiento anterior si lo hubiera.
 * @returns {Array} la nueva lista de transacciones
 */
export function fijarApertura(transacciones, { idCuenta, saldo, fecha, cuentas }) {
  const sinAnterior = transacciones.filter((t) => t.id !== idApertura(idCuenta));
  if (!saldo) return sinAnterior; // saldo 0 = quitar la apertura
  return [crearApertura({ idCuenta, saldo, fecha, cuentas }), ...sinAnterior];
}

/** Fecha sugerida: el día antes del primer movimiento de esa cuenta. */
export function fechaSugerida(transacciones, idCuenta) {
  const conMovimiento = transacciones
    .filter((t) => t.id !== idApertura(idCuenta))
    .filter((t) => t.movimientos?.some((m) => m.idCuenta === idCuenta))
    .map((t) => t.fecha)
    .sort();

  const primera = conMovimiento[0];
  if (!primera) return new Date().toISOString().slice(0, 10);

  const d = new Date(primera);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Cuánto habría que declarar de apertura para que la cuenta deje de estar en
 * negativo. Es una sugerencia, no un dato: el usuario debe confirmar cuánto
 * tenía realmente.
 */
export function aperturaSugerida(transacciones, idCuenta) {
  const movimientos = transacciones
    .filter((t) => t.id !== idApertura(idCuenta) && !t.eliminada)
    .flatMap((t) => t.movimientos ?? []);
  const saldo = saldoCrudo(idCuenta, movimientos);
  return saldo < 0 ? Math.abs(saldo) : 0;
}
