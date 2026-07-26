# Pendientes

Estado al **26 de julio de 2026**. Complementa la
[bitácora](07-bitacora-desarrollo.md), que documenta lo ya hecho y los errores
cometidos.

Cada punto lleva **por qué importa** y **cómo saber que está terminado**. Sin
eso, un backlog es una lista de deseos.

---

## Aviso: construido ≠ terminado

Hay lógica probada que **no tiene interfaz**. Ya pasó dos veces en el proyecto
(el clasificador y `cuotas.js`): se construye el servicio, se verifica, y
queda inerte porque nadie puede invocarlo desde la pantalla.

Verificar que la lógica funciona **no equivale** a que el usuario pueda usarla.
Un pendiente solo se cierra cuando se puede hacer desde la app.

---

## Prioridad 1 — Datos incorrectos ahora mismo

### 1.1 Fijar el saldo de apertura de las cuentas restantes

**Resuelto el mecanismo.** Hay un botón por cuenta en *Cuentas* que fija el
saldo de apertura: genera un asiento contra patrimonio, sugiere el importe que
dejaría la cuenta en cero y permite corregirlo o quitarlo.

**Falta el dato.** Solo el titular sabe cuánto tenía realmente antes de empezar
a registrar. Efectivo necesita ~S/2.532 según la sugerencia, pero hay que
confirmar la cifra real; lo mismo al importar un extracto que empieza a mitad
de la historia.

**Terminado cuando:** ninguna cuenta de activo muestra saldo negativo sin
motivo real.

---

### 1.2 Los patrones del PDF de BCP no están verificados

**Qué pasa:** el desbloqueo por contraseña funciona y está probado. Lo que
**no** se ha verificado nunca es la lectura de la tabla: los regex se
escribieron sin haber visto un estado de cuenta real de BCP.

**Qué hacer:** abrir un `EECC.pdf` real. Si no reconoce movimientos, el error
adjunta `error.muestra` con las primeras líneas extraídas — con eso se ajustan
los patrones en una pasada.

**Terminado cuando:** un extracto real de BCP se importa completo y los saldos
cuadran contra el PDF.

---

## Prioridad 2 — Funcionalidad a medio camino

### 2.1 Compras en cuotas: falta la interfaz

**Estado:** `services/cuotas.js` construido y probado.
`generarCuotas` reparte los céntimos en la última cuota
(`33.33 + 33.33 + 33.34 = 100.00` exacto), `generarComision` liga el ITF a su
origen, `cuotasPendientes` responde *"quedan 2 de 3, faltan S/66.67"*.

**Falta:**
- Formulario de compra financiada (importe, número de cuotas, tarjeta)
- Panel de cuotas pendientes en el Dashboard: sin verlo, no sirve de nada
  saber cuánto debes antes de comprometerte a otra compra
- Campo de comisión/ITF al registrar un movimiento

**Terminado cuando:** se puede registrar una compra a 12 meses desde la app y
las 12 cuotas aparecen en el calendario con su fecha real.

---

### 2.2 Editar una transacción solo cambia el monto

**Qué pasa:** `guardarEdit` recalcula los movimientos con un factor, pero no
permite tocar descripción, fecha, categoría ni contraparte.

**Por qué importa:** hay 1,760 transacciones importadas con categorización
automática. **S/1,236 cayeron en "Gastos varios"** — la categoría más grande.
Sin edición completa no hay forma de corregirlo.

**Terminado cuando:** desde el historial se puede cambiar cualquier campo de
una transacción, incluida su categoría y su contraparte.

---

### 2.3 Historial de importaciones y deshacer

**Qué pasa:** cada transacción guarda `archivoOrigen` e `importadoEl`, pero
**nada los usa**. La papelera permite borrar por año, no por importación.

**Por qué importa:** es la red de seguridad antes de importar en masa. Si una
importación de 800 movimientos sale mal, hoy hay que localizarlos a mano.

**Falta:** vista con los lotes de importación (fuente, archivo, fecha, total)
y un botón para revertir uno completo. La tabla `importacion` del esquema ya
lo contempla.

**Terminado cuando:** se puede deshacer una importación entera desde la app.

---

### 2.4 Las etiquetas no se pueden asignar

**Qué pasa:** se crean, se listan y se borran, pero **no hay forma de marcar
una transacción con una etiqueta** desde el historial. El modelo lo soporta
(`tx.etiquetas`), la interfaz no.

Es el diferenciador que la documentación del proyecto reservaba para el MLP y
sigue sin existir.

**Terminado cuando:** se puede etiquetar desde la fila de una transacción y
filtrar el historial por etiqueta.

---

## Prioridad 3 — Que el sistema aprenda

### 3.1 Reglas de categorización editables

**Qué pasa:** el categorizador adivina por palabras clave y por institución
detectada. Cuando se equivoca, no hay forma de corregirlo de forma
persistente: la siguiente importación repite el error.

**Qué hacer:** motor de reglas al estilo Firefly III —
*"si la contraparte contiene X → categoría Y"*— editable por el usuario. La
tabla `regla_categorizacion` ya está diseñada, con `prioridad` para resolver
conflictos.

**Terminado cuando:** corregir la categoría de una transacción ofrece crear la
regla, y esa regla se aplica en la siguiente importación.

---

### 3.2 Aprender de las correcciones

Paso siguiente al anterior: usar las correcciones del usuario como datos de
entrenamiento. Es lo que hace `smart_importer` de Beancount con scikit-learn.

