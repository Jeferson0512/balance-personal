# Balance

App de **finanzas personales** sobre un motor de **partida doble real**. No es
una lista de gastos con categorías: cada transacción es un asiento cuyos
movimientos suman cero, y eso se valida.

La rigurosidad contable vive por debajo; la interfaz por encima es para alguien
que no sabe contabilidad y nunca ve las palabras "debe" ni "haber".

**Stack:** React 18 + Vite 5 + Tailwind. Datos en `localStorage`; el esquema
para migrar a PostgreSQL está en `docs/06-esquema-base-datos.sql`.

---

## Empezar

```bash
git clone https://github.com/Jeferson0512/balance-personal.git
cd balance-personal

node --version     # requiere >= 18
npm install
npm run dev        # http://localhost:5173
```

Al abrirla sin datos guardados carga el histórico real de
`src/datos/historico.js`: **1.760 transacciones** de mayo 2024 a julio 2026.
No son datos de ejemplo — es el punto de partida del proyecto.

### Comandos

```bash
npm run dev                        # servidor de desarrollo
npm run build                      # build de producción
node scripts/exportar-a-sql.mjs    # volcar los datos al esquema SQL
```

No hay tests todavía (pendiente 6.2).

---

## Por dónde empezar a leer

Si acabas de clonar esto y no sabes nada del proyecto, **en este orden**:

| Documento | Qué te da |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Contexto, arquitectura y trampas conocidas. **Empieza aquí.** |
| [`docs/09-pendientes.md`](docs/09-pendientes.md) | Qué falta y **por dónde retomar**. |
| [`docs/07-bitacora-desarrollo.md`](docs/07-bitacora-desarrollo.md) | Decisiones y **errores ya cometidos**. Evita repetirlos. |
| [`docs/08-modelo-datos-explicado.md`](docs/08-modelo-datos-explicado.md) | Diagrama ER y el porqué de cada tabla y columna. |
| [`docs/06-esquema-base-datos.sql`](docs/06-esquema-base-datos.sql) | El esquema PostgreSQL. |

En `.claude/skills/` hay cuatro reglas del proyecto que se aplican solas:
preparación del entorno, diseño de componentes, cambios de modelo y
mantenimiento de la documentación.

Los documentos `01`–`05` son la planificación original (definición, requisitos,
modelo, kanban y análisis de la competencia). Siguen siendo válidos como
contexto, pero el estado real está en `07`, `08` y `09`.

---

## Estructura

```
balance/
├── .claude/skills/       Reglas del proyecto (se aplican solas)
├── docs/                 Planificación, esquema SQL, bitácora y pendientes
├── scripts/              Exportador a SQL
└── src/
    ├── motor/            Lógica contable pura. SIN React
    │   ├── motor.js        saldos, validarCuadre, construir.*
    │   └── asientos.js     de transacción de extracto a partida doble
    ├── services/         Reglas de negocio. SIN React
    │   ├── parseYAPE / parseBCP / parseMoneyManager
    │   ├── clasificador.js   quién es la contraparte
    │   ├── categorizador.js  en qué cuenta cae el gasto
    │   ├── deduplicator.js   qué ya existe
    │   ├── importador.js     orquesta el flujo
    │   ├── papelera.js       borrado lógico
    │   ├── cuotas.js         compras financiadas e ITF
    │   └── saldoApertura.js  punto de partida de cada cuenta
    ├── componentes/      Solo interfaz
    │   └── ui/             primitivas compartidas
    ├── datos/            Catálogos y el histórico real
    └── ui/               diálogos (SweetAlert2)
```

**La UI importa de `motor/` y `services/`; nunca al revés.** Si una regla de
negocio acaba dentro de un `.jsx`, está mal colocada.

---

## Qué hace hoy

**Contabilidad**
- Partida doble con validación de cuadre en cada asiento
- Plan de cuentas jerárquico; las categorías son cuentas de ingreso/gasto
- Tipos de instrumento (billetera, inversión, tarjeta…) separados del tipo
  contable: permite distinguir dinero **disponible** de **invertido**
- Saldos de apertura editables por cuenta

**Importación**
- **YAPE** (Excel) — detecta si la contraparte es persona, servicio o comercio
- **BCP** (PDF cifrado con el DNI del titular)
- **Money Manager** (SQLite) — la app desde la que se migró el histórico
- Deduplicación por huella, con rescate manual de lo descartado
- Detecta traspasos entre cuentas propias: sin eso, moverse dinero del PLIN al
  YAPE se contaba como ingreso e inflaba el total un 25%

**Interfaz**
- Dashboard con periodos naturales navegables (día, semana, mes, año)
- Cada métrica con su variación frente al periodo anterior
- Papelera: nada se borra de verdad; limpieza por año
- Historial con filtros por texto, cuenta y rango de fechas

## Qué falta

Lo principal: asignar etiquetas a transacciones, edición completa de
movimientos, interfaz para compras en cuotas, y la migración a base de datos.

Lista completa con prioridades y criterios de cierre en
[`docs/09-pendientes.md`](docs/09-pendientes.md).

---

## Aviso sobre los datos

`src/datos/historico.js` contiene **movimientos financieros reales** con
nombres de personas. Este repositorio es **público**: esa información es
visible para cualquiera y permanece en el historial de git.

Los extractos bancarios (`*.xlsx`, `*.sqlite`, `EECC*.pdf`) están excluidos en
`.gitignore` para que no acaben publicados por accidente.
