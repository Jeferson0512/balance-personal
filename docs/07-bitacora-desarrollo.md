# Bitácora de desarrollo

Registro de decisiones, hallazgos y errores del desarrollo de Balance.
Escrito para que quien retome el proyecto entienda **por qué** está hecho así
y no repita lo que ya costó descubrir.

Sesión documentada: **26 de julio de 2026**.

---

## Qué es Balance

App de finanzas personales con **partida doble real**. React + Vite +
Tailwind, datos en `localStorage` (con migración a base de datos preparada en
`docs/06-esquema-base-datos.sql`).

Lo que la separa de una app de gastos corriente: cada transacción es un
asiento cuyos movimientos **suman cero**, y eso se valida. No es purismo
contable — es lo que hizo visibles errores que de otro modo habrían pasado
desapercibidos (ver §3).

---

## 1. Arquitectura

```
src/
  motor/        Lógica contable pura. SIN React, sin imports de UI.
    motor.js       saldos, validarCuadre, construir.{gasto,ingreso,transferencia}
    asientos.js    generarAsiento: de transacción de extracto a partida doble
  services/     Reglas de negocio. Sin React.
    parseYAPE / parseBCP / parseMoneyManager    lectura de extractos
    clasificador.js    quién es la contraparte (persona/servicio/comercio/propia)
    categorizador.js   en qué cuenta cae el gasto
    deduplicator.js    qué ya existe
    importador.js      orquesta el flujo completo
    papelera.js        borrado lógico
    cuotas.js          compras financiadas e ITF
  componentes/  Solo interfaz.
  datos/        Catálogos y datos semilla.
```

**Regla que costó una corrección:** la lógica de negocio no vive en los
componentes. En una primera versión, `generarMovimientos`, `determinarCuentaGasto`
y `resolverCuenta` estaban dentro de `GestorImportaciones.jsx`. Consecuencia
concreta: no se podía probar la generación de asientos sin montar React, y
cualquier otra pantalla que importara habría tenido que duplicarlas.

El usuario lo detectó preguntando *"¿por qué todo lo colocas en transacción y
no en motor?"*. Tenía razón. Se refactorizó a `motor/asientos.js`,
`services/categorizador.js` e `services/importador.js`. La prueba de que
sirvió: ahora la importación completa se puede ejecutar desde la consola sin
renderizar nada.

---

## 2. Decisiones de modelo

### La contraparte es un campo, no una cuenta

Se evaluó convertir cada persona (Diana, Noelia…) en una cuenta del plan
contable, que permitiría ver saldos por persona. Se descartó: con **66
contrapartes distintas, 46 de una sola aparición**, el plan de cuentas se
vuelve inmanejable. Se guarda como campo con tipo y se filtra por texto.

### Tipo de instrumento, separado del tipo contable

Tomado de Money Manager. `YAPE` y `Tyba` son ambos `activo`, pero uno es
dinero disponible hoy y el otro está invertido. Sin esa segunda dimensión no
se puede responder *"¿cuánto tengo disponible?"*. Ver `datos/instrumentos.js`.

El tipo contable **se deduce del instrumento**: si eliges "Tarjeta de crédito",
la cuenta va a pasivo aunque no sepas contabilidad.

### Snapshot de nombres

Cada movimiento guarda `nombreCuenta` tal como se llamaba al registrarlo. Si
renombras "Comida" a "Alimentación", el histórico recuerda el nombre de
entonces; el cálculo sigue usando `idCuenta`. Es lo que hace Money Manager
con `ASSET_NIC` / `CATEGORY_NAME`.

### Borrado lógico

Nada se destruye: se marca (`eliminada`). Todo cálculo parte de
`soloActivas()`; solo la vista Papelera ve lo eliminado. Un borrado
accidental de 129 movimientos importados no puede ser irreversible.

---

## 3. Errores encontrados en el propio código

