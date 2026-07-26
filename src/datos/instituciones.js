/* Catálogo de instituciones financieras.

   El tipo decide el tratamiento contable, no es decorativo:
   - billetera/banco → cuenta de activo; mover plata entre ellas es transferencia
   - inversion       → cuenta de activo; aportar NO es gasto, es mover patrimonio
   - servicio        → contraparte de un gasto (Entel, Caja Huancayo…)          */

export const TIPOS_INSTITUCION = {
  BANCO: "banco",
  BILLETERA: "billetera",
  INVERSION: "inversion",
  SERVICIO: "servicio",
};

export const INSTITUCIONES = [
  // Cuentas propias: donde vive el dinero
  { id: "bcp", nombre: "BCP", tipo: "banco", idCuenta: "a-banco", patrones: ["bcp", "credito del peru"] },
  { id: "interbank", nombre: "Interbank", tipo: "banco", idCuenta: "a-interbank", patrones: ["interbank"] },
  { id: "yape", nombre: "YAPE", tipo: "billetera", idCuenta: "a-yape", patrones: ["yape"] },
  { id: "plin", nombre: "PLIN", tipo: "billetera", idCuenta: "a-plin", patrones: ["plin"] },
  { id: "efectybank", nombre: "Efectybank", tipo: "billetera", idCuenta: "a-efectybank", patrones: ["efectybank", "efecty"] },

  // Inversión: aportar aquí mueve patrimonio, no lo gasta
  { id: "tyba", nombre: "Tyba", tipo: "inversion", idCuenta: "a-tyba", patrones: ["tyba"] },
  { id: "ward", nombre: "WARD", tipo: "inversion", idCuenta: "a-ward", patrones: ["ward"] },
  { id: "agora", nombre: "AGORA", tipo: "inversion", idCuenta: "a-agora", patrones: ["agora", "ágora"] },

  // Servicios: contrapartes de gasto. El nombre real aparece en el mensaje
  // de YAPE, no en el destino ("Pagaste el servicio de …").
  { id: "caja-huancayo", nombre: "Caja Huancayo", tipo: "servicio", idCuenta: "g-prestamos", patrones: ["caja huancayo"] },
  { id: "entel", nombre: "Entel", tipo: "servicio", idCuenta: "g-servicios", patrones: ["entel"] },
  { id: "claro", nombre: "Claro", tipo: "servicio", idCuenta: "g-servicios", patrones: ["claro"] },
  { id: "movistar", nombre: "Movistar", tipo: "servicio", idCuenta: "g-servicios", patrones: ["movistar"] },
  { id: "safetypay", nombre: "SafetyPay", tipo: "servicio", idCuenta: "g-general", patrones: ["safetypay"] },
  { id: "pagoefectivo", nombre: "PagoEfectivo", tipo: "servicio", idCuenta: "g-general", patrones: ["pagoefectivo", "pago efectivo"] },
];

/** Cuentas de activo que exige el catálogo (las de servicio ya existen). */
export const CUENTAS_INSTITUCIONES = INSTITUCIONES.filter((i) => i.tipo !== "servicio").map((i) => ({
  id: i.idCuenta,
  nombre: i.nombre,
  tipo: "activo",
  idPadre: null,
  activa: true,
  institucion: i.id,
}));

export function buscarInstitucion(texto) {
  if (!texto) return null;
  const t = String(texto).toLowerCase();
  return INSTITUCIONES.find((i) => i.patrones.some((p) => t.includes(p))) || null;
}
