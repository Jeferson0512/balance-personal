---
name: preparar-entorno
description: Usar al clonar Balance en una máquina nueva, o cuando falle un comando por dependencias ausentes. Verifica qué hay instalado antes de instalar nada y explica qué se sube al repositorio y qué no.
---

# Preparar el entorno

## Qué está en el repositorio y qué no

**Se sube todo, incluidos los ocultos.** `.claude/` con sus skills, `.gitignore`,
la configuración: son parte del proyecto y hacen que otra máquina se comporte
igual que esta.

**No se sube** lo que se regenera o lo que no debe salir de la máquina:

| Excluido | Por qué |
|---|---|
| `node_modules/` | Se reconstruye con `npm install`. Pesa cientos de MB y depende del sistema operativo. |
| `dist/` | Salida del build; se regenera con `npm run build`. |
| `*.xlsx`, `*.sqlite`, `EECC*.pdf` | **Extractos bancarios.** Sin esta regla, dejar un estado de cuenta en la carpeta y hacer `git add -A` lo publica. El histórico ya migrado vive en `src/datos/historico.js`. |
| `.env` | Credenciales. |

`package-lock.json` **sí se sube**: es lo que garantiza que la otra máquina
instale exactamente las mismas versiones.

## Al clonar en una máquina nueva

**Verificar antes de instalar.** No lances `npm install` a ciegas: si la
versión de Node no sirve, fallará a medias y dejará el árbol de dependencias
en un estado confuso.

### 1. Comprobar qué hay

```bash
node --version    # requiere >= 18 (el proyecto se desarrolló en 24)
npm --version
git --version
```

Si Node falta o es anterior a 18, instalarlo o actualizarlo **antes** de
seguir. En Windows: [nodejs.org](https://nodejs.org) o `winget install OpenJS.NodeJS.LTS`.

### 2. Comprobar si ya está instalado

```bash
# Si existe y coincide con package.json, no hace falta reinstalar
ls node_modules/.package-lock.json 2>/dev/null && echo "ya instalado"
```

### 3. Instalar

```bash
npm install     # respeta package-lock.json
```

`npm ci` es más estricto y rápido, pero borra `node_modules` entero: úsalo
solo en CI o si la instalación quedó corrupta.

### 4. Arrancar

```bash
npm run dev     # http://localhost:5173
npm run build   # comprobar que compila
```

## Qué esperar la primera vez

Al abrir la app sin datos guardados, carga el histórico real de
`src/datos/historico.js`: **1.760 transacciones** de mayo 2024 a julio 2026.
No es un error ni datos de ejemplo — es el punto de partida del proyecto.

Si hace falta descartar lo guardado en el navegador y recargar ese histórico,
subir `VERSION_DATOS` en `src/App.jsx`.

## Trampas conocidas

**No copies archivos `.xlsx` o `.sqlite` dentro del proyecto.** El watcher de
Vite intenta vigilarlos y, si están abiertos en Excel, lanza
`EBUSY: resource busy or locked` que **mata el dev server entero**, no solo el
watch.

Para probar importaciones, genera el archivo en el navegador:

```js
const XLSX = await import('/node_modules/xlsx/xlsx.mjs');
// … construir la hoja e inyectarla al <input type=file> con DataTransfer
```

Para probar solo lógica, importa el módulo por HTTP desde la consola:

```js
const { deduplicarTransacciones } = await import('/src/services/deduplicator.js');
```

**En Windows, `import()` dinámico en scripts de Node exige una URL `file://`.**
Una ruta suelta falla con `ERR_UNSUPPORTED_ESM_URL_SCHEME`. Usa
`pathToFileURL()` — ver `scripts/exportar-a-sql.mjs`.

## Comandos del proyecto

```bash
npm run dev                        # servidor de desarrollo
npm run build                      # build de producción
node scripts/exportar-a-sql.mjs    # volcar los datos a SQL
```

No hay tests todavía (pendiente 6.2 en `docs/09-pendientes.md`).
