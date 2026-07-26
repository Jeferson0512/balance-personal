import { useMemo, useState } from "react";
import { Trash2, RotateCcw, CalendarX, ShieldAlert } from "lucide-react";
import { PageHeader, Panel, EstadoVacio, Metrica } from "./ui";
import { fmtPEN as fmt } from "../datos/semillas.js";
import { confirmarPeligro, avisoExito } from "../ui/dialogos.js";
import {
  soloActivas, soloEliminadas, lotesEliminados, marcarEliminadas,
  restaurar, purgar, aniosDisponibles, idsDelAnio,
} from "../services/papelera.js";

/* Papelera y limpieza por periodo.

   Nada se borra de verdad hasta que se vacía la papelera: un borrado masivo
   sin vuelta atrás es inaceptable cuando lo que se pierde son meses de
   movimientos importados. */

export default function Papelera({ transacciones, setTransacciones }) {
  const [expandido, setExpandido] = useState(null);

  const eliminadas = useMemo(() => soloEliminadas(transacciones), [transacciones]);
  const lotes = useMemo(() => lotesEliminados(transacciones), [transacciones]);
  const anios = useMemo(() => aniosDisponibles(transacciones), [transacciones]);
  const totalEnPapelera = eliminadas.reduce(
    (s, t) => s + Math.abs(t.movimientos?.[0]?.monto ?? 0),
    0
  );

  async function borrarAnio(anio, cuantas) {
    const ok = await confirmarPeligro({
      titulo: `¿Enviar ${anio} a la papelera?`,
      html: `
        <div class="balance-detalle">
          <strong>${cuantas} transacci${cuantas === 1 ? "ón" : "ones"} de ${anio}</strong>
          <div class="meta">Dejarán de contar en saldos y gráficos.</div>
          <div class="meta">Podrás recuperarlas desde la papelera.</div>
        </div>`,
      confirmar: `Enviar ${anio} a la papelera`,
    });
    if (!ok) return;

    const ids = idsDelAnio(transacciones, anio);
    setTransacciones(marcarEliminadas(transacciones, ids, `Limpieza de ${anio}`));
    avisoExito(`${ids.length} transacciones a la papelera`, `Año ${anio}`);
  }

  function restaurarLote(lote) {
    setTransacciones(restaurar(transacciones, lote.ids));
    avisoExito(`${lote.ids.length} transacciones restauradas`);
  }

  async function purgarLote(lote) {
    const ok = await confirmarPeligro({
      titulo: "¿Borrar definitivamente?",
      html: `
        <div class="balance-detalle">
          <strong>${lote.ids.length} transacciones</strong>
          <div class="meta">${lote.motivo || "Eliminadas manualmente"}</div>
          <div class="meta">Esto sí es irreversible.</div>
        </div>`,
      confirmar: "Borrar para siempre",
    });
    if (!ok) return;
    setTransacciones(purgar(transacciones, lote.ids));
    avisoExito(`${lote.ids.length} transacciones borradas definitivamente`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        titulo="Papelera y limpieza"
        descripcion="Recupera lo borrado o vacía periodos completos"
      />

      <Panel titulo="Limpiar por año" icono={CalendarX}>
        {anios.length === 0 ? (
          <EstadoVacio compacto titulo="No hay transacciones activas" />
        ) : (
          <div className="space-y-2">
            {anios.map(({ anio, n }) => (
              <div
                key={anio}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <span className="font-medium">{anio}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {n} transacci{n === 1 ? "ón" : "ones"}
                  </span>
                </div>
                <button
                  onClick={() => borrarAnio(anio, n)}
                  className="shrink-0 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  Enviar a papelera
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        titulo="Papelera"
        icono={Trash2}
        subtitulo={eliminadas.length ? `${fmt.format(totalEnPapelera)} en total` : undefined}
      >
        {lotes.length === 0 ? (
          <EstadoVacio
            compacto
            icono={Trash2}
            titulo="La papelera está vacía"
            descripcion="Lo que elimines aparecerá aquí y podrás recuperarlo."
          />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Metrica etiqueta="Transacciones" valor={String(eliminadas.length)} />
              <Metrica etiqueta="Importe" valor={totalEnPapelera} tono="atenuado" />
            </div>

            {lotes.map((lote) => (
              <div key={lote.clave} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      {lote.motivo || "Eliminadas manualmente"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(lote.fecha).toLocaleString("es-ES", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                      {" · "}
                      {lote.ids.length} transacci{lote.ids.length === 1 ? "ón" : "ones"}
                      {" · "}
                      {fmt.format(lote.total)}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => restaurarLote(lote)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                    </button>
                    <button
                      onClick={() => purgarLote(lote)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" /> Borrar ya
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setExpandido(expandido === lote.clave ? null : lote.clave)}
                  className="mt-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  {expandido === lote.clave ? "Ocultar detalle" : "Ver qué contiene"}
                </button>

                {expandido === lote.clave && (
                  <ul className="mt-2 space-y-1 border-t border-border pt-2">
                    {eliminadas
                      .filter((t) => lote.ids.includes(t.id))
                      .slice(0, 12)
                      .map((t) => (
                        <li key={t.id} className="flex justify-between gap-2 text-xs">
                          <span className="truncate text-muted-foreground">{t.descripcion}</span>
                          <span className="shrink-0 tabular-nums">
                            {fmt.format(Math.abs(t.movimientos?.[0]?.monto ?? 0))}
                          </span>
                        </li>
                      ))}
                    {lote.ids.length > 12 && (
                      <li className="text-xs text-muted-foreground">
                        …y {lote.ids.length - 12} más
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
