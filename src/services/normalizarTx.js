/* Normalización de una transacción cruda de extracto (YAPE/BCP) a los campos
   que Balance muestra y guarda.

   Vive aparte a propósito: la vista previa y el import definitivo tienen que
   derivar exactamente lo mismo, o el usuario estaría aprobando algo distinto
   de lo que se guarda. */

/**
 * En YAPE el usuario es siempre uno de los dos extremos: si pagó, la
 * contraparte es el destino; si le pagaron, es el origen.
 */
export function nombreContraparte(tx) {
  if (tx.fuente !== "YAPE") return null;
  const nombre = tx.tipo === "PAGASTE" ? tx.destino : tx.origen;
  return (nombre || "").trim() || null;
}

export function contraparteDe(tx) {
  if (tx.fuente === "YAPE") {
    return {
      nombre: nombreContraparte(tx) || "Desconocido",
      direccion: tx.tipo === "PAGASTE" ? "enviado" : "recibido",
    };
  }

  if (tx.fuente === "BCP") {
    return {
      nombre: (tx.descripcion || "").trim() || "Desconocido",
      direccion: tx.debito > 0 ? "enviado" : "recibido",
    };
  }

  return null;
}

/**
 * Descripción legible: el concepto, sin repetir monto ni fuente
 * (ambos ya se muestran en su propia columna).
 */
export function descripcionDe(tx) {
  if (tx.fuente === "YAPE") {
    const mensaje = (tx.mensaje || "").trim();
    if (mensaje) return mensaje;

    // Sin mensaje, la contraparte es lo único descriptivo que queda.
    const quien = nombreContraparte(tx);
    if (quien) return tx.tipo === "PAGASTE" ? `Envío a ${quien}` : `Recibido de ${quien}`;
    return tx.tipo === "PAGASTE" ? "Envío por YAPE" : "Recibido por YAPE";
  }

  if (tx.fuente === "BCP") {
    return (tx.descripcion || "").trim() || "Movimiento BCP";
  }

  return tx.descripcion || tx.mensaje || "Sin descripción";
}
