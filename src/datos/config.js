/* Configuración del usuario.

   El nombre del titular no es un adorno: es lo que permite distinguir una
   transferencia entre cuentas propias (que no es ingreso ni gasto) de un
   cobro real. Sin él, mover dinero de tu PLIN a tu YAPE infla los ingresos. */

const KEY = "balance_config";

export const CONFIG_DEFAULT = {
  nombreTitular: "",
  // Alias adicionales por si el extracto usa otra forma del nombre.
  aliasTitular: [],
};

export function cargarConfig() {
  try {
    const guardada = JSON.parse(localStorage.getItem(KEY) || "null");
    return { ...CONFIG_DEFAULT, ...(guardada || {}) };
  } catch {
    return { ...CONFIG_DEFAULT };
  }
}

export function guardarConfig(config) {
  try {
    localStorage.setItem(KEY, JSON.stringify(config));
  } catch (e) {
    console.error("No se pudo guardar la configuración:", e);
  }
}
