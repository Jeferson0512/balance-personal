# Contexto del proyecto — Balance

Contexto para el asistente. La documentación completa está en `docs/`.

**Lee primero:**
- `docs/07-bitacora-desarrollo.md` — decisiones, hallazgos y **errores ya
  cometidos**. Evita repetirlos.
- `docs/09-pendientes.md` — qué falta y cómo saber que está terminado.
- `docs/08-modelo-datos-explicado.md` — el porqué de cada tabla y columna.

## Skills — no son opcionales

En `.claude/skills/`. Se aplican solas según lo que se esté haciendo:

| Skill | Cuándo |
|---|---|
| `preparar-entorno` | Al clonar en una máquina nueva o si falla algo por dependencias. |
| `diseno-de-componentes` | Al crear o tocar **cualquier** componente de interfaz. |
| `cambio-de-modelo` | Al añadir, quitar o cambiar un campo, entidad o catálogo. |
| `mantener-documentacion` | Al **terminar** cualquier cambio. |

`diseno-de-componentes` solo se salta si el usuario pide un rediseño — y
entonces se actualiza la skill con las reglas nuevas, o el proyecto vuelve a
la incoherencia.

## Qué es

App de finanzas personales sobre un motor de **partida doble**. La rigurosidad
contable vive por debajo; la interfaz por encima es para alguien que no sabe
contabilidad.

## Stack y convenciones

- **React + Vite + Tailwind**. Datos en `localStorage`; migración a
  PostgreSQL preparada en `docs/06-esquema-base-datos.sql`.
- Interfaz en **español**. Moneda: soles (PEN).
- **El usuario nunca ve "debe" ni "haber".** Registra en lenguaje simple; el
  motor arma el asiento por detrás.

## Arquitectura — no negociable

```
motor/        Lógica contable pura. SIN React.
services/     Reglas de negocio. SIN React.
componentes/  Solo interfaz.
```

La UI importa de `motor/` y `services/`; **nunca al revés**. Si una regla de
negocio acaba dentro de un `.jsx`, está mal colocada: no se puede probar sin
montar React ni reutilizar desde otra pantalla. Ya pasó y hubo que
refactorizar (bitácora §1).

## Modelo de datos

- **Cuenta**: `id`, `nombre`, `tipo` (activo|pasivo|patrimonio|ingreso|gasto),
  `instrumento` (billetera|inversion|…, solo en cuentas de dinero), `idPadre`,
  `activa`. Las categorías SON cuentas de tipo ingreso/gasto.
- **Transacción**: `id`, `fecha`, `descripcion`, `contraparte`, `metadatos`,
  `eliminada` (borrado lógico). **No lleva importe**.
- **Movimiento**: `idCuenta`, `monto` (con signo), `nombreCuenta` (snapshot).

**Regla de oro:** para cada transacción, la suma de los `monto` = 0. Si no
cuadra, no se guarda. Convención interna: débito `+`, crédito `−`.

**Todo cálculo parte de `soloActivas()`.** Solo la Papelera ve las eliminadas.

## Regla de proceso: los cambios de modelo van en tres sitios

Si se toca la forma de los datos, se actualizan **los tres** en el mismo
cambio. Que uno quede atrás convierte la documentación en mentira, y una
documentación que miente es peor que no tenerla.

1. **El código** — `src/datos/`, `src/motor/`, `src/services/`
2. **El esquema SQL** — `docs/06-esquema-base-datos.sql` (tabla, columna,
   índice, restricción)
3. **La explicación** — `docs/08-modelo-datos-explicado.md`: qué es y **por
   qué existe**, no solo su tipo

Y al terminar algo de `docs/09-pendientes.md`, moverlo a "Lo que NO está
pendiente" en el mismo commit.

## Trampas conocidas

- **Import y uso en la MISMA edición.** Separarlos rompe el HMR de Vite: el
  build pasa en verde pero la pestaña del usuario queda colgada con
  `X is not defined`. Ocurrió dos veces (bitácora §4.1).
- **No copiar `.xlsx`/`.sqlite` dentro del proyecto.** El watcher de Vite
  muere con `EBUSY` si el archivo está abierto en Excel, y se lleva el dev
  server. Generar los datos de prueba en el navegador (bitácora §4.2).
- **Money Manager: importar del SQLite, nunca del Excel.** El Excel aplana las
  transferencias entre cuentas propias y descuadra todo (bitácora §5).
- **`alert()` no funciona**: el navegador lo bloquea. Usar `ui/dialogos.js`.

## Estado

MVP completo y funcionando con **1,760 transacciones reales** (mayo 2024 –
julio 2026). Ver `docs/09-pendientes.md` para lo que falta.

**Aviso:** `src/datos/historico.js` contiene movimientos financieros reales
con nombres de personas, y el repositorio es público.
