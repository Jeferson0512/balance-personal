/* Decide en qué categoría cae un movimiento importado.

   Separado del componente porque es una regla de negocio: el mismo criterio
   debe aplicarse venga el dato de una importación, de una regla automática o
   de una recategorización masiva. */

import { extraerCategoriaYAPE } from "./parseYAPE.js";
import { TIPO_CONTRAPARTE } from "./clasificador.js";
import { INSTITUCIONES } from "../datos/instituciones.js";
import { resolverCuenta } from "../motor/asientos.js";

// Las categorías que devuelve el parser son etiquetas legibles; aquí se
// traducen al plan de cuentas.
const CATEGORIA_A_CUENTA = {
  Comida: "g-comida",
  Transporte: "g-transporte",
  Servicios: "g-servicios",
  Utilidades: "g-servicios",
  Salud: "g-salud",
  Compras: "g-compras",
  Préstamo: "g-prestamos",
  Entretenimiento: "g-general",
  Persona: "g-general",
};

/**
 * Determina la cuenta de gasto de una transacción importada.
 * La institución detectada manda sobre las palabras clave: "Caja Huancayo -
 * Pago de Crédito" es un préstamo aunque el mensaje no contenga ninguna
 * palabra del diccionario.
 */
export function determinarCuentaGasto(tx, cuentas, clasificada) {
  const institucion = INSTITUCIONES.find((i) => i.id === clasificada?.institucion);
  if (institucion?.tipo === "servicio") {
    return resolverCuenta(cuentas, institucion.idCuenta, "gasto");
  }

  if (clasificada?.tipo === TIPO_CONTRAPARTE.RETIRO) {
    return resolverCuenta(cuentas, "a-efectivo", "activo");
  }

  if (tx.tipoTransaccion === "deuda") {
    return resolverCuenta(cuentas, "g-prestamos", "gasto");
  }

  const texto = tx.mensaje || tx.descripcion || "";
  const categoria = extraerCategoriaYAPE(texto, tx.tipo);
  return resolverCuenta(cuentas, CATEGORIA_A_CUENTA[categoria] || "g-general", "gasto");
}
