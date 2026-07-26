import { useState, useMemo } from "react";
import { TIPOS, esDebitoNormal, saldoCrudo, saldoCrudoConSub } from "../motor/motor.js";
import { CUENTAS_DEFAULT, TX_SEMILLA, fmtPEN as fmt } from "../datos/semillas.js";
import { confirmarPeligro, avisoExito, avisoError, pedirApertura } from "../ui/dialogos.js";
import { aperturaDe, aperturaSugerida, fechaSugerida, fijarApertura } from "../services/saldoApertura.js";
import { PageHeader, Panel, Aviso } from "./ui";
import { INSTRUMENTOS, tipoContableDe, inferirInstrumento, instrumentoDe } from "../datos/instrumentos.js";
import { Plus, Wallet, Pencil, Check, Eye, EyeOff, CornerDownRight, Landmark } from "lucide-react";

function BotonIcono({ onClick, titulo, icono: Icono }) {
  return (
    <button
      onClick={onClick}
      title={titulo}
      aria-label={titulo}
      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icono className="h-3.5 w-3.5" />
    </button>
  );
}

/* Bloque 2 — gestor de cuentas y árbol de categorías. */

const ETIQUETAS = {
  activo: "Cuentas · Activos (lo que tienes)",
  pasivo: "Cuentas · Pasivos (lo que debes)",
  patrimonio: "Patrimonio",
  ingreso: "Categorías de ingreso",
  gasto: "Categorías de gasto",
};
const OPCIONES_TIPO = [
  { v: "activo", t: "Activo (dónde tienes dinero)" },
  { v: "pasivo", t: "Pasivo (deudas)" },
  { v: "patrimonio", t: "Patrimonio" },
  { v: "ingreso", t: "Ingreso (categoría)" },
  { v: "gasto", t: "Gasto (categoría)" },
];
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function GestorCuentas({ cuentasData, transacciones, transaccionesTodas, setTransacciones }) {
  const [cuentasLocal, setCuentasLocal] = useState(CUENTAS_DEFAULT);

  const cuentas = cuentasData?.cuentas || cuentasLocal;
  const setCuentas = cuentasData?.setCuentas || setCuentasLocal;

  /* Los saldos salían de TX_SEMILLA, así que esta pantalla mostraba los
     importes de los datos de ejemplo en lugar de los del usuario. */
  const movimientos = useMemo(
    () => (transacciones ?? TX_SEMILLA).flatMap((t) => t.movimientos ?? []),
    [transacciones]
  );
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [idPadre, setIdPadre] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [mostrarOcultas, setMostrarOcultas] = useState(false);
  const [msg, setMsg] = useState("");
  const [instrumento, setInstrumento] = useState("cuenta-bancaria");

  const esCuentaDeDinero = tipo === "activo" || tipo === "pasivo";

  const padresPosibles = useMemo(() => cuentas.filter((c) => c.tipo === tipo && c.activa), [cuentas, tipo]);

  const grupos = useMemo(() => {
    const walk = (c, depth, acc) => {
      if (!c.activa && !mostrarOcultas) return;
      const hijos = cuentas.filter((h) => h.idPadre === c.id);
      acc.push({ cuenta: c, depth, tieneHijos: hijos.length > 0 });
      hijos.forEach((h) => walk(h, depth + 1, acc));
    };
    return TIPOS.map((t) => {
      const rows = [];
      cuentas.filter((c) => c.tipo === t && c.idPadre === null).forEach((c) => walk(c, 0, rows));
      return { tipo: t, rows };
    });
  }, [cuentas, mostrarOcultas]);

  function agregar() {
    setMsg("");
    const n = nombre.trim();
    if (!n) { setMsg("Escribe un nombre."); return; }
    const id = slug(n) + "-" + Date.now().toString(36);
    setCuentas((prev) => [
      ...prev,
      {
        id,
        nombre: n,
        tipo,
        idPadre: idPadre || null,
        activa: true,
        // Solo las cuentas de dinero tienen instrumento; una categoría de
        // gasto no es un banco ni una tarjeta.
        ...(esCuentaDeDinero ? { instrumento } : {}),
      },
    ]);
    setNombre(""); setIdPadre("");
  }
  function toggleActiva(id) {
    setCuentas((prev) => prev.map((c) => (c.id === id ? { ...c, activa: !c.activa } : c)));
  }
  function guardarEdit(id) {
    const n = editNombre.trim();
    if (n) setCuentas((prev) => prev.map((c) => (c.id === id ? { ...c, nombre: n } : c)));
    setEditId(null); setEditNombre("");
  }
  function agregarSubDe(cuenta) {
    setTipo(cuenta.tipo); setIdPadre(cuenta.id); setNombre("");
    setMsg(`Agregando subcategoría dentro de "${cuenta.nombre}".`);
  }

  /* La apertura no se puede inferir: solo el usuario sabe cuánto tenía antes
     de empezar a registrar. Se sugiere el importe que dejaría la cuenta en
     cero, pero lo confirma él. */
  async function abrirApertura(cuenta) {
    if (!setTransacciones) {
      avisoError("No disponible", "Esta pantalla no tiene acceso a las transacciones.");
      return;
    }

    const actual = aperturaDe(transaccionesTodas, cuenta.id);
    const sugerido = aperturaSugerida(transaccionesTodas, cuenta.id);
    const fecha = actual?.fecha?.slice(0, 10) || fechaSugerida(transaccionesTodas, cuenta.id);

    const { value } = await pedirApertura({
      cuenta,
      valorActual: actual?.apertura?.saldo ?? sugerido,
      fecha,
      sugerido,
    });
    if (value === undefined) return;

    setTransacciones((prev) =>
      fijarApertura(prev, {
        idCuenta: cuenta.id,
        saldo: value.saldo,
        fecha: new Date(value.fecha).toISOString(),
        cuentas,
      })
    );

    avisoExito(
      value.saldo ? "Saldo de apertura fijado" : "Apertura eliminada",
      value.saldo ? `${cuenta.nombre}: ${fmt.format(value.saldo)}` : cuenta.nombre
    );
  }

  async function restaurarPorDefecto() {
    const personalizadas = cuentas.filter((c) => !CUENTAS_DEFAULT.some((d) => d.id === c.id));
    const ok = await confirmarPeligro({
      titulo: "¿Restaurar el plan de cuentas?",
      html: `
        <p>Se volverá al plan de cuentas original.</p>
        <div class="balance-detalle">
          <strong>Se perderán ${personalizadas.length} cuenta${personalizadas.length === 1 ? "" : "s"} que creaste</strong>
          <div class="meta">${
            personalizadas.length
              ? personalizadas.slice(0, 5).map((c) => c.nombre).join(", ") +
                (personalizadas.length > 5 ? ` y ${personalizadas.length - 5} más` : "")
              : "No tienes cuentas personalizadas"
          }</div>
          <div class="meta">Tus transacciones no se borran, pero las que apunten a una cuenta eliminada quedarán sin categoría.</div>
        </div>`,
      confirmar: "Sí, restaurar",
    });
    if (!ok) return;
    setCuentas(CUENTAS_DEFAULT);
    setMsg("");
    avisoExito("Plan de cuentas restaurado");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        titulo="Cuentas y categorías"
        descripcion="Define dónde tienes el dinero y cómo clasificas tus movimientos"
        acciones={
          <>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={mostrarOcultas}
                onChange={(e) => setMostrarOcultas(e.target.checked)}
                className="accent-primary"
              />
              Mostrar ocultas
            </label>
            <button
              onClick={restaurarPorDefecto}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Restaurar por defecto
            </button>
          </>
        }
      />

      <Panel
        titulo="Agregar cuenta o categoría"
        subtitulo="Una categoría es una cuenta de tipo ingreso o gasto; puedes anidarla cuanto quieras"
        icono={Plus}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregar()}
              placeholder="Ej. Viajes"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => { setTipo(e.target.value); setIdPadre(""); }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {OPCIONES_TIPO.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {esCuentaDeDinero ? "Qué tipo de cuenta es" : "Dentro de (opcional)"}
            </label>
            {esCuentaDeDinero ? (
              <select
                value={instrumento}
                onChange={(e) => {
                  setInstrumento(e.target.value);
                  // El tipo contable lo decide el instrumento, no el usuario:
                  // una tarjeta de crédito siempre es deuda.
                  setTipo(tipoContableDe(e.target.value));
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {INSTRUMENTOS.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            ) : (
              <select
                value={idPadre}
                onChange={(e) => setIdPadre(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— Nivel principal —</option>
                {padresPosibles.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            )}
          </div>
        </div>

        {msg && <Aviso className="mt-3">{msg}</Aviso>}

        <button
          onClick={agregar}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </Panel>

      <Panel
        titulo="Tu árbol de cuentas"
        subtitulo="La etiqueta gris indica el tipo de cuenta: si el dinero está disponible o inmovilizado"
        icono={Wallet}
      >
        <div className="space-y-5">
          {grupos.map(({ tipo: t, rows }) => (
            <div key={t}>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {ETIQUETAS[t]}
              </p>
              {rows.length === 0 ? (
                <p className="py-1 text-sm text-muted-foreground/60">Sin cuentas</p>
              ) : (
                rows.map(({ cuenta, depth, tieneHijos }) => {
                  const crudo = tieneHijos
                    ? saldoCrudoConSub(cuenta.id, cuentas, movimientos)
                    : saldoCrudo(cuenta.id, movimientos);
                  const saldo = esDebitoNormal(cuenta.tipo) ? crudo : -crudo;

                  return (
                    <div
                      key={cuenta.id}
                      className={`group flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0 ${
                        cuenta.activa ? "" : "opacity-50"
                      }`}
                      style={{ paddingLeft: depth * 18 }}
                    >
                      <div className="min-w-0 flex-1">
                        {editId === cuenta.id ? (
                          <input
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && guardarEdit(cuenta.id)}
                            className="rounded border border-border bg-background px-2 py-1 text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className={`truncate text-sm ${depth === 0 ? "font-medium" : "text-muted-foreground"}`}>
                            {cuenta.nombre}
                            {(cuenta.tipo === "activo" || cuenta.tipo === "pasivo") && (
                              <span
                                className="ml-1.5 rounded border border-border px-1.5 py-0.5 text-xs font-normal text-muted-foreground"
                                title="Tipo de cuenta. Define si el dinero está disponible o inmovilizado; no es una etiqueta."
                              >
                                {instrumentoDe(inferirInstrumento(cuenta))?.nombre}
                              </span>
                            )}
                            {tieneHijos && (
                              <span className="text-xs font-normal text-muted-foreground"> · consolidado</span>
                            )}
                            {!cuenta.activa && (
                              <span className="text-xs text-muted-foreground"> (oculta)</span>
                            )}
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                        {fmt.format(saldo)}
                      </span>

                      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        {editId === cuenta.id ? (
                          <BotonIcono onClick={() => guardarEdit(cuenta.id)} titulo="Guardar" icono={Check} />
                        ) : (
                          <BotonIcono
                            onClick={() => { setEditId(cuenta.id); setEditNombre(cuenta.nombre); }}
                            titulo="Renombrar"
                            icono={Pencil}
                          />
                        )}
                        {(cuenta.tipo === "ingreso" || cuenta.tipo === "gasto") && (
                          <BotonIcono onClick={() => agregarSubDe(cuenta)} titulo="Añadir subcategoría" icono={CornerDownRight} />
                        )}
                        {(cuenta.tipo === "activo" || cuenta.tipo === "pasivo") && (
                          <BotonIcono
                            onClick={() => abrirApertura(cuenta)}
                            titulo="Saldo de apertura"
                            icono={Landmark}
                          />
                        )}
                        <BotonIcono
                          onClick={() => toggleActiva(cuenta.id)}
                          titulo={cuenta.activa ? "Ocultar" : "Mostrar"}
                          icono={cuenta.activa ? EyeOff : Eye}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
