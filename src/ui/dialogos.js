/* Diálogos y avisos de la app.

   Se centralizan aquí para que todo comparta el mismo aspecto y para no
   depender de `alert()`: los navegadores bloquean los diálogos nativos y el
   aviso simplemente no llega (pasó con "129 transacciones importadas").

   Los estilos se atan a las variables del tema, así el modo oscuro funciona
   solo. */

import Swal from "sweetalert2";

/* Un mixin no expone sus params, así que al sobrescribir customClass en una
   llamada se perderían las demás clases. Se parte siempre de esta base. */
const CLASES = {
  popup: "balance-popup",
  title: "balance-title",
  htmlContainer: "balance-text",
  confirmButton: "balance-btn balance-btn-confirm",
  cancelButton: "balance-btn balance-btn-cancel",
  actions: "balance-actions",
  icon: "balance-icon",
};

const base = Swal.mixin({
  customClass: CLASES,
  buttonsStyling: false,
  reverseButtons: true,
  focusCancel: true,
});

/**
 * Confirmación de una acción destructiva.
 * @returns {Promise<boolean>} true si el usuario confirmó
 */
export async function confirmarPeligro({ titulo, texto, html, confirmar = "Eliminar", cancelar = "Cancelar" }) {
  const { isConfirmed } = await base.fire({
    icon: "warning",
    title: titulo,
    text: html ? undefined : texto,
    html,
    showCancelButton: true,
    confirmButtonText: confirmar,
    cancelButtonText: cancelar,
    customClass: { ...CLASES, confirmButton: "balance-btn balance-btn-peligro" },
  });
  return isConfirmed;
}

/** Confirmación de una acción normal (no destructiva). */
export async function confirmar({ titulo, texto, html, confirmar = "Continuar", cancelar = "Cancelar" }) {
  const { isConfirmed } = await base.fire({
    icon: "question",
    title: titulo,
    text: html ? undefined : texto,
    html,
    showCancelButton: true,
    confirmButtonText: confirmar,
    cancelButtonText: cancelar,
  });
  return isConfirmed;
}

/** Aviso de que algo salió bien. No bloquea: aparece en una esquina. */
export function avisoExito(titulo, texto) {
  return toast.fire({ icon: "success", title: titulo, text: texto });
}

export function avisoError(titulo, texto) {
  return base.fire({
    icon: "error",
    title: titulo,
    text: texto,
    confirmButtonText: "Entendido",
  });
}

/** Para validaciones: molesta menos que un modal. */
export function avisoAtencion(titulo, texto) {
  return toast.fire({ icon: "warning", title: titulo, text: texto });
}

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  customClass: {
    popup: "balance-toast",
    title: "balance-toast-title",
    htmlContainer: "balance-toast-text",
  },
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

/**
 * Pide el saldo de apertura de una cuenta.
 * @returns {Promise<{value?: {saldo:number, fecha:string}}>} value undefined si se cancela
 */
export async function pedirApertura({ cuenta, valorActual, fecha, sugerido }) {
  const { value } = await base.fire({
    title: `Saldo de apertura · ${cuenta.nombre}`,
    html: `
      <p style="text-align:left">Cuánto tenías en esta cuenta <strong>antes</strong> del primer
      movimiento registrado. Se guarda como un asiento contra patrimonio.</p>
      ${
        sugerido
          ? `<div class="balance-detalle">
               <strong>Sugerencia: ${sugerido.toFixed(2)}</strong>
               <div class="meta">Es lo que dejaría la cuenta en cero. Ajústalo al importe real.</div>
             </div>`
          : ""
      }
      <div style="display:grid;gap:.6rem;margin-top:1rem;text-align:left">
        <label style="font-size:.8rem;color:hsl(var(--muted-foreground))">Saldo
          <input id="ap-saldo" type="number" step="0.01" value="${valorActual ?? ""}"
                 class="balance-input" placeholder="0.00">
        </label>
        <label style="font-size:.8rem;color:hsl(var(--muted-foreground))">Fecha
          <input id="ap-fecha" type="date" value="${fecha}" class="balance-input">
        </label>
      </div>
      <p style="font-size:.75rem;margin-top:.75rem;color:hsl(var(--muted-foreground))">
        Déjalo en 0 para eliminar la apertura.</p>`,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    focusCancel: false,
    preConfirm: () => ({
      saldo: parseFloat(document.getElementById("ap-saldo").value) || 0,
      fecha: document.getElementById("ap-fecha").value,
    }),
  });
  return { value };
}

export { Swal };
