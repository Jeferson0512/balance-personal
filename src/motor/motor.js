/* ==========================================================================
   MOTOR DE PARTIDA DOBLE — lógica pura, sin React (RNF-05)
   Es el corazón de Balance. No depende de la interfaz.

   Modelo (ver docs/03-modelo-de-datos.md):
   - Cuenta:     { id, nombre, tipo, idPadre, activa }
   - Movimiento: { idCuenta, monto }   ← monto con signo
   Regla de oro: para cada transacción, la suma de los `monto` = 0.
   Convención de signo (interna, el usuario NUNCA la ve): débito = +, crédito = −.
   ========================================================================== */

export const TIPOS = ["activo", "pasivo", "patrimonio", "ingreso", "gasto"];

// Las cuentas de tipo activo y gasto crecen por el débito (+).
export const esDebitoNormal = (tipo) => tipo === "activo" || tipo === "gasto";

// Saldo "crudo" de una cuenta = suma de los montos de sus movimientos.
export function saldoCrudo(idCuenta, movimientos) {
  return movimientos
    .filter((m) => m.idCuenta === idCuenta)
    .reduce((s, m) => s + m.monto, 0);
}

// Saldo que se le muestra al usuario (magnitud positiva del lado normal).
export function saldoMostrado(cuenta, movimientos) {
  const crudo = saldoCrudo(cuenta.id, movimientos);
  return esDebitoNormal(cuenta.tipo) ? crudo : -crudo;
}

// Saldo consolidado: propio + el de todas sus subcuentas (RF-16).
export function saldoCrudoConSub(idCuenta, cuentas, movimientos) {
  const propio = saldoCrudo(idCuenta, movimientos);
  const hijos = cuentas.filter((c) => c.idPadre === idCuenta);
  return propio + hijos.reduce((s, h) => s + saldoCrudoConSub(h.id, cuentas, movimientos), 0);
}

// RF-06: validar que una transacción cuadre antes de aceptarla.
export function validarCuadre(movimientos) {
  const suma = movimientos.reduce((s, m) => s + m.monto, 0);
  if (Math.abs(suma) > 0.0001) {
    return { ok: false, error: `No cuadra: los movimientos suman ${suma.toFixed(2)}, deben sumar 0.` };
  }
  return { ok: true };
}

// RF-05: constructores que arman el asiento balanceado por detrás.
// El usuario elige en lenguaje simple; aquí se traduce a débito/crédito.
export const construir = {
  gasto: ({ categoriaId, cuentaPagoId, monto }) => [
    { idCuenta: categoriaId, monto: +monto },   // el gasto sube (débito)
    { idCuenta: cuentaPagoId, monto: -monto },  // la cuenta de pago baja (crédito)
  ],
  ingreso: ({ categoriaId, cuentaDestinoId, monto }) => [
    { idCuenta: cuentaDestinoId, monto: +monto }, // la cuenta destino sube (débito)
    { idCuenta: categoriaId, monto: -monto },     // el ingreso sube (crédito)
  ],
  transferencia: ({ origenId, destinoId, monto }) => [
    { idCuenta: destinoId, monto: +monto },
    { idCuenta: origenId, monto: -monto },
  ],
};

/* Guarda en cada movimiento el nombre que tenía la cuenta al registrarlo.
   Si mañana renombras "Comida" a "Alimentación", el histórico sigue diciendo
   cómo se llamaba entonces; el cálculo siempre usa idCuenta, nunca el nombre. */
export function conNombresCuenta(movimientos, cuentas) {
  const nombres = new Map(cuentas.map((c) => [c.id, c.nombre]));
  return movimientos.map((m) => ({
    ...m,
    nombreCuenta: nombres.get(m.idCuenta) ?? m.nombreCuenta ?? null,
  }));
}

// RF-11: invariante global — si cada transacción cuadra, la suma de TODOS
// los saldos crudos siempre es 0.
export function integridadGlobal(movimientos) {
  return Math.abs(movimientos.reduce((s, m) => s + m.monto, 0)) < 0.0001;
}

// RF-09: patrimonio neto = activos − pasivos (en montos mostrados).
export function patrimonioNeto(cuentas, movimientos) {
  const totalTipo = (tipo) =>
    cuentas.filter((c) => c.tipo === tipo).reduce((s, c) => s + saldoMostrado(c, movimientos), 0);
  const activos = totalTipo("activo");
  const pasivos = totalTipo("pasivo");
  return { activos, pasivos, neto: activos - pasivos };
}
