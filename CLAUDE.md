# Contexto del proyecto — Balance

Este archivo da contexto al asistente. La planificación completa está en `docs/`.

## Qué es

App de finanzas personales sobre un motor de contabilidad de **partida doble**. La rigurosidad contable vive por debajo; la interfaz por encima es amigable para alguien que no sabe contabilidad.

## Stack y convenciones

- **React + Vite**. Almacenamiento local (navegador) para el MVP; sin backend todavía.
- **Separar motor de interfaz:** `src/motor/motor.js` es lógica pura sin React. La UI lo importa; nunca al revés (RNF-05).
- **El usuario nunca ve "debe" ni "haber".** Registra en lenguaje simple; el motor arma el asiento por detrás.
- Interfaz en **español**. Moneda: soles (PEN).

## Modelo de datos (resumen — detalle en docs/03)

Tres entidades:
- **Cuenta**: id, nombre, tipo (activo | pasivo | patrimonio | ingreso | gasto), idPadre (auto-referencia -> arbol jerarquico), activa. Las categorias SON cuentas de tipo ingreso/gasto.
- **Transaccion**: id, fecha, descripcion.
- **Movimiento**: idCuenta, monto (con signo).

**Regla de oro:** para cada transaccion, la suma de los `monto` = 0. Si no cuadra, no se guarda. (Convencion interna: debito = +, credito = -.)

## Estado actual y prioridad

- Bloque 1 (motor) y Bloque 2 (cuentas/arbol): HECHOS.
- **Siguiente: Bloque 3 — Transacciones** (RF-04, RF-07, RF-08): registrar en lenguaje simple usando las cuentas reales del usuario, ver historial, editar/eliminar y recalcular saldos.
- Luego: Bloque 4 (patrimonio y saldos), Bloque 5 (persistencia local), Bloque 6 (disclaimer legal).

## Regla de alcance

Solo se construye lo que esta en el MVP. Ideas nuevas (graficos, presupuestos, etiquetas transversales, estados financieros formales) se difieren a MLP/MMP. Ver la tabla de diferidos en docs/02. El diferenciador clave frente al competidor (Money Manager) son las etiquetas transversales con estadisticas -> MLP.