Estos son bugs reales que estuvieron en el repositorio. Se documentan porque
cada uno enseña algo.

### 3.1 Las transacciones importadas no tenían `id`

`handleImportar` construía el objeto sin `id`. Pero el historial hace
`eliminar(id)` → `filter(t => t.id !== id)`. Con `id === undefined`, **borrar
una habría borrado las 129**.

**Lección:** todo registro necesita identidad antes de guardarse. El `id` se
deriva del fingerprint (`tx-yape-60d3f3483097`), así que es estable entre
reimportaciones.

### 3.2 Movimientos apuntando a cuentas inexistentes

`generarMovimientos` buscaba una cuenta "YAPE" que no estaba en
`CUENTAS_DEFAULT` y caía a `"yape-default"`, `"gasto-general"` — claves que no
existían. Efecto: el historial mostraba **"?"** y el Dashboard **ignoraba
todos los gastos importados** (seguía en S/1,830) mientras los ingresos se
metían todos en "Sueldo".

**Lección:** un fallback a una clave inventada descuadra el balance en
silencio. Ahora `resolverCuenta()` cae a una cuenta real del mismo tipo.

### 3.3 La deduplicación contra el historial nunca funcionó

El chequeo comparaba `t.monto === transaccion.monto`, pero **una transacción
guardada no tiene `monto`** — tiene `movimientos`. Siempre `false`.
Consecuencia: reimportar el mismo archivo habría **duplicado todo el
historial**. Se comprobó: con las 129 ya importadas, volvía a decir "129
nuevas".

Ahora se compara por `metadatos.fingerprint`.

### 3.4 Los duplicados internos borraban también el original

Cuando el extracto traía N filas idénticas, **las N se descartaban**,
incluida la primera. Si pagaste dos pasajes de S/2.50 el mismo día a la misma
persona, ambos desaparecían.

