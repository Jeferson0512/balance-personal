/* Datos semilla (RF-17: el usuario no empieza con una pantalla en blanco).
   Las transacciones de ejemplo existen solo para que los saldos no salgan en
   cero mientras se desarrolla; en producción las crea el usuario. */

export const CUENTAS_DEFAULT = [
  { id: "a-banco", nombre: "BCP", tipo: "activo", idPadre: null, activa: true, instrumento: "cuenta-bancaria" },
  { id: "a-interbank", nombre: "Interbank", tipo: "activo", idPadre: null, activa: true, instrumento: "cuenta-bancaria" },
  { id: "a-yape", nombre: "YAPE", tipo: "activo", idPadre: null, activa: true, instrumento: "billetera" },
  { id: "a-plin", nombre: "PLIN", tipo: "activo", idPadre: null, activa: true, instrumento: "billetera" },
  { id: "a-efectybank", nombre: "Efectybank", tipo: "activo", idPadre: null, activa: true, instrumento: "billetera" },
  { id: "a-efectivo", nombre: "Efectivo", tipo: "activo", idPadre: null, activa: true, instrumento: "efectivo" },
  { id: "a-chanchito", nombre: "Chanchito Interbank", tipo: "activo", idPadre: null, activa: true, instrumento: "ahorros" },

  // Inversión: aportar aquí mueve patrimonio entre cuentas propias, no lo gasta.
  { id: "a-inversiones", nombre: "Inversiones", tipo: "activo", idPadre: null, activa: true, instrumento: "inversion" },
  { id: "a-tyba", nombre: "Tyba", tipo: "activo", idPadre: "a-inversiones", activa: true, instrumento: "inversion" },
  { id: "a-ward", nombre: "WARD", tipo: "activo", idPadre: "a-inversiones", activa: true, instrumento: "inversion" },
  { id: "a-agora", nombre: "AGORA", tipo: "activo", idPadre: "a-inversiones", activa: true, instrumento: "inversion" },
  { id: "p-tarjeta", nombre: "Tarjeta de crédito", tipo: "pasivo", idPadre: null, activa: true, instrumento: "tarjeta-credito" },
  { id: "pt-inicial", nombre: "Saldo inicial", tipo: "patrimonio", idPadre: null, activa: true },
  { id: "i-sueldo", nombre: "Sueldo", tipo: "ingreso", idPadre: null, activa: true },
  { id: "i-transferencias", nombre: "Transferencias recibidas", tipo: "ingreso", idPadre: null, activa: true },
  { id: "i-otros", nombre: "Otros ingresos", tipo: "ingreso", idPadre: null, activa: true },
  { id: "g-vivienda", nombre: "Vivienda", tipo: "gasto", idPadre: null, activa: true },
  { id: "g-renta", nombre: "Renta", tipo: "gasto", idPadre: "g-vivienda", activa: true },
  { id: "g-servicios", nombre: "Servicios", tipo: "gasto", idPadre: "g-vivienda", activa: true },
  { id: "g-comida", nombre: "Comida", tipo: "gasto", idPadre: null, activa: true },
  { id: "g-super", nombre: "Supermercado", tipo: "gasto", idPadre: "g-comida", activa: true },
  { id: "g-resto", nombre: "Restaurantes", tipo: "gasto", idPadre: "g-comida", activa: true },
  { id: "g-transporte", nombre: "Transporte", tipo: "gasto", idPadre: null, activa: true },
  { id: "g-salud", nombre: "Salud", tipo: "gasto", idPadre: null, activa: true },
  { id: "g-compras", nombre: "Compras", tipo: "gasto", idPadre: null, activa: true },
  { id: "g-prestamos", nombre: "Préstamos y deudas", tipo: "gasto", idPadre: null, activa: true },
  // El ITF y las comisiones bancarias van aparte: sumadas al importe de la
  // compra falsearían cuánto costó realmente lo que compraste.
  { id: "g-comisiones", nombre: "Comisiones e ITF", tipo: "gasto", idPadre: null, activa: true },
  { id: "g-general", nombre: "Gastos varios", tipo: "gasto", idPadre: null, activa: true },
];

export const TX_SEMILLA = [
  { id: "t1", fecha: "2026-07-01", descripcion: "Saldo inicial en Banco",
    movimientos: [{ idCuenta: "a-banco", monto: 5000 }, { idCuenta: "pt-inicial", monto: -5000 }] },
  { id: "t2", fecha: "2026-07-05", descripcion: "Sueldo del mes",
    movimientos: [{ idCuenta: "a-banco", monto: 3000 }, { idCuenta: "i-sueldo", monto: -3000 }] },
  { id: "t3", fecha: "2026-07-08", descripcion: "Compra en el súper",
    movimientos: [{ idCuenta: "g-super", monto: 250 }, { idCuenta: "p-tarjeta", monto: -250 }] },
  { id: "t4", fecha: "2026-07-12", descripcion: "Almuerzo con amigos",
    movimientos: [{ idCuenta: "g-resto", monto: 80 }, { idCuenta: "a-banco", monto: -80 }] },
  { id: "t5", fecha: "2026-07-02", descripcion: "Renta del mes",
    movimientos: [{ idCuenta: "g-renta", monto: 1200 }, { idCuenta: "a-banco", monto: -1200 }] },
  { id: "t6", fecha: "2026-07-10", descripcion: "Servicios (luz, agua)",
    movimientos: [{ idCuenta: "g-servicios", monto: 300 }, { idCuenta: "a-banco", monto: -300 }] },
];

export const fmtPEN = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
