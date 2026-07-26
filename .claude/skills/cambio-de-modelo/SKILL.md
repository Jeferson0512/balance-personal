---
name: cambio-de-modelo
description: Usar SIEMPRE que se añada, elimine o modifique un campo, tabla, catálogo o entidad del modelo de datos de Balance. Garantiza que código, esquema SQL y documentación queden sincronizados en el mismo cambio.
---

# Cambio de modelo de datos

Un cambio de modelo toca **tres sitios**. Que uno quede atrás convierte la
documentación en mentira, y una documentación que miente es peor que no
tenerla: el siguiente que llegue confiará en ella.

## Antes de tocar nada

Pregúntate si el dato debe ser **estático o editable por el usuario**. Un
catálogo hardcodeado (una lista en un `.js`) solo se justifica si el usuario
nunca necesitará añadir un valor. Si puede necesitarlo, va en datos.

Regla práctica: si es algo que existe en el mundo real y varía por persona
(instituciones, tipos de cuenta, categorías), **debe poder crearse desde la
app**.

## Los tres sitios

### 1. Código

- `src/datos/` — catálogos y semillas
- `src/motor/` — si afecta al cálculo contable
- `src/services/` — si afecta a importación o clasificación
- Migración: si el campo es nuevo, ¿qué pasa con los datos ya guardados?
  Subir `VERSION_DATOS` en `App.jsx` fuerza recarga, pero **borra lo que el
  usuario haya creado**. Preferir migración incremental cuando haya datos
  propios en juego.

### 2. Esquema SQL — `docs/06-esquema-base-datos.sql`

- La columna, con su tipo y su `CHECK` si aplica
- El índice, si se va a filtrar por ahí
- Comentario diciendo **por qué existe**, no qué es

### 3. Explicación — `docs/08-modelo-datos-explicado.md`

- Fila en la tabla de la entidad correspondiente
- El **porqué**, con el caso concreto que lo motivó
- Actualizar el diagrama Mermaid si cambia una entidad o relación

## Al terminar

- Si cierra un punto de `docs/09-pendientes.md`, moverlo a **"Lo que NO está
  pendiente"** en el mismo commit
- Si el hallazgo enseña algo (un bug, una trampa), anotarlo en
  `docs/07-bitacora-desarrollo.md`
- `npm run build` y probar en el navegador antes de dar nada por hecho

## Comprobación

```bash
# El esquema menciona el campo nuevo
grep -n "nombre_del_campo" docs/06-esquema-base-datos.sql

# La explicación también
grep -n "nombre_del_campo" docs/08-modelo-datos-explicado.md
```

Si alguno no devuelve nada, el cambio está incompleto.
