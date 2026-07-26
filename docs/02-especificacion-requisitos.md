# Balance — Especificación de Requisitos (MVP)

> **Documento de requisitos.** Define el alcance del MVP: qué **sí** hará y qué **no** hará.
> Su objetivo es darle una frontera clara al proyecto y un punto de "terminado".

---

## 1. Propósito y alcance de este documento

Este documento describe **qué debe hacer** el MVP de Balance (requisitos funcionales), **con qué cualidades** debe hacerlo (requisitos no funcionales) y **quién** interactúa con el sistema (actores). Todo lo que no esté aquí, **queda fuera del MVP** (ver sección 6), y se difiere a etapas MLP/MMP.

---

## 2. Actores

Un **actor** es cualquier persona o sistema externo que interactúa con la aplicación.

| Actor | Tipo | Descripción |
|-------|------|-------------|
| **Usuario** | Primario (humano) | La persona que gestiona sus finanzas personales. Único rol en el MVP. |
| **Motor contable** | Interno (no es actor) | Componente del propio sistema que genera y valida los asientos. Se documenta aparte porque es el corazón técnico, pero **no** es un actor externo. |

**Fuera de alcance como actores (por ahora):** administrador multiusuario, sistemas bancarios externos, servicios de impuestos. Documentarlos aquí es intencional: refuerza que el MVP es **de un solo usuario y local**.

---

## 3. Requerimientos funcionales (RF)

Lo que el sistema **debe hacer**. Cada uno tiene un ID para poder rastrearlo.

### Gestión de cuentas
- **RF-01** — El usuario puede crear una cuenta indicando nombre y tipo (Activo, Pasivo, Patrimonio, Ingreso o Gasto).
- **RF-02** — El usuario puede editar o desactivar una cuenta existente.
- **RF-03** — El usuario puede ver la lista de sus cuentas con el saldo actual de cada una.

### Registro de transacciones
- **RF-04** — El usuario puede registrar una transacción indicando monto, fecha, descripción, y de qué cuenta sale y a qué cuenta va (en lenguaje simple).
- **RF-05** — El sistema genera automáticamente el asiento de partida doble (debe/haber) a partir de esa transacción.
- **RF-06** — El sistema valida que cada asiento cuadre (debe = haber) y **rechaza** cualquiera que no cuadre.
- **RF-07** — El usuario puede ver el historial de transacciones ordenado por fecha.
- **RF-08** — El usuario puede editar o eliminar una transacción, y el sistema recalcula los saldos afectados.

### Cálculos y consultas
- **RF-09** — El sistema calcula y muestra el **patrimonio neto** (Activos − Pasivos) en tiempo real.
- **RF-10** — El sistema mantiene actualizado el saldo de cada cuenta tras cada movimiento.
- **RF-11** — El sistema valida permanentemente la ecuación **Activo = Pasivo + Patrimonio**.

### Persistencia y legal
- **RF-12** — Los datos persisten localmente entre sesiones; el usuario no pierde su información al cerrar la app.
- **RF-13** — La app muestra un disclaimer que la identifica como herramienta educativa y de registro, no asesoría financiera.

### Categorías definidas por el usuario
- **RF-14** — El usuario puede crear sus propias categorías de ingreso y gasto (que internamente son cuentas de tipo Ingreso o Gasto).
- **RF-15** — El usuario puede organizar sus categorías en jerarquía (categoría → subcategoría → …), con la profundidad que necesite.
- **RF-16** — El sistema consolida (suma) los saldos de las subcategorías hacia su categoría padre, permitiendo ver totales por rama del árbol.
- **RF-17** — La app siembra un conjunto de categorías por defecto para que el usuario no empiece con una pantalla en blanco.

---

## 4. Requerimientos no funcionales (RNF)

Lo que define **cómo** de bien debe comportarse el sistema (cualidades, no funciones).

- **RNF-01 — Usabilidad:** una persona **sin** conocimientos de contabilidad debe poder registrar una transacción sin necesidad de entender los términos "debe" y "haber". La complejidad contable queda oculta.
- **RNF-02 — Rendimiento:** los cálculos de saldos y patrimonio se actualizan de forma instantánea (percepción inmediata) incluso con cientos de transacciones.
- **RNF-03 — Integridad de datos:** el sistema **nunca** debe permitir un estado en que las cuentas no cuadren. Esta es la promesa central del producto.
- **RNF-04 — Portabilidad / Responsivo:** funciona en navegadores modernos, tanto en escritorio como en móvil.
- **RNF-05 — Mantenibilidad:** el código separa claramente el **motor contable** de la **interfaz**, para poder crecer a MLP/MMP sin reescribir el núcleo.
- **RNF-06 — Privacidad:** en el MVP los datos financieros se guardan solo en el dispositivo del usuario; no se envían a ningún servidor.
- **RNF-07 — Localización:** interfaz en español y formato de moneda local.

---

## 5. Funcionalidades por actor (casos de uso del MVP)

Qué puede lograr el **Usuario** con el sistema:

1. **Gestionar cuentas** — crear, editar y consultar sus cuentas y saldos. *(RF-01, RF-02, RF-03)*
2. **Registrar un movimiento** — anotar un ingreso o gasto y que el sistema arme el asiento correcto. *(RF-04, RF-05, RF-06)*
3. **Consultar su historial** — revisar y corregir transacciones pasadas. *(RF-07, RF-08)*
4. **Consultar su situación** — ver su patrimonio neto y el saldo de cada cuenta. *(RF-09, RF-10)*

---

## 6. Límite del alcance — Definición de "Terminado" del MVP

### ✅ Dentro del MVP
Registrar ingresos y gastos entre cuentas, generación y validación automática del asiento de partida doble, saldos por cuenta, patrimonio neto en tiempo real, persistencia local y disclaimer.

**El MVP está "terminado" cuando:** el usuario puede registrar sus movimientos, el sistema garantiza que todo cuadre siempre, y puede ver su patrimonio neto real. Ese es el bucle de valor mínimo.

### ❌ Fuera del MVP (diferido)
| Funcionalidad | Etapa destino |
|---------------|---------------|
| Gráficos y visualizaciones | MLP |
| Presupuesto por categoría | MLP |
| Evolución del patrimonio en el tiempo | MLP |
| Transacciones recurrentes / plantillas | MLP |
| Etiquetas transversales (tags) que cruzan categorías | MLP |
| Estados financieros formales (resultados, balance, flujo) | MMP |
| Inversiones con rentabilidad / múltiples divisas | MMP |
| Exportar reportes (PDF/CSV) | MMP |
| Multiusuario y backend en la nube | MMP |
| Conexión con bancos / impuestos | Fuera de roadmap |

> Regla de oro contra el "proyecto sin fin": si una idea nueva aparece durante el desarrollo, **no se agrega al MVP** — se anota en esta tabla con su etapa destino y se continúa.

---

## 7. Trazabilidad

Cada requerimiento funcional (RF-xx) debería convertirse luego en una o más tarjetas del tablero Kanban, para poder seguir el avance desde "requisito" hasta "entregado".
