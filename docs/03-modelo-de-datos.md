# Balance — Modelo de Datos (MVP)

> Cómo se representan por dentro las cuentas, las categorías (que son cuentas) y los asientos de partida doble.
> Aquí se resuelve el "mundo entero de categorías": con una sola idea, el árbol jerárquico.

---

## 1. La idea clave: todo es una "cuenta"

No hay una entidad "categoría" separada. En partida doble, **las categorías son cuentas**:

- "Banco", "Efectivo" → cuentas de tipo **Activo**
- "Tarjeta de crédito" → cuenta de tipo **Pasivo**
- "Sueldo" → cuenta de tipo **Ingreso**
- "Comida", "Comida → Restaurantes" → cuentas de tipo **Gasto**

Como cada cuenta puede apuntar a una **cuenta padre**, el árbol de categorías/subcategorías sale automáticamente, con la profundidad que el usuario quiera.

### Ejemplo del árbol (plan de cuentas)

```
Mis cuentas
├── Activo
│   ├── Banco
│   └── Efectivo
├── Pasivo
│   └── Tarjeta de crédito
├── Patrimonio
│   └── Saldo inicial
├── Ingreso
│   ├── Sueldo
│   └── Otros ingresos
└── Gasto
    ├── Vivienda
    │   ├── Renta
    │   └── Servicios
    ├── Comida
    │   ├── Supermercado
    │   └── Restaurantes
    └── Transporte
```

Todo ese "mundo" es **un solo árbol de cuentas**. Agregar una subcategoría nueva es solo crear una cuenta con su `id_padre` apuntando a la de arriba.

---

## 2. Las tres entidades

### 2.1 Cuenta

Representa tanto las cuentas "reales" (banco, tarjeta) como las categorías. Es lo que forma el árbol.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | identificador | Único |
| `nombre` | texto | Ej. "Restaurantes" |
| `tipo` | enum | Activo, Pasivo, Patrimonio, Ingreso, Gasto |
| `id_padre` | referencia a Cuenta (puede ser nulo) | Su cuenta padre en el árbol. Nulo = raíz de su rama |
| `activa` | booleano | Para ocultar sin borrar |

> El campo `id_padre` es **auto-referenciado** (una Cuenta apunta a otra Cuenta). Eso es todo lo que se necesita para tener jerarquía de profundidad libre.

### 2.2 Transacción

El evento que ve el usuario ("Almuerzo del martes"). Agrupa los movimientos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | identificador | Único |
| `fecha` | fecha | Cuándo ocurrió |
| `descripcion` | texto | Ej. "Almuerzo con amigos" |

### 2.3 Movimiento (las líneas de partida doble)

Cada transacción se descompone en **dos o más** movimientos que deben cuadrar. Aquí vive la partida doble.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | identificador | Único |
| `id_transaccion` | referencia a Transacción | A qué transacción pertenece |
| `id_cuenta` | referencia a Cuenta | Qué cuenta afecta |
| `monto` | número | Positivo o negativo (ver regla de cuadre) |

---

## 3. La regla de oro (el cuadre)

> **Para cada transacción, la suma de los montos de todos sus movimientos debe ser 0.**

Eso es la partida doble expresada en una sola línea. Ahí se cumplen **RF-06** (rechazar lo que no cuadre) y **RNF-03** (integridad de datos). Si la suma no da 0, la transacción no se guarda.

### Ejemplo concreto

Transacción: *"Almuerzo, 40, pagado con tarjeta"*

| Movimiento | Cuenta | Tipo de cuenta | Monto |
|-----------|--------|----------------|-------|
| 1 | Restaurantes | Gasto | +40 |
| 2 | Tarjeta de crédito | Pasivo | −40 |
| | | **Suma** | **0 ✅** |

El usuario solo escribió "gasté 40 en un restaurante con la tarjeta". El motor armó los dos movimientos por detrás. El usuario nunca vio las palabras "debe" ni "haber" (cumpliendo **RNF-01**).

---

## 4. Cómo se calculan los saldos

- **Saldo de una cuenta** = suma de los `monto` de todos sus movimientos.
- **Saldo de una categoría padre** = su saldo propio **+** el de todas sus subcategorías (se recorre el árbol hacia abajo). Esto cumple **RF-16**: puedes ver cuánto gastaste en "Comida" en total, o abrir la rama y ver "Restaurantes" vs "Supermercado".
- **Patrimonio neto** = Σ (cuentas Activo) − Σ (cuentas Pasivo).

---

## 5. Notas de diseño

- **Semillas por defecto (RF-17):** al iniciar, se crea un árbol base (como el del ejemplo) para que el usuario no arranque vacío. Él puede renombrar, borrar y agregar.
- **Profundidad libre:** al usar `id_padre`, permitir 2 o 6 niveles cuesta prácticamente lo mismo. No hay que fijar un límite artificial.
- **Etiquetas (tags):** las variables *transversales* que cruzan categorías (ej. "reembolsable", "viaje 2026") **no** van en este árbol. Serán una entidad aparte (relación muchos-a-muchos con Transacción) y se difieren a **MLP**, para no inflar el MVP.
- **Separación motor/UI (RNF-05):** estas tres entidades y la regla de cuadre son el "motor". La interfaz se construye encima sin tocar esta lógica.

---

## 6. Resumen de relaciones

```
Cuenta ──(id_padre)──> Cuenta        (el árbol jerárquico)
Transacción ──1 a N──> Movimiento    (una transacción, varios movimientos)
Movimiento ──N a 1──> Cuenta         (cada movimiento afecta una cuenta)
```
