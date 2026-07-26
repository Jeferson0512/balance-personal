# Balance — Análisis de competencia

> Estudio del competidor de referencia más directo: **Money Manager** (Realbyte Inc.), conocido en español como **"Registro Contable"**.
> Parte de la fase de descubrimiento. Sirve para posicionar Balance y detectar oportunidades reales de diferenciación.

---

## 1. Qué es

Money Manager, de la empresa surcoreana Realbyte Inc., es una app de finanzas personales lanzada en 2012, disponible en Android e iOS, con más de 20 millones de descargas. En español se distribuye como "Registro Contable". Es el referente más directo de Balance: hace exactamente lo que definimos — **finanzas personales sobre un motor de partida doble** — y es de las más populares del mundo en su categoría.

**Conclusión clave:** la existencia y popularidad de esta app **valida la dirección de Balance**. No estamos inventando un nicho raro; estamos entrando a uno probado.

---

## 2. Cómo funciona por dentro

- **Separa cuentas de categorías**, igual que el modelo de datos de Balance. Por un lado las "cuentas" (dónde vive el dinero: banco, efectivo, tarjeta); por otro las categorías de ingreso y gasto.
- **Partida doble automática, ocultando el debe/haber.** Al registrar un ingreso, lo deposita en una cuenta; al registrar un gasto, lo saca de una cuenta; las transferencias se generan solas. El usuario nunca gestiona débitos ni créditos — es idéntico al enfoque de nuestro motor y a nuestro RNF-01.
- **Jerarquía de categorías limitada a dos niveles** (categoría principal → subcategoría), y **las subcategorías vienen desactivadas por defecto**: hay que habilitarlas en configuración.

---

## 3. El hallazgo más valioso: valida la distinción jerarquía vs etiquetas

En los foros de la app, los usuarios "hackean" el sistema porque les falta justo lo que a nosotros nos interesa:

- Uno usa el campo de nota/contenido como **etiqueta de personas** para ver cuánto gasta con cada amigo, y pide un gráfico por ese campo.
- Otro mete **comercios como subcategorías** (el mismo comercio bajo dos categorías distintas) y pide un campo de comercios que aparezca en las estadísticas.

Esto es exactamente el problema de "jerarquía vs etiquetas transversales" que ya habíamos identificado: la gente necesita etiquetas que cruzan categorías (personas, comercios), y termina forzando la jerarquía o abusando de un campo libre porque la app no se las da con estadísticas. **Es una oportunidad de diferenciación validada por usuarios reales.**

---

## 4. Funciones que mapean a nuestro roadmap

Casi todo lo que ofrece cae en nuestras etapas MLP/MMP, lo que confirma que escalonamos bien:

| Función de Money Manager | Etapa equivalente en Balance |
|--------------------------|------------------------------|
| Presupuestos semanales/mensuales/anuales | MLP |
| Gráficos y estadísticas por categoría | MLP |
| Transacciones recurrentes | MLP |
| Gestión de tarjetas (fecha de pago, saldo pendiente) | MMP |
| Multi-moneda | MMP |
| Exportar / respaldo (Excel, Drive) | MMP |
| Gestor por PC (vía WiFi) | fuera de roadmap |

---

## 5. Debilidades y huecos (oportunidades para Balance)

- **Interfaz poco intuitiva:** crítica recurrente de los usuarios. Es potente pero no del todo práctica para quien no sabe de finanzas.
- **Sin etiquetas transversales reales con estadísticas** (ver sección 3).
- **Mobile-first:** su fuerte es la app móvil; el enfoque web es un espacio menos cubierto.

---

## 6. Qué nos llevamos para el MVP

1. **Nuestra arquitectura es sólida:** coincide con la de la app líder (cuentas + categorías + partida doble automática). Vamos bien encaminados.
2. **Lección de UX — revelar la complejidad de a pocos:** ellos siembran categorías por defecto y esconden las subcategorías hasta que el usuario las pide. Aplicaremos lo mismo (RF-17 + no forzar el árbol profundo).
3. **Profundidad del árbol:** el líder se queda en 2 niveles a propósito. Mantenemos el modelo con profundidad libre (con `id_padre`, cuesta lo mismo), pero **sin invertir la UI en anidamiento profundo** — la mayoría de usuarios no lo necesita.
4. **Diferenciador reservado:** las etiquetas transversales con estadísticas (MLP) son nuestro gancho frente a este competidor.

> Nota de expectativas: el objetivo de Balance no es superar una app con 20M de descargas, sino demostrar metodología y un motor correcto. Este análisis existe para posicionarnos y afilar decisiones, no para competir de frente.
