/* Clasifica la contraparte de un movimiento importado.

   YAPE codifica quién está al otro lado en el formato del nombre, y el patrón
   es fiable sobre las 129 transacciones reales analizadas:

     "Diana Cca*"                        → persona (YAPE enmascara el apellido)
     "PLIN - ROSA QUISPE"                → persona vía PLIN, nombre completo
     "Pagaste el servicio de X"          → servicio; la entidad va en el mensaje
     "CONSORCIO MEDITERRANEO S.A.C."     → comercio
     "RETIRO DE EFECTIVO"                → retiro de efectivo
     "PLIN - <tu propio nombre>"         → transferencia entre cuentas tuyas    */

import { buscarInstitucion } from "../datos/instituciones.js";

export const TIPO_CONTRAPARTE = {
  PERSONA: "persona",
  SERVICIO: "servicio",
  COMERCIO: "comercio",
  PROPIA: "propia",
  RETIRO: "retiro",
  RECARGA: "recarga",
  DESCONOCIDO: "desconocido",
};

/** Nombres de empresa: sufijos societarios o marcas conocidas. */
const RE_COMERCIO = /\b(s\.?a\.?c?\.?|e\.?i\.?r\.?l\.?|s\.?r\.?l\.?)\b|minimarket|kfc|temu|betano|market|bodega|farmacia|restaurant/i;

/**
 * Normaliza para comparar nombres: sin tildes, sin puntuación, espacios simples.
 * YAPE escribe el mismo nombre de formas distintas ("Jeferson fredy  Bujaico").
 */
export function normalizarNombre(nombre) {
  return String(nombre || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^plin\s*-\s*/, "")
    .replace(/^bim\s*-\s*/, "")
    .replace(/^pagaste el servicio de\s*/, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ¿La contraparte es el propio titular? Se compara por tokens y no por igualdad:
 * el mismo titular aparece como "Jeferson Buj*", "PLIN - Jeferson fredy Bujaico
 * Rodriguez" y "JEFERSON FREDY BUJAICO RODRIGUEZ".
 */
export function esTitular(nombre, titular) {
  const objetivo = normalizarNombre(titular);
  if (!objetivo) return false;

  const candidato = normalizarNombre(nombre);
  if (!candidato) return false;
  if (candidato === objetivo) return true;

  const tokensObjetivo = objetivo.split(" ").filter((t) => t.length > 2);
  if (tokensObjetivo.length < 2) return false;

  const tokensCandidato = candidato.split(" ").filter(Boolean);

  // Un token del candidato puede venir truncado por el enmascarado de YAPE
  // ("Buj*" por "Bujaico"), así que basta con que sea prefijo.
  const coincidencias = tokensObjetivo.filter((t) =>
    tokensCandidato.some((c) => c === t || t.startsWith(c) || c.startsWith(t))
  );

  // Dos tokens (nombre + apellido) evitan falsos positivos por un nombre común.
  return coincidencias.length >= 2;
}

/**
 * Clasifica una transacción cruda del extracto.
 * @param {object} tx transacción del parser (con origen/destino/mensaje)
 * @param {string} nombreContraparte nombre ya resuelto por normalizarTx
 * @param {object} config { nombreTitular }
 */
export function clasificarContraparte(tx, nombreContraparte, config = {}) {
  const nombre = String(nombreContraparte || "").trim();
  const mensaje = String(tx?.mensaje || "");

  if (!nombre || nombre === "Desconocido") {
    return { tipo: TIPO_CONTRAPARTE.DESCONOCIDO, nombre: "Desconocido", institucion: null };
  }

  if (/^retiro de efectivo/i.test(nombre)) {
    return { tipo: TIPO_CONTRAPARTE.RETIRO, nombre: "Retiro de efectivo", institucion: null };
  }

  if (/^nuevo n[úu]mero$/i.test(nombre)) {
    return {
      tipo: TIPO_CONTRAPARTE.RECARGA,
      nombre: "Recarga de celular",
      institucion: buscarInstitucion(mensaje)?.id || null,
    };
  }

  // 1. Servicio. Va antes que la comprobación de titular a propósito: pagar tu
  //    propio recibo de Entel figura a tu nombre pero es un gasto, no un
  //    traspaso entre cuentas tuyas.
  if (/^pagaste el servicio de/i.test(nombre)) {
    const institucion = buscarInstitucion(mensaje);
    return {
      tipo: TIPO_CONTRAPARTE.SERVICIO,
      nombre: institucion?.nombre || primeraParteMensaje(mensaje) || limpiarNombre(nombre),
      institucion: institucion?.id || null,
      beneficiario: limpiarNombre(nombre),
    };
  }

  // 2. Propia: traspaso entre cuentas del titular. Nunca es ingreso ni gasto.
  const nombresPropios = [config.nombreTitular, ...(config.aliasTitular || [])].filter(Boolean);
  if (nombresPropios.some((propio) => esTitular(nombre, propio))) {
    return {
      tipo: TIPO_CONTRAPARTE.PROPIA,
      nombre: limpiarNombre(nombre),
      institucion: buscarInstitucion(nombre)?.id || null,
      esTransferenciaPropia: true,
    };
  }

  // 3. Persona: YAPE enmascara con "*"; PLIN/BIM traen el nombre completo.
  const esEnmascarado = /\*\s*$/.test(nombre);
  const viaBilletera = /^(plin|bim)\s*-\s*/i.test(nombre);
  if (esEnmascarado || viaBilletera) {
    return {
      tipo: TIPO_CONTRAPARTE.PERSONA,
      nombre: limpiarNombre(nombre),
      institucion: viaBilletera ? buscarInstitucion(nombre)?.id || null : "yape",
    };
  }

  if (RE_COMERCIO.test(nombre)) {
    return { tipo: TIPO_CONTRAPARTE.COMERCIO, nombre: limpiarNombre(nombre), institucion: null };
  }

  // Mayúsculas sin enmascarar suele ser razón social; con minúsculas, persona.
  const pareceEmpresa = nombre === nombre.toUpperCase() && nombre.split(" ").length <= 4;
  return {
    tipo: pareceEmpresa ? TIPO_CONTRAPARTE.COMERCIO : TIPO_CONTRAPARTE.PERSONA,
    nombre: limpiarNombre(nombre),
    institucion: null,
  };
}

/** Quita prefijos de billetera y el asterisco del enmascarado. */
function limpiarNombre(nombre) {
  return String(nombre)
    .replace(/^(plin|bim)\s*-\s*/i, "")
    .replace(/^pagaste el servicio de\s*/i, "")
    .replace(/\s*\*\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Caja Huancayo - Pago de Crédito" → "Caja Huancayo" */
function primeraParteMensaje(mensaje) {
  const parte = String(mensaje || "").split(" - ")[0];
  return parte.trim() || null;
}
