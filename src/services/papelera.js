/* Borrado lógico.

   Nada se destruye: se marca. Money Manager lo resuelve con `IS_DEL` y es la
   decisión correcta para datos financieros — un borrado accidental de 129
   movimientos importados no debe ser irreversible.

   Todo cálculo (saldos, dashboard, presupuestos) debe partir de
   `soloActivas`; la papelera es el único sitio que mira las eliminadas. */

/** Transacciones que cuentan para saldos y estadísticas. */
export function soloActivas(transacciones) {
  return transacciones.filter((t) => !t.eliminada);
}

export function soloEliminadas(transacciones) {
  return transacciones.filter((t) => t.eliminada);
}

/** Marca como eliminadas sin sacarlas del almacén. */
export function marcarEliminadas(transacciones, ids, motivo = null) {
  const objetivo = new Set(ids);
  const marca = new Date().toISOString();

  return transacciones.map((t) =>
    objetivo.has(t.id) && !t.eliminada
      ? { ...t, eliminada: { fecha: marca, motivo } }
      : t
  );
}

export function restaurar(transacciones, ids) {
  const objetivo = new Set(ids);
  return transacciones.map((t) => {
    if (!objetivo.has(t.id) || !t.eliminada) return t;
    const { eliminada, ...resto } = t;
    return resto;
  });
}

/** Borrado definitivo. Solo desde la papelera y con confirmación. */
export function purgar(transacciones, ids) {
  const objetivo = new Set(ids);
  return transacciones.filter((t) => !(objetivo.has(t.id) && t.eliminada));
}

/** Agrupa la papelera por lote de borrado, para poder deshacer en bloque. */
export function lotesEliminados(transacciones) {
  const lotes = new Map();

  soloEliminadas(transacciones).forEach((t) => {
    // Se agrupa por minuto: un borrado masivo comparte marca de tiempo.
    const clave = `${t.eliminada.fecha.slice(0, 16)}|${t.eliminada.motivo || ""}`;
    if (!lotes.has(clave)) {
      lotes.set(clave, {
        clave,
        fecha: t.eliminada.fecha,
        motivo: t.eliminada.motivo,
        ids: [],
        total: 0,
      });
    }
    const lote = lotes.get(clave);
    lote.ids.push(t.id);
    lote.total += Math.abs(t.movimientos?.[0]?.monto ?? 0);
  });

  return [...lotes.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Años presentes en las transacciones activas, para borrados por periodo. */
export function aniosDisponibles(transacciones) {
  const anios = new Map();
  soloActivas(transacciones).forEach((t) => {
    const anio = String(t.fecha).slice(0, 4);
    anios.set(anio, (anios.get(anio) || 0) + 1);
  });
  return [...anios.entries()]
    .map(([anio, n]) => ({ anio, n }))
    .sort((a, b) => b.anio.localeCompare(a.anio));
}

export function idsDelAnio(transacciones, anio) {
  return soloActivas(transacciones)
    .filter((t) => String(t.fecha).startsWith(anio))
    .map((t) => t.id);
}