**No antes que 3.1.** El patrón que siguen los proyectos serios es reglas
explícitas primero, aprendizaje después: un modelo opaco que se equivoca y no
se puede corregir es peor que ninguna automatización.

---

## Prioridad 4 — Módulos que ignoran el trabajo hecho

Presupuestos, Recurrencias, Etiquetas y Gráficos **no conocen** `contraparte`,
`metadatos` ni `instrumento`. Se escribieron antes y nadie los actualizó.

Concretamente:

| Módulo | Qué le falta |
|---|---|
| **Presupuestos** | Solo calcula el mes actual (`fecha.startsWith(mesActual)`). No sirve para revisar meses pasados ni para el histórico. |
| **Gráficos** | Duplica cálculos que el Dashboard ya hace mejor. Debería consumir las mismas funciones o desaparecer. |
| **Recurrencias** | No genera automáticamente: hay que aplicarlas a mano. |
| **Etiquetas** | Ver 2.4. |

**Terminado cuando:** ningún módulo recalcula por su cuenta lo que ya resuelve
`motor/` o `services/`.

---

## Prioridad 5 — Interfaz

- **Motor** y **Legal** no tienen `PageHeader`; son las dos únicas vistas sin
  cabecera consistente.
- Los `Card` internos de Presupuestos, Etiquetas y Recurrencias siguen sin
  migrar a `Panel`.
- **Modo oscuro**: las variables CSS están definidas y todos los componentes ya
  usan tokens del tema, pero **falta el interruptor**. Está a un `classList`
  de funcionar y nadie lo ha probado.
- **Responsive**: el rediseño se verificó en escritorio. Las tablas anchas y
  los gráficos no se han probado en móvil.

---

## Prioridad 6 — Infraestructura

### 6.1 Migración a base de datos

**Listo:** esquema en [`06-esquema-base-datos.sql`](06-esquema-base-datos.sql),
exportador en `scripts/exportar-a-sql.mjs` (probado con 1,760 transacciones y
223 cuentas).

**Falta todo lo demás:** backend, API, autenticación, y decidir el hosting.
Mientras tanto `localStorage` tiene un límite de ~5 MB — con 1,760
transacciones se va cerca de 2 MB. **No aguanta otro año de datos.**

**Terminado cuando:** la app lee y escribe contra la base y `localStorage`
queda solo como caché.

---

### 6.2 Sin tests automatizados

No hay ni uno. Los bugs de la bitácora (§3) se encontraron ejecutando código a
mano en la consola del navegador.

**Lo mínimo que debería tener test:**
- `validarCuadre` y `construir.*` — el invariante del sistema
- `esTitular` — con los casos que ya fallaron: `PLIN - FREDY BUJAICO` **no** es
  el titular, `Pagaste el servicio de JEFERSON…` **no** es traspaso
- `deduplicarTransacciones` — repetidas dentro del archivo vs ya en historial
- `generarCuotas` — que los céntimos sumen exacto

**Terminado cuando:** `npm test` corre y esos casos están cubiertos.

---

### 6.3 Agregación bancaria por API

La banca peruana no ofrece OFX/QFX al retail: solo PDF y Excel. Por eso hay
parsers.

**[Belvo](https://belvo.com)** es el referente en LatAm y cubre bancos
peruanos: devolvería transacciones en JSON sin parsear nada. Tiene tier
gratuito de desarrollo.

**Implica** manejar credenciales bancarias vía OAuth, lo que es una decisión
de producto y de seguridad, no solo técnica. No abordar sin pensarlo.

---

## Deuda técnica menor

- `GraficosFinancieros` y `DashboardFinanciero` duplican lógica de agregación.
- `TX_SEMILLA` sigue en `semillas.js` aunque ya no es el punto de partida; lo
  importan `GestorTransacciones`, `GestorCuentas` y `MotorBench` como fallback.
- **El bundle pesa 2.6 MB**, más 1.1 MB del worker de `pdfjs`. Medido, no
  estimado. `historico.js` solo ya son **1.4 MB** y se incluye entero en el
  bundle principal.

  Tres frentes, por orden de rentabilidad:
  1. `pdfjs` debería cargarse bajo demanda, solo al subir un PDF
  2. El histórico debería servirse como JSON aparte, no compilado en el JS
  3. Dividir en chunks (`manualChunks`), que Vite ya viene avisando en cada build

  Con 1,760 transacciones ya es incómodo. Con dos años más será inaceptable, y
  conecta con 6.1: el mismo dato pesa lo mismo en `localStorage`.

---

## Lo que NO está pendiente

Para que nadie lo rehaga por no saber que ya está resuelto:

- Partida doble con validación de cuadre
- Importación YAPE (Excel) y Money Manager (SQLite)
- BCP: desbloqueo por contraseña (la lectura de tabla sí está pendiente, §1.2)
- Deduplicación por fingerprint, con rescate manual de descartadas
- Detección de traspasos entre cuentas propias
- Clasificación de contraparte: persona / servicio / comercio / propia
- Borrado lógico con papelera y limpieza por año
- Snapshot de nombres de cuenta
- Tipos de instrumento y separación disponible / invertido
- Dashboard con periodos naturales navegables (día, semana, mes, año)
- Diálogos de confirmación en todas las acciones destructivas
- Saldos de apertura por cuenta, editables desde la interfaz
