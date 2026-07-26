# Balance — Registro Contable Personal

> **Documento de definición de proyecto y conocimiento del dominio**
> Funciona como requisitos informales (visión de desarrollador). Nombre "Balance" es provisional.
> Etapa del ciclo: Descubrimiento → Requisitos.

---

## 1. Resumen en una línea

Una app de finanzas personales construida sobre un **motor de contabilidad de partida doble** real, para personas que quieren llevar un registro riguroso y ver su patrimonio neto verdadero — no solo una lista de gastos con etiquetas.

---

## 2. Fase 1 — Descubrimiento (¿a quién le sirve?)

### Usuario objetivo (persona ficticia realista)

**"Daniel, 30 años, ordenado con su dinero."**
Tiene varias cuentas al mismo tiempo: cuenta de banco, algo de efectivo, una tarjeta de crédito y ahorros. Ya probó apps de gastos simples y le quedaron cortas: le dicen "gastaste X en comida", pero **no le dan una foto real de cuánto vale su patrimonio** ni de cómo se mueve el dinero entre sus cuentas. Quiere rigor, pero no sabe contabilidad formal y no quiere aprenderla.

### El problema

Las apps de gastos comunes tratan cada movimiento como un ítem suelto con una categoría. Eso sirve para "¿en qué gasto?", pero **no puede responder con certeza "¿cuánto tengo en total?"** ni garantizar que las cuentas cuadren. El dinero que sale de un lado tiene que entrar en otro, y las apps simples ignoran esa mitad de la historia.

### La oportunidad / diferenciador

Poner un **motor contable serio por debajo** y una **interfaz amigable por encima**. El usuario registra en lenguaje natural ("gasté 100 en el súper con mi tarjeta") y el motor arma el asiento balanceado por detrás. Resultado: reportes que **siempre cuadran** y un patrimonio neto confiable. Esto ya existe y es respetado (GnuCash, KMyMoney), lo que valida el nicho — pero casi siempre con interfaces anticuadas, lo que deja espacio para algo moderno y accesible.

---

## 3. Concepto del producto (las dos capas)

| Capa | Qué es | Quién la ve |
|------|--------|-------------|
| **Motor de partida doble** | La lógica contable rigurosa: cuentas, asientos balanceados, validación de que todo cuadre | Nadie (invisible) |
| **Interfaz de finanzas personales** | Registro simple, saldos, patrimonio neto, gráficos | El usuario |

El motor es el **centro técnico** del proyecto (equivalente a la lógica de ordenamiento del snowball). Es lo que hace que esta app valga como pieza de portafolio: demuestra que sabes modelar un sistema con reglas de negocio serias, no solo pintar formularios.

---

## 4. Fase 2 — Requisitos

### 4.1 Glosario del dominio

- **Ingreso**: dinero que entra (sueldo, ventas, intereses).
- **Gasto**: dinero que sale (comida, renta, servicios).
- **Activo**: lo que posees (efectivo, banco, ahorros, inversiones).
- **Pasivo**: lo que debes (tarjeta de crédito, préstamos).
- **Patrimonio neto**: Activos − Pasivos. El número que mide si progresas.
- **Cuenta**: contenedor de dinero o categoría (banco, efectivo, tarjeta, "comida", "sueldo").
- **Asiento / transacción**: un movimiento que toca dos cuentas y siempre cuadra.
- **Debe / Haber**: los dos lados de cada asiento; deben ser iguales.
- **Partida doble**: el principio de que cada movimiento afecta dos cuentas.

### 4.2 Los cinco tipos de cuenta

Todo se clasifica en uno de estos cinco tipos:

1. **Activo** — lo que tienes
2. **Pasivo** — lo que debes
3. **Patrimonio** — tu capital / punto de partida
4. **Ingreso** — lo que entra
5. **Gasto** — lo que sale

Y todo se sostiene sobre una ecuación que nunca se rompe:

> **Activo = Pasivo + Patrimonio**

### 4.3 El mecanismo (cómo funciona un asiento)

Cada transacción toca **dos cuentas** y ambos lados deben quedar iguales (debe = haber).

**Ejemplo 1 — Te pagan el sueldo (3000):**
- Banco (Activo) sube 3000
- Sueldo (Ingreso) sube 3000
- ✅ Cuadra

**Ejemplo 2 — Compras comida (100) con tarjeta:**
- Comida (Gasto) sube 100
- Tarjeta (Pasivo) sube 100
- ✅ Cuadra

Como cada movimiento está **obligado a cuadrar**, los reportes (patrimonio neto, ingresos vs gastos) salen automáticamente correctos y no pueden contradecirse. Eso es lo que una app de "lista + categorías" no puede garantizar.

### 4.4 Alcance por etapas

#### 🟢 MVP (Minimum Viable Product) — lo mínimo que ya sirve
- Crear cuentas de los cinco tipos (versión simple: banco/efectivo/tarjeta + categorías de ingreso y gasto)
- Registrar transacciones en lenguaje simple → el motor genera el asiento balanceado automáticamente
- Motor que **valida que todo cuadre** (Activo = Pasivo + Patrimonio)
- Ver **patrimonio neto actual** (Activos − Pasivos)
- Ver saldo por cuenta
- Lista/historial de transacciones
- Disclaimer educativo

#### 🔵 MLP (Minimum Lovable Product) — lo que lo hace agradable de usar
- Categorización y gráficos (ingresos vs gastos por mes)
- Presupuesto por categoría
- Evolución del patrimonio neto en el tiempo (gráfico de línea)
- Transacciones recurrentes y plantillas

#### 🟣 MMP (Minimum Marketable Product) — lo vendible
- Estados financieros formales: estado de resultados, balance general, flujo de efectivo
- Inversiones con rentabilidad / múltiples divisas
- Exportar reportes (PDF / CSV)
- Cuentas de usuario separadas (multi-usuario)

### 4.5 Fuera de alcance (por ahora)

- Conexión automática con bancos
- Cálculo de impuestos o asesoría tributaria
- App móvil nativa (se hará web primero)

### 4.6 Consideraciones legales

Posicionar **explícitamente como herramienta educativa y de registro personal**, no como asesoría financiera ni contable. Mismo criterio de disclaimer que usaste en la app de deudas.

---

## 5. Stack técnico

- **React** (framework principal)
- Almacenamiento local para el MVP (sin backend todavía); backend + base de datos en etapas MLP/MMP
- Librería de gráficos para las visualizaciones (etapa MLP)

---

## 6. Metodología de trabajo

- **Kanban con previews iterativos** (adaptado a freelance en solitario)
- Cada función del MVP entra como tarjeta; se muestra un preview al "cliente" (tú mismo en modo cliente ficticio) al cerrar cada bloque
- El ciclo de proyecto completo aplica: descubrimiento → requisitos → propuesta → contrato → desarrollo/pruebas/entrega → cierre con oferta de mantenimiento

---

## 7. Próximos pasos sugeridos

1. Validar/ajustar este documento (nombre, persona, alcance del MVP)
2. Diseñar el **modelo de datos** del motor (cuentas, transacciones, asientos)
3. Armar el tablero Kanban con las tarjetas del MVP
4. Empezar por el corazón: el motor de partida doble y su validación de cuadre
