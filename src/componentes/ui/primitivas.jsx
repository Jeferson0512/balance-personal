import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fmtPEN as fmt } from "../../datos/semillas.js";

/* Primitivas de layout compartidas por todos los módulos.

   Existen para que las pantallas no inventen cada una su cabecera, su tarjeta
   y su estado vacío: sin esto, cada módulo acaba con su propio espaciado y
   tipografía, y el conjunto se ve improvisado. */

/** Cabecera de pantalla. Una sola por vista, arriba del todo. */
export function PageHeader({ titulo, descripcion, acciones, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion && <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {(acciones || children) && (
        <div className="flex flex-wrap items-center gap-2">{acciones || children}</div>
      )}
    </div>
  );
}

/** Bloque de contenido. Sustituye a Card cuando solo hace falta un contenedor. */
export function Panel({ titulo, subtitulo, icono: Icono, acciones, className, children }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-4 md:p-5", className)}>
      {(titulo || acciones) && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              {Icono && <Icono className="h-4 w-4 shrink-0 text-muted-foreground" />}
              <span className="truncate">{titulo}</span>
            </h2>
            {subtitulo && <p className="mt-0.5 text-xs text-muted-foreground">{subtitulo}</p>}
          </div>
          {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Estado vacío. Siempre dice qué hacer, no solo que no hay nada. */
export function EstadoVacio({ icono: Icono, titulo, descripcion, accion, compacto = false }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg text-center",
        compacto ? "py-8" : "border border-dashed border-border py-12 px-6"
      )}
    >
      {Icono && <Icono className="h-7 w-7 text-muted-foreground/40" />}
      <p className="mt-3 text-sm font-medium">{titulo}</p>
      {descripcion && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{descripcion}</p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

/**
 * Variación con signo. `invertirColor` para métricas donde subir es malo
 * (gastos): la misma flecha arriba significa cosas opuestas según el dato.
 */
export function Delta({ valor, pct, sufijo, invertirColor = false, className }) {
  const sube = valor > 0;
  const neutro = Math.abs(valor) < 0.005;
  const bueno = invertirColor ? !sube : sube;
  const Icono = neutro ? Minus : sube ? TrendingUp : TrendingDown;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 text-xs", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium",
          neutro ? "text-muted-foreground" : bueno ? "text-emerald-600" : "text-rose-600"
        )}
      >
        <Icono className="h-3.5 w-3.5" />
        {neutro ? "Sin cambios" : `${sube ? "+" : "−"}${fmt.format(Math.abs(valor))}`}
        {pct != null && !neutro && Number.isFinite(pct) && (
          <span className="opacity-80">({Math.abs(pct).toFixed(1)}%)</span>
        )}
      </span>
      {sufijo && <span className="text-muted-foreground">{sufijo}</span>}
    </div>
  );
}

/** Cifra con etiqueta. Para rejillas de métricas. */
export function Metrica({ icono: Icono, etiqueta, valor, detalle, tono = "normal", className }) {
  const tonos = {
    normal: "",
    bueno: "text-emerald-600",
    malo: "text-rose-600",
    atenuado: "text-muted-foreground",
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icono && <Icono className="h-3.5 w-3.5" />}
        {etiqueta}
      </div>
      <div className={cn("mt-0.5 text-lg font-medium tabular-nums", tonos[tono])}>
        {typeof valor === "number" ? fmt.format(valor) : valor}
      </div>
      {detalle && <div className="text-xs text-muted-foreground">{detalle}</div>}
    </div>
  );
}

/** Grupo de botones excluyentes (periodos, filtros). */
export function GrupoBotones({ opciones, valor, onChange, className }) {
  return (
    <div className={cn("flex overflow-hidden rounded-lg border border-border", className)}>
      {opciones.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium transition-colors",
            valor === o.id
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Aviso inline. Sustituye a los divs de mensaje que cada módulo se inventaba. */
export function Aviso({ tipo = "info", children, className }) {
  const estilos = {
    info: "border-border bg-muted/50 text-foreground",
    exito: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    atencion: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-sm", estilos[tipo], className)}>
      {children}
    </div>
  );
}
