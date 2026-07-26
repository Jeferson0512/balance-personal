---
name: mantener-documentacion
description: Usar SIEMPRE al terminar cualquier cambio en Balance (funcionalidad, corrección de bug, refactor o decisión de diseño). Mantiene sincronizados los pendientes, la bitácora y el contexto del proyecto.
---

# Mantener la documentación al día

La documentación de `docs/` no es un extra que se escribe al final del
proyecto: es lo que permite que otra persona —u otra sesión— retome el trabajo
sin reconstruir el razonamiento desde cero.

Un documento desactualizado **es peor que no tenerlo**, porque el siguiente
confía en él.

## Antes de dar por terminado un cambio

Recorre esta lista. No es opcional.

### 1. `docs/09-pendientes.md`

- **¿El cambio cierra un pendiente?** Muévelo a la sección
  **"Lo que NO está pendiente"** del final. Esa sección existe para que nadie
  rehaga algo por no saber que ya está.
- **¿Lo cierra a medias?** Reescribe el punto con lo que queda. No lo borres:
  *"resuelto el mecanismo, falta el dato"* es información útil.
- **¿El cambio destapó trabajo nuevo?** Añádelo, con su prioridad y su
  criterio de **"terminado cuando"**. Un pendiente sin criterio de cierre es
  un deseo, no una tarea.

### 2. `docs/07-bitacora-desarrollo.md`

Añade una entrada si el cambio:

- **Corrigió un bug con enseñanza.** Qué fallaba, por qué, y la regla que
  evita repetirlo. Los bugs documentados en §3 se encontraron ejecutando
  código a mano; que estén escritos vale más que el propio arreglo.
- **Tomó una decisión de diseño** con alternativas descartadas. Registra
  **por qué se descartó la otra**, que es lo que nadie recuerda seis meses
  después.
- **Reveló una trampa del entorno** (una herramienta que se comporta de forma
  inesperada). Va a §4, "errores de proceso".

### 3. `CLAUDE.md`

Actualízalo si cambia:
- El estado del proyecto (qué está hecho, qué es lo siguiente)
- Una convención o regla de arquitectura
- Una trampa conocida que otro asistente debería evitar

Es lo primero que se lee al abrir el repo. Si dice algo falso, el daño se
multiplica.

### 4. Modelo de datos

Si tocaste campos o entidades, aplica la skill **cambio-de-modelo**: esquema
SQL y `docs/08-modelo-datos-explicado.md` van en el mismo cambio.

## Cómo escribir

- **El porqué antes que el qué.** El código ya dice qué hace; la
  documentación existe para lo que el código no puede contar.
- **Casos concretos, no genéricos.** *"Efectivo salía en −S/2.532 porque su
  saldo de apertura no existía"* enseña; *"gestión de saldos iniciales"* no.
- **Sin adjetivos de venta.** Nada de "potente", "robusto", "completo".
- **Si algo está construido pero sin interfaz, dilo.** Ya pasó dos veces en
  este proyecto. Verificar que la lógica funciona **no equivale** a que el
  usuario pueda usarla.

## Al hacer commit

El mensaje explica **la decisión**, no solo el cambio. Compara:

```
✗ Añade campo apertura_de_cuenta
✓ Saldos de apertura editables por cuenta

  Un extracto trae movimientos, nunca cuánto había antes de empezar.
  Sin apertura, una cuenta con historia previa queda en negativo:
  Efectivo salía en -S/2.532 solo por eso.
```

Si el cambio toca documentación, va en el mismo commit que el código. Separar
"código" y "docs" en dos commits garantiza que uno de los dos se quede atrás.
