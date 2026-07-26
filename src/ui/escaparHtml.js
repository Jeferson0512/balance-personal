/* Los nombres de contraparte vienen del extracto del banco. Nunca se
   interpolan crudos dentro del HTML de un diálogo. */
export function escaparHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
