# Balance — Tablero Kanban del MVP

> El backlog detrás del tablero. Cada bloque está ordenado por dependencia (lo de abajo necesita lo de arriba).
> Se puede copiar a Trello, GitHub Projects o Notion.

---

## Cómo se usa

- **Columnas:** Backlog → En curso → Preview cliente → Hecho.
- **Límite de trabajo en curso (WIP):** máximo 1–2 tarjetas "En curso" a la vez. Terminar antes de empezar otra. Es la regla que evita dispersarse.
- **Preview cliente:** al cerrar ciertos bloques hay algo demostrable. Ahí se hace una revisión (aunque el "cliente" seas tú en modo cliente) antes de seguir. Es tu método de previews iterativos.
- **Regla de alcance:** cualquier idea nueva que aparezca NO entra aquí; va a la tabla de diferidos de la especificación de requisitos con su etapa (MLP/MMP).

---

## Orden de construcción

### Bloque 1 — Fundación: motor de partida doble  *(empezar aquí — el corazón)*
Todo lo demás se apoya en esto. Sin motor que cuadre, la app no tiene sentido.
- [ ] Implementar el modelo de datos (Cuenta, Transacción, Movimiento) — *base del data model*
- [ ] Generar el asiento de partida doble automáticamente a partir de una transacción — **RF-05**
- [ ] Validar el cuadre (suma de movimientos = 0) y rechazar lo que no cuadre — **RF-06**
- [ ] Validar permanentemente la ecuación Activo = Pasivo + Patrimonio — **RF-11**

### Bloque 2 — Cuentas y árbol de categorías
- [ ] Crear cuenta indicando nombre y tipo — **RF-01**
- [ ] Editar / desactivar cuenta — **RF-02**
- [ ] Listar cuentas con su saldo — **RF-03**
- [ ] Crear categorías propias de ingreso/gasto — **RF-14**
- [ ] Organizar categorías en jerarquía (padre → hijo) con `id_padre` — **RF-15**
- [ ] Consolidar saldos de subcategorías hacia el padre — **RF-16**
- [ ] Sembrar categorías por defecto — **RF-17**
> **Preview cliente #1:** el usuario ya ve su árbol de cuentas y puede crear las suyas.

### Bloque 3 — Transacciones
- [ ] Registrar una transacción en lenguaje simple (de dónde sale, a dónde va) — **RF-04**
- [ ] Ver el historial de transacciones ordenado por fecha — **RF-07**
- [ ] Editar / eliminar una transacción y recalcular saldos — **RF-08**
> **Preview cliente #2:** el usuario ya puede registrar ingresos y gastos y verlos listados.

### Bloque 4 — Patrimonio neto y saldos
- [ ] Calcular y mostrar el patrimonio neto (Activos − Pasivos) en tiempo real — **RF-09**
- [ ] Mantener y mostrar el saldo actualizado de cada cuenta — **RF-10**
> **Preview cliente #3:** el bucle de valor está completo — registrar y ver el patrimonio real. *(Aquí el MVP ya "sirve".)*

### Bloque 5 — Persistencia local
- [ ] Guardar los datos entre sesiones (no perder información al cerrar) — **RF-12**

### Bloque 6 — Legal / cierre
- [ ] Mostrar el disclaimer educativo — **RF-13**
> **Preview final:** MVP terminado según la definición de "Terminado" de la especificación.

---

## Trazabilidad rápida

| Bloque | RFs cubiertos |
|--------|---------------|
| 1. Motor | RF-05, RF-06, RF-11 |
| 2. Cuentas y árbol | RF-01, RF-02, RF-03, RF-14, RF-15, RF-16, RF-17 |
| 3. Transacciones | RF-04, RF-07, RF-08 |
| 4. Patrimonio y saldos | RF-09, RF-10 |
| 5. Persistencia | RF-12 |
| 6. Legal | RF-13 |

Los 17 requerimientos funcionales quedan cubiertos por los 6 bloques.
