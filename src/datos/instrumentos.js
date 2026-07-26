/* Tipo de instrumento: qué es la cuenta en el mundo real.

   Es una dimensión distinta del tipo contable. "YAPE" y "Tyba" son ambos
   activo, pero uno es dinero disponible hoy y el otro es inversión que no
   deberías contar como gasto ni como liquidez. Sin esta separación no se
   puede responder "¿cuánto tengo disponible?" frente a "¿cuánto invertido?".

   El modelo sale de los 11 grupos de Money Manager, ajustado a lo que se usa
   en Perú. */

export const INSTRUMENTOS = [
  { id: "efectivo", nombre: "Efectivo", tipoContable: "activo", liquido: true, icono: "Banknote" },
  { id: "cuenta-bancaria", nombre: "Cuenta bancaria", tipoContable: "activo", liquido: true, icono: "Landmark" },
  { id: "billetera", nombre: "Billetera digital", tipoContable: "activo", liquido: true, icono: "Smartphone" },
  { id: "tarjeta-debito", nombre: "Tarjeta de débito", tipoContable: "activo", liquido: true, icono: "CreditCard" },
  { id: "ahorros", nombre: "Ahorros", tipoContable: "activo", liquido: false, icono: "PiggyBank" },
  { id: "inversion", nombre: "Inversión", tipoContable: "activo", liquido: false, icono: "TrendingUp" },
  { id: "tarjeta-credito", nombre: "Tarjeta de crédito", tipoContable: "pasivo", liquido: false, icono: "CreditCard" },
  { id: "prestamo", nombre: "Préstamo", tipoContable: "pasivo", liquido: false, icono: "HandCoins" },
  { id: "otros", nombre: "Otros", tipoContable: "activo", liquido: false, icono: "Wallet" },
];

export const instrumentoDe = (id) => INSTRUMENTOS.find((i) => i.id === id) || null;

/** El tipo contable se deduce del instrumento: una tarjeta de crédito es deuda. */
export const tipoContableDe = (idInstrumento) =>
  instrumentoDe(idInstrumento)?.tipoContable || "activo";

/** Dinero disponible ya, frente a lo inmovilizado o invertido. */
export const esLiquido = (idInstrumento) => instrumentoDe(idInstrumento)?.liquido === true;

/** Instrumento por defecto de las cuentas que aún no lo declaran. */
export function inferirInstrumento(cuenta) {
  if (cuenta.instrumento) return cuenta.instrumento;

  const n = String(cuenta.nombre || "").toLowerCase();
  if (cuenta.tipo === "pasivo") return n.includes("prest") ? "prestamo" : "tarjeta-credito";
  if (n.includes("efectivo")) return "efectivo";
  if (/yape|plin|efectybank/.test(n)) return "billetera";
  if (/tyba|ward|agora|inversion/.test(n)) return "inversion";
  if (/ahorro/.test(n)) return "ahorros";
  if (cuenta.tipo === "activo") return "cuenta-bancaria";
  return null;
}
