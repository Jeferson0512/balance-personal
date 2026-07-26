---
name: diseno-de-componentes
description: Usar SIEMPRE al crear o modificar cualquier componente de interfaz en Balance. Define el sistema de diseño (primitivas, tipografía, color, iconos, diálogos). Solo se salta si el usuario pide explícitamente un rediseño.
---

# Sistema de diseño

Estas reglas salieron de un rediseño concreto: la interfaz "parecía de novato"
porque cada pantalla inventaba su propio layout, sus tamaños y sus colores.
**No las saltes.**

Si el usuario pide un rediseño, primero se evalúa qué de esto sigue siendo
válido y **se actualiza esta skill** con las reglas nuevas. Cambiar el diseño
sin actualizar la skill devuelve el proyecto a la incoherencia.

## Usa las primitivas, no reinventes

Todo sale de `src/componentes/ui/primitivas.jsx`:

| Primitiva | Cuándo |
|---|---|
| `PageHeader` | **Una por vista**, siempre arriba. Título, descripción y acciones a la derecha. |
| `Panel` | Bloque de contenido. Sustituye a `Card` cuando solo hace falta un contenedor con título. |
| `EstadoVacio` | Cuando no hay datos. **Siempre dice qué hacer**, no solo que no hay nada. |
| `Delta` | Variación con signo. `invertirColor` para métricas donde subir es malo. |
| `Metrica` | Cifra con etiqueta, para rejillas de datos. |
| `GrupoBotones` | Opciones excluyentes (periodos, filtros). |
| `Aviso` | Mensaje inline. No inventes un `div` con fondo de color. |

Si algo se repite en dos pantallas, **es una primitiva**, no un copy-paste.

## Color

- **Solo con los tokens del tema**: `bg-card`, `text-muted-foreground`,
  `border-border`, `bg-primary`, `text-destructive`.
- **Nunca** `slate-*`, `bg-white`, `text-gray-*` ni hex sueltos. Rompen el
  modo oscuro, que ya está definido en `index.css` y funciona solo si todo usa
  tokens.
- **El color señala, no decora.** Verde y rojo se reservan para bien/mal. En
  gastos subir es malo; en ingresos subir es bueno: la misma flecha cambia de
  color según lo que signifique.

## Tipografía y espaciado

- Título de página: `text-xl font-semibold tracking-tight`
- Título de panel: `text-sm font-medium`
- **Cifras siempre con `tabular-nums`.** Sin eso los números no se alinean en
  columna y el conjunto parece una web cualquiera, no una app financiera.
- Padding de contenedor: `p-4 md:p-5`. Nunca `p-6`: descuadra con el resto.

## Iconos

- **Solo `lucide-react`.** Cero emojis en la interfaz: se ven distintos en
  cada sistema y gritan "prototipo".
- Excepción: los emojis en **datos del usuario** (sus categorías: `🍜 Comida`)
  se conservan. Son suyos, no decoración de la app.
- Tamaño: `h-4 w-4` en línea, `h-3.5 w-3.5` en botones de icono.

## Diálogos y avisos

- **Nunca `alert()` ni `confirm()`.** El navegador los bloquea y el mensaje no
  llega. Pasó de verdad: el aviso de "129 transacciones importadas" nunca se
  mostró.
- Usa `src/ui/dialogos.js`: `confirmarPeligro`, `confirmar`, `avisoExito`,
  `avisoError`, `avisoAtencion`.
- **Toda acción destructiva se confirma**, y el diálogo dice **qué se va a
  perder** — no un "¿estás seguro?" genérico:

```
¿Eliminar esta transacción?
  Almuerzo con Diana
  a Diana Cca
  17/5/2026 · S/ 44.00 · YAPE
  Irá a la papelera; podrás recuperarla.
```

- Éxito → toast (no bloquea). Validación de formulario → mensaje inline junto
  al campo, no un modal.
- **Que el diálogo no mienta.** Si hay papelera, no digas "no se puede
  deshacer".

## Datos y métricas

- **Una métrica sin comparación no informa.** Cada cifra principal lleva su
  variación respecto al periodo anterior.
- **Periodos naturales** (día, semana, mes, año), no ventanas móviles. Nadie
  presupuesta en "últimos 90 días".
- Anclar en el **último periodo con datos**, no en hoy: con un histórico
  antiguo, abrir en un mes vacío parece que la app está rota.

## Antes de dar por hecho un componente

1. `npm run build` sin errores
2. Probado en el navegador — que compile no significa que funcione
3. Sin `slate-*` ni `bg-white`: `grep -n 'slate-\|bg-white' archivo.jsx`
4. Tiene `PageHeader` si es una vista completa
5. Tiene `EstadoVacio` para el caso sin datos

## Trampa del entorno

**El import y su uso van en la MISMA edición.** Si añades primero el JSX que
usa un icono y luego el import, Vite empuja por HMR un módulo intermedio donde
el símbolo no existe: el componente lanza `ReferenceError`, React desmonta el
árbol y el HMR siguiente ya no se reaplica. El build pasa en verde y el error
solo existe en la pestaña del usuario.

Ocurrió dos veces (`entra`, `ArrowLeftRight`). Si ya pasó: `Ctrl+Shift+R`, no
busques el bug en el fuente.
