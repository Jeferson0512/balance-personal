# Balance

App de **finanzas personales** construida sobre un **motor de contabilidad de partida doble** real. En lugar de ser una simple lista de gastos con categorías, lleva un registro riguroso que siempre cuadra y muestra el patrimonio neto verdadero.

- **Para quién:** personas ordenadas con su dinero, con varias cuentas, que quieren rigor sin necesidad de saber contabilidad.
- **La idea:** motor de partida doble por debajo (invisible), interfaz de finanzas personales por encima (accesible).
- **Stack:** React + Vite. Almacenamiento local para el MVP; backend en etapas posteriores.

## Estado actual

- ✅ **Bloque 1 — Motor de partida doble** (asiento automático, validación de cuadre, patrimonio neto).
- ✅ **Bloque 2 — Cuentas y árbol de categorías** (CRUD, jerarquía, consolidación, semillas).
- ⬜ **Bloque 3 — Transacciones** ← siguiente.
- ⬜ Bloque 4 — Vistas y cálculos · Bloque 5 — Persistencia · Bloque 6 — Legal.

Ver el backlog completo en `docs/04-tablero-kanban.md`.

## Cómo correrlo

```bash
npm install
npm run dev
```

> Nota: las versiones en `package.json` son un punto de partida estándar (React 18 + Vite 5). Si algo necesita ajustarse, `npm install` y Claude Code lo resuelven.

## Estructura

```
balance/
├── docs/                     Toda la planificación (leer en orden 01 → 05)
├── src/
│   ├── motor/motor.js        EL CORAZÓN: lógica de partida doble, pura, sin React
│   ├── datos/semillas.js     Árbol de cuentas por defecto + datos de ejemplo
│   ├── componentes/
│   │   ├── MotorBench.jsx     Bloque 1 (banco de pruebas del motor)
│   │   └── GestorCuentas.jsx  Bloque 2 (gestor de cuentas y categorías)
│   ├── App.jsx               Navegación entre bloques
│   └── main.jsx              Punto de entrada
└── (config: vite, tailwind, postcss)
```

## Documentación

1. `01-definicion-proyecto.md` — qué es, para quién, etapas (MVP → MLP → MMP).
2. `02-especificacion-requisitos.md` — requisitos funcionales, no funcionales, actores, alcance.
3. `03-modelo-de-datos.md` — las tres entidades, el árbol de cuentas y el cuadre.
4. `04-tablero-kanban.md` — backlog del MVP por bloques.
5. `05-analisis-competencia.md` — estudio de "Registro Contable" (Money Manager) y diferenciación.

## Metodología

Kanban con previews iterativos, adaptado a freelance en solitario. Límite de trabajo en curso: 1–2 tarjetas a la vez. Las ideas nuevas fuera del MVP se difieren a MLP/MMP — no se agregan sobre la marcha.
