import { useEffect, useState } from "react";

const KEYS = {
  CUENTAS: "balance_cuentas",
  TRANSACCIONES: "balance_transacciones",
};

/* Bloque 5 — Persistencia local (RF-12) */

// Cargar datos del localStorage
export function cargarDatos() {
  try {
    const cuentas = localStorage.getItem(KEYS.CUENTAS);
    const transacciones = localStorage.getItem(KEYS.TRANSACCIONES);
    return {
      cuentas: cuentas ? JSON.parse(cuentas) : null,
      transacciones: transacciones ? JSON.parse(transacciones) : null,
    };
  } catch (err) {
    console.error("Error cargando datos:", err);
    return { cuentas: null, transacciones: null };
  }
}

// Guardar datos en localStorage
export function guardarDatos(cuentas, transacciones) {
  try {
    localStorage.setItem(KEYS.CUENTAS, JSON.stringify(cuentas));
    localStorage.setItem(KEYS.TRANSACCIONES, JSON.stringify(transacciones));
  } catch (err) {
    console.error("Error guardando datos:", err);
  }
}

// Hook para sincronizar estado con localStorage
export function usePersistencia(cuentasInicial, transaccionesInicial) {
  const [cuentas, setCuentas] = useState(cuentasInicial);
  const [transacciones, setTransacciones] = useState(transaccionesInicial);
  const [cargado, setCargado] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    const datos = cargarDatos();
    if (datos.cuentas) setCuentas(datos.cuentas);
    if (datos.transacciones) setTransacciones(datos.transacciones);
    setCargado(true);
  }, []);

  // Guardar cuentas cuando cambien
  useEffect(() => {
    if (cargado) {
      guardarDatos(cuentas, transacciones);
    }
  }, [cuentas, transacciones, cargado]);

  return { cuentas, setCuentas, transacciones, setTransacciones, cargado };
}