Ahora solo se marcan las posteriores (`primeraIgual < indice`). Y el motivo se
distingue: *"Ya la importaste antes"* vs *"Idéntica a otra fila del mismo
archivo (#N)"*.

### 3.5 La vista previa mostraba algo distinto de lo que se guardaba

`descripcionDe` y `contraparteDe` vivían dentro de `GestorImportaciones` y solo
corrían **al confirmar**. La preview leía los campos crudos por su cuenta.
El usuario aprobaba una cosa y se guardaba otra — que es exactamente lo que
una preview no debe permitir.

Se extrajeron a `services/normalizarTx.js`, usado por ambas pantallas.

### 3.6 Cuentas mostraba saldos de datos de ejemplo

`GestorCuentas` calculaba desde `TX_SEMILLA` (las transacciones hardcodeadas
de demostración) en lugar de las del usuario. Los importes de esa pantalla
nunca fueron reales.

### 3.7 S/1,910 contados como ingreso

9 transacciones de `PLIN - Jeferson fredy Bujaico Rodriguez` — el propio
titular — se registraban como ingreso. Eran traspasos entre cuentas propias.
Inflaban los ingresos un **25%**.

Se resolvió con `esTitular()`, que compara por tokens normalizados. Dos
detalles que hicieron falta:

- **Exigir coincidencia de ≥2 tokens.** `PLIN - FREDY BUJAICO` es un familiar,
  no el titular; con un solo apellido daba falso positivo.
- **Comprobar "es servicio" ANTES que "es titular".** Pagar el propio recibo
  de Entel figura como `Pagaste el servicio de JEFERSON FREDY BUJAI` pero es
  un gasto, no un traspaso. Al revés se perdían S/222.70.

---

## 4. Errores de proceso (no del código)

### 4.1 Editar el uso de un símbolo antes que su declaración

Ocurrió **dos veces**: `entra is not defined` y `ArrowLeftRight is not defined`.
En ambos casos el código final era correcto y `npm run build` pasaba en verde;
el error solo existía en el navegador del usuario.

**Causa:** con Vite + HMR, si se añade primero el uso y en una edición
posterior el import, Vite empuja un módulo intermedio donde el símbolo no
existe. El componente lanza `ReferenceError`, React desmonta el árbol y **el
HMR siguiente ya no se reaplica solo**.

**Regla:** el import (o la declaración) y su uso van en la MISMA edición. Si
ya ocurrió: `Ctrl+Shift+R`, no buscar el bug en el fuente.

### 4.2 Copiar archivos de prueba dentro del proyecto mata el dev server

Copiar un `.xlsx` a la raíz del proyecto hizo que el watcher de Vite intentara
vigilarlo. Como el archivo estaba abierto en Excel, dio `EBUSY: resource busy
or locked` y **mató el proceso entero**, no solo el watch.

**Alternativa:** generar el archivo de prueba en el navegador con
`await import('/node_modules/xlsx/xlsx.mjs')` e inyectarlo al input con
`DataTransfer`. Para probar solo lógica, importar el módulo por HTTP:
`await import('/src/services/deduplicator.js')`.

### 4.3 Construir un servicio no es terminar la funcionalidad

Pasó con el clasificador y con `cuotas.js`: código construido, probado y sin
interfaz durante toda una tanda. Verificar que la lógica funciona no equivale
a que el usuario pueda usarla.

---

## 5. Formatos de importación

### YAPE (Excel)

Cabeceras **en la fila 5**, no en la 1: fila 1 título, 2-4 vacías. El parser
busca la cabecera en las primeras 10 filas por palabras clave.

YAPE codifica el tipo de contraparte en el formato del nombre:

| Formato | Tipo | Ejemplo |
|---|---|---|
| termina en `*` | persona (apellido enmascarado) | `Diana Cca*` |
| `PLIN - NOMBRE` | persona vía PLIN | `PLIN - ROSA QUISPE` |
| `Pagaste el servicio de X` | servicio; **la entidad va en el MENSAJE** | mensaje: `Caja Huancayo - Pago de Crédito` |
| razón social / mayúsculas | comercio | `CONSORCIO MEDITERRANEO S.A.C.` |
| `RETIRO DE EFECTIVO` | retiro | — |
| `Nuevo número` | recarga | — |

### BCP (PDF)

Cifrado con el **DNI del titular**. `pdfjs-dist` lo abre pasando `password` a
`getDocument`. Una versión anterior de la documentación decía que era
imposible; era incorrecto.

Dos detalles:
- El worker se importa **local** con `?url` de Vite. Apuntando a un CDN, el
  parseo fallaba antes de llegar siquiera al cifrado.
- `PasswordException.code`: 1 = falta contraseña, 2 = incorrecta.

Los patrones que leen la tabla son **especulativos** — se escribieron sin ver
un PDF real. Si no reconoce movimientos, el error adjunta `error.muestra` con
las primeras líneas extraídas para ajustarlos.

### Money Manager (app coreana)

**El export a Excel está incompleto: no exportar desde ahí.**

Money Manager usa partida simple. Sus transferencias entre cuentas propias
viven en `INOUTCOME` con `DO_TYPE` 3 y 4 (las dos patas, ligadas por
`txUidTrans`). El Excel las aplana en un gasto suelto: sale dinero de BCP
hacia Chanchito Interbank y solo se registra la salida.

Síntoma: patrimonio de **−S/18,837**. Regenerado desde el SQLite: **+S/1,633**.

| | Excel | SQLite |
|---|---|---|
| Transferencias | perdidas | 96 completas |
| Patrimonio | −18,837 ❌ | +1,633 ✅ |

**Trampa:** `DO_TYPE` se devuelve como **texto**, no como entero. Comparar
`do == 3` sin `int()` hace que todo caiga en la rama de gasto.

Otros campos útiles de su esquema: `CARDDIVIDMONTH` (cuotas), `txUidFee`
(comisión ligada), `IS_DEL` (borrado lógico), `SMS_ORIGIN` (su importación
real es leer los SMS del banco).

---

## 6. Decisiones de interfaz

### Periodos naturales, no ventanas móviles

El dashboard usaba "30 días / 3 meses / 6 meses". No responde a *"¿cómo voy?"*:
nadie presupuesta en ventanas deslizantes. Se cambió a **Día / Semana / Mes /
Año / Todo**, navegables con `‹ ›`, y cada cifra se compara con el mismo
periodo anterior.

El gráfico mensual muestra **siempre 12 meses**, aunque se filtre por uno: una
sola barra no informa, y su valor está en comparar con los vecinos.

Se ancla en el **último mes con datos**, no en hoy: con un histórico antiguo,
abrir en un mes vacío parece que la app está rota.

### Toda métrica lleva comparación

Un número solo no dice si vas bien. Y el color señala, no decora: en gastos
subir es malo (rojo), en ingresos subir es bueno (verde) — la misma flecha
cambia de color según lo que signifique.

### Diálogos

`alert()` nativo **no funciona**: el navegador lo bloquea (`Page dialog
suppressed`). El aviso de "129 transacciones importadas" nunca se mostró.
Sustituido por SweetAlert2 (`ui/dialogos.js`), tematizado con las variables
CSS del proyecto para que el modo oscuro funcione solo.

Cinco acciones destruían datos **sin confirmar**, incluida "Restaurar por
defecto" que borraba el plan de cuentas entero de un clic.

---

## 6.bis Fin de la sesión del 26 de julio

El desarrollo se detuvo porque la máquina se quedaba en otra ubicación. **Todo
quedó commiteado y publicado** en `github.com/Jeferson0512/balance-personal`;
no hay trabajo a medias sin guardar.

Lo que estaba a punto de empezarse y no se hizo: **las etiquetas** (pendiente
2.4). Se pueden crear pero no asignar a ninguna transacción, así que la
pantalla no sirve de nada. La propuesta de etiquetas iniciales basada en los
datos reales está registrada ahí, sin implementar.

Para retomar, ver la sección "Por dónde retomar" de
[`09-pendientes.md`](09-pendientes.md).

---

## 7. Estado actual

**Funcionando con interfaz:**
importación YAPE / BCP / Money Manager · deduplicación con rescate manual ·
papelera con limpieza por año · dashboard con periodos navegables ·
tipos de instrumento · diálogos de confirmación.

**Construido y probado, SIN interfaz:**
`services/cuotas.js` — `generarCuotas` (reparte céntimos en la última cuota:
33.33+33.33+**33.34**=100 exacto), `generarComision` (ITF), `cuotasPendientes`.
Falta el formulario y el panel de pendientes.

**Pendiente conocido:**
- La cuenta Efectivo sale en **−S/2,532**: Money Manager nunca guardó el saldo
  de apertura, solo los movimientos. Hay que registrarlo como transacción
  inicial cuando se sepa la cifra real.
- Migración a base de datos: esquema en `docs/06-esquema-base-datos.sql`,
  exportador en `scripts/exportar-a-sql.mjs`.

---

## 8. Datos

`src/datos/historico.js` contiene **1,760 transacciones reales**
(mayo 2024 – julio 2026) migradas desde Money Manager: 1,555 gastos,
109 ingresos, 96 transferencias. Cuadre global verificado.

Se regenera desde el SQLite, **nunca desde el Excel** (§5).

`VERSION_DATOS` en `App.jsx`: subir ese número descarta lo guardado en
`localStorage` y recarga el histórico del repo. Es la vía para reemplazar
datos sin pedir al usuario que limpie el navegador.

> **Aviso de privacidad.** Este archivo contiene movimientos financieros
> reales con nombres de personas. Si el repositorio es público, esa
> información queda expuesta de forma permanente en el historial de git.
