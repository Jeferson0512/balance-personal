import { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft,
  Users, Minus, PiggyBank,
} from "lucide-react";
import { patrimonioNeto, saldoCrudo, saldoCrudoConSub, esDebitoNormal } from "../motor/motor.js";
import { fmtPEN as fmt } from "../datos/semillas.js";
import { esLiquido, inferirInstrumento } from "../datos/instrumentos.js";

/* Dashboard financiero.

   Criterio de diseño: una métrica sin comparación no informa. Cada cifra
   principal lleva su variación respecto al periodo anterior, y el color se
   reserva para señalar (bien / mal), nunca para decorar. */

const PERIODOS = [
  { id: "1m", label: "30 días", dias: 30 },
  { id: "3m", label: "3 meses", dias: 90 },
  { id: "6m", label: "6 meses", dias: 180 },
  { id: "todo", label: "Todo", dias: null },
];

// Paleta para categorías: tonos distinguibles sin saturar la vista.
const COLORES = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#6366f1", "#84cc16"];

const fmtCompacto = (n) =>
  Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));

export default function DashboardFinanciero({ transacciones, cuentas }) {
  /* Con un histórico antiguo, arrancar en "3 meses" muestra la pantalla en
     cero y parece que la app está rota. Se elige el periodo más corto que
     tenga datos. */
  const periodoInicial = useMemo(() => {
    const hoy = Date.now();
    const encontrado = PERIODOS.find(
      (p) =>
        p.dias &&
        transacciones.some((t) => hoy - new Date(t.fecha).getTime() <= p.dias * 86400000)
    );
    return encontrado?.id || "todo";
  }, [transacciones]);

  const [periodo, setPeriodo] = useState(periodoInicial);

  const movimientos = useMemo(() => transacciones.flatMap((t) => t.movimientos), [transacciones]);
  const { activos, pasivos, neto } = useMemo(
    () => patrimonioNeto(cuentas, movimientos),
    [cuentas, movimientos]
  );

  const tipoDeCuenta = useMemo(() => {
    const mapa = {};
    cuentas.forEach((c) => (mapa[c.id] = c.tipo));
    return mapa;
  }, [cuentas]);

  const desde = useMemo(() => {
    const dias = PERIODOS.find((p) => p.id === periodo)?.dias;
    if (!dias) return null;
    const d = new Date();
    d.setDate(d.getDate() - dias);
    return d;
  }, [periodo]);

  const enRango = useMemo(
    () => (desde ? transacciones.filter((t) => new Date(t.fecha) >= desde) : transacciones),
    [transacciones, desde]
  );

  /* Flujo del periodo y del periodo anterior de la misma duración: sin el
     anterior no hay con qué comparar. */
  const flujo = useMemo(() => {
    const sumar = (lista) => {
      let ingresos = 0, gastos = 0;
      lista.forEach((t) =>
        t.movimientos.forEach((m) => {
          const tipo = tipoDeCuenta[m.idCuenta];
          if (tipo === "ingreso") ingresos += Math.abs(m.monto);
          else if (tipo === "gasto") gastos += Math.abs(m.monto);
        })
      );
      return { ingresos, gastos };
    };

    const actual = sumar(enRango);
    if (!desde) return { ...actual, previo: null };

    const dias = PERIODOS.find((p) => p.id === periodo).dias;
    const inicioPrevio = new Date(desde);
    inicioPrevio.setDate(inicioPrevio.getDate() - dias);
    const previo = sumar(
      transacciones.filter((t) => {
        const f = new Date(t.fecha);
        return f >= inicioPrevio && f < desde;
      })
    );

    return { ...actual, previo };
  }, [enRango, transacciones, desde, periodo, tipoDeCuenta]);

  /* Serie de patrimonio: se acumula el efecto de cada transacción sobre
     activos y pasivos en orden cronológico. */
  const seriePatrimonio = useMemo(() => {
    const ordenadas = [...transacciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    let acumulado = 0;
    const porDia = new Map();

    ordenadas.forEach((t) => {
      t.movimientos.forEach((m) => {
        const tipo = tipoDeCuenta[m.idCuenta];
        if (tipo === "activo") acumulado += m.monto;
        else if (tipo === "pasivo") acumulado += m.monto;
      });
      porDia.set(t.fecha.slice(0, 10), acumulado);
    });

    const serie = [...porDia.entries()].map(([fecha, valor]) => ({ fecha, valor }));
    return desde ? serie.filter((p) => new Date(p.fecha) >= desde) : serie;
  }, [transacciones, tipoDeCuenta, desde]);

  const variacionPatrimonio = useMemo(() => {
    if (seriePatrimonio.length < 2) return null;
    const inicio = seriePatrimonio[0].valor;
    const fin = seriePatrimonio[seriePatrimonio.length - 1].valor;
    const delta = fin - inicio;
    return { delta, pct: inicio !== 0 ? (delta / Math.abs(inicio)) * 100 : null };
  }, [seriePatrimonio]);

  /* Ingresos y gastos agrupados por mes. */
  const porMes = useMemo(() => {
    const meses = new Map();
    enRango.forEach((t) => {
      const mes = t.fecha.slice(0, 7);
      if (!meses.has(mes)) meses.set(mes, { mes, ingresos: 0, gastos: 0 });
      t.movimientos.forEach((m) => {
        const tipo = tipoDeCuenta[m.idCuenta];
        if (tipo === "ingreso") meses.get(mes).ingresos += Math.abs(m.monto);
        else if (tipo === "gasto") meses.get(mes).gastos += Math.abs(m.monto);
      });
    });
    return [...meses.values()]
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map((m) => ({
        ...m,
        etiqueta: new Date(m.mes + "-02").toLocaleDateString("es-ES", { month: "short" }),
        balance: m.ingresos - m.gastos,
      }));
  }, [enRango, tipoDeCuenta]);

  /* Gasto por categoría raíz: agrupar por padre evita un donut con 12 porciones. */
  const gastoPorCategoria = useMemo(() => {
    const raiz = (id) => {
      let c = cuentas.find((x) => x.id === id);
      while (c?.idPadre) c = cuentas.find((x) => x.id === c.idPadre);
      return c;
    };

    const totales = new Map();
    enRango.forEach((t) =>
      t.movimientos.forEach((m) => {
        if (tipoDeCuenta[m.idCuenta] !== "gasto") return;
        const cuenta = raiz(m.idCuenta);
        if (!cuenta) return;
        totales.set(cuenta.nombre, (totales.get(cuenta.nombre) || 0) + Math.abs(m.monto));
      })
    );

    return [...totales.entries()]
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [enRango, cuentas, tipoDeCuenta]);

  const totalGastos = gastoPorCategoria.reduce((s, c) => s + c.valor, 0);

  /* Dónde está el dinero: saldo por cuenta de activo. */
  const distribucionActivos = useMemo(() => {
    return cuentas
      .filter((c) => c.tipo === "activo" && c.activa && !c.idPadre)
      .map((c) => {
        const tieneHijos = cuentas.some((x) => x.idPadre === c.id);
        const crudo = tieneHijos
          ? saldoCrudoConSub(c.id, cuentas, movimientos)
          : saldoCrudo(c.id, movimientos);
        return { nombre: c.nombre, valor: esDebitoNormal("activo") ? crudo : -crudo };
      })
      .filter((c) => Math.abs(c.valor) > 0.005)
      .sort((a, b) => b.valor - a.valor);
  }, [cuentas, movimientos]);

  const maxActivo = Math.max(...distribucionActivos.map((a) => Math.abs(a.valor)), 1);

  /* Liquidez: no es lo mismo tener S/1,000 en YAPE que en Tyba. Lo primero se
     puede gastar hoy; lo segundo está invertido. */
  const liquidez = useMemo(() => {
    let disponible = 0;
    let inmovilizado = 0;

    cuentas
      .filter((c) => c.tipo === "activo" && c.activa && !cuentas.some((x) => x.idPadre === c.id))
      .forEach((c) => {
        const saldo = saldoCrudo(c.id, movimientos);
        if (esLiquido(inferirInstrumento(c))) disponible += saldo;
        else inmovilizado += saldo;
      });

    return { disponible, inmovilizado };
  }, [cuentas, movimientos]);

  /* Con quién mueves más dinero. Solo tiene sentido con datos importados. */
  const topContrapartes = useMemo(() => {
    const mapa = new Map();
    enRango.forEach((t) => {
      const nombre = t.contraparte?.nombre;
      if (!nombre || t.contraparte?.tipo === "propia") return;
      if (!mapa.has(nombre))
        mapa.set(nombre, { nombre, enviado: 0, recibido: 0, veces: 0, tipo: t.contraparte.tipo });
      const reg = mapa.get(nombre);
      reg.veces++;
      const monto = Math.abs(t.movimientos?.[0]?.monto ?? 0);
      if (t.contraparte.direccion === "recibido") reg.recibido += monto;
      else reg.enviado += monto;
    });
    return [...mapa.values()]
      .sort((a, b) => b.enviado + b.recibido - (a.enviado + a.recibido))
      .slice(0, 6);
  }, [enRango]);

  const sinDatos = transacciones.length === 0;

  return (
    <div className="space-y-4">
      {/* Cabecera con selector de periodo */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Resumen financiero</h1>
          <p className="text-sm text-muted-foreground">
            {enRango.length} movimiento{enRango.length === 1 ? "" : "s"}
            {desde && ` desde el ${desde.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}`}
          </p>
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                periodo === p.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {sinDatos ? (
        <EstadoVacio />
      ) : (
        <>
          {/* Patrimonio neto: la cifra que manda, con su tendencia */}
          <section className="rounded-xl border border-border bg-card p-5 md:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-center">
              <div>
                <div className="text-sm text-muted-foreground">Patrimonio neto</div>
                <div className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
                  {fmt.format(neto)}
                </div>

                {variacionPatrimonio && (
                  <Delta
                    valor={variacionPatrimonio.delta}
                    pct={variacionPatrimonio.pct}
                    sufijo="en el periodo"
                    className="mt-2"
                  />
                )}

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
                  <MiniDato icono={Wallet} etiqueta="Disponible" valor={liquidez.disponible} />
                  {liquidez.inmovilizado !== 0 && (
                    <MiniDato icono={PiggyBank} etiqueta="Invertido" valor={liquidez.inmovilizado} />
                  )}
                  <MiniDato icono={CreditCard} etiqueta="Pasivos" valor={pasivos} atenuado />
                </div>
              </div>

              <div className="h-32 md:h-40">
                {seriePatrimonio.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={seriePatrimonio} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradPatrimonio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="fecha" hide />
                      <YAxis hide domain={["dataMin", "dataMax"]} />
                      <Tooltip content={<TooltipPersonalizado etiquetaSerie="Patrimonio" />} />
                      <Area
                        type="monotone"
                        dataKey="valor"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#gradPatrimonio)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <SinSerie />
                )}
              </div>
            </div>
          </section>

          {/* Flujo del periodo */}
          <div className="grid gap-3 sm:grid-cols-2">
            <TarjetaFlujo
              icono={ArrowDownLeft}
              titulo="Ingresos"
              valor={flujo.ingresos}
              previo={flujo.previo?.ingresos}
              positivoEsBueno
            />
            <TarjetaFlujo
              icono={ArrowUpRight}
              titulo="Gastos"
              valor={flujo.gastos}
              previo={flujo.previo?.gastos}
              positivoEsBueno={false}
            />
          </div>

          {/* Balance mensual + composición del gasto */}
          <div className="grid gap-3 lg:grid-cols-5">
            <Panel titulo="Ingresos y gastos por mes" className="lg:col-span-3">
              {porMes.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porMes} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickFormatter={fmtCompacto} tickLine={false} axisLine={false} fontSize={12} width={44} />
                      <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: "hsl(var(--muted))" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={38} />
                      <Bar dataKey="gastos" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={38} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <SinSerie />
              )}
            </Panel>

            <Panel titulo="En qué se va" subtitulo={totalGastos ? fmt.format(totalGastos) : undefined} className="lg:col-span-2">
              {gastoPorCategoria.length ? (
                <div className="flex flex-col gap-3">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gastoPorCategoria}
                          dataKey="valor"
                          nameKey="nombre"
                          innerRadius="58%"
                          outerRadius="88%"
                          paddingAngle={2}
                          stroke="none"
                        >
                          {gastoPorCategoria.map((_, i) => (
                            <Cell key={i} fill={COLORES[i % COLORES.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<TooltipPersonalizado />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <ul className="space-y-1.5">
                    {gastoPorCategoria.slice(0, 5).map((c, i) => (
                      <li key={c.nombre} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: COLORES[i % COLORES.length] }}
                        />
                        <span className="truncate text-muted-foreground">{c.nombre}</span>
                        <span className="ml-auto shrink-0 tabular-nums font-medium">
                          {fmt.format(c.valor)}
                        </span>
                        <span className="w-10 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                          {Math.round((c.valor / totalGastos) * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <SinSerie mensaje="Sin gastos en este periodo" />
              )}
            </Panel>
          </div>

          {/* Dónde está el dinero + con quién lo mueves */}
          <div className="grid gap-3 lg:grid-cols-2">
            <Panel titulo="Dónde está tu dinero">
              {distribucionActivos.length ? (
                <ul className="space-y-3">
                  {distribucionActivos.map((c) => (
                    <li key={c.nombre}>
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate">{c.nombre}</span>
                        <span
                          className={`shrink-0 tabular-nums font-medium ${
                            c.valor < 0 ? "text-rose-600" : ""
                          }`}
                        >
                          {fmt.format(c.valor)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${c.valor < 0 ? "bg-rose-500" : "bg-primary"}`}
                          style={{ width: `${(Math.abs(c.valor) / maxActivo) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <SinSerie mensaje="Sin saldos que mostrar" />
              )}
            </Panel>

            <Panel titulo="Con quién mueves dinero" subtitulo="Traspasos entre tus cuentas excluidos">
              {topContrapartes.length ? (
                <ul className="space-y-2.5">
                  {topContrapartes.map((p) => (
                    <li key={p.nombre} className="flex items-center gap-3 text-sm">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
                        {iniciales(p.nombre)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.nombre}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.veces} movimiento{p.veces === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="shrink-0 text-right tabular-nums text-xs">
                        {p.enviado > 0 && (
                          <span className="block text-rose-600">−{fmt.format(p.enviado)}</span>
                        )}
                        {p.recibido > 0 && (
                          <span className="block text-emerald-600">+{fmt.format(p.recibido)}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <SinSerie
                  icono={Users}
                  mensaje="Importa tus extractos para ver con quién mueves dinero"
                />
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- piezas ---------- */

function Panel({ titulo, subtitulo, className = "", children }) {
  return (
    <section className={`rounded-xl border border-border bg-card p-4 md:p-5 ${className}`}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium">{titulo}</h2>
        {subtitulo && <span className="text-xs text-muted-foreground tabular-nums">{subtitulo}</span>}
      </div>
      {children}
    </section>
  );
}

function TarjetaFlujo({ icono: Icono, titulo, valor, previo, positivoEsBueno }) {
  const hayComparacion = typeof previo === "number" && previo > 0;
  const delta = hayComparacion ? valor - previo : null;
  const pct = hayComparacion ? (delta / previo) * 100 : null;

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icono className="h-4 w-4" />
        {titulo}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{fmt.format(valor)}</div>
      {hayComparacion ? (
        <Delta valor={delta} pct={pct} sufijo="vs periodo anterior" invertirColor={!positivoEsBueno} className="mt-1.5" />
      ) : (
        <div className="mt-1.5 text-xs text-muted-foreground">Sin periodo anterior para comparar</div>
      )}
    </section>
  );
}

/** Variación con signo y color. El color depende de si subir es bueno o malo. */
function Delta({ valor, pct, sufijo, invertirColor = false, className = "" }) {
  const sube = valor > 0;
  const neutro = Math.abs(valor) < 0.005;
  const bueno = invertirColor ? !sube : sube;
  const Icono = neutro ? Minus : sube ? TrendingUp : TrendingDown;

  const color = neutro
    ? "text-muted-foreground"
    : bueno
    ? "text-emerald-600"
    : "text-rose-600";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-xs ${className}`}>
      <span className={`inline-flex items-center gap-1 font-medium ${color}`}>
        <Icono className="h-3.5 w-3.5" />
        {neutro ? "Sin cambios" : `${sube ? "+" : "−"}${fmt.format(Math.abs(valor))}`}
        {pct !== null && !neutro && Number.isFinite(pct) && (
          <span className="opacity-80">({Math.abs(pct).toFixed(1)}%)</span>
        )}
      </span>
      <span className="text-muted-foreground">{sufijo}</span>
    </div>
  );
}

function MiniDato({ icono: Icono, etiqueta, valor, atenuado }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icono className="h-3.5 w-3.5" />
        {etiqueta}
      </div>
      <div className={`mt-0.5 text-lg font-medium tabular-nums ${atenuado ? "text-muted-foreground" : ""}`}>
        {fmt.format(valor)}
      </div>
    </div>
  );
}

function TooltipPersonalizado({ active, payload, label, etiquetaSerie }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      {label && <div className="mb-1 text-xs text-muted-foreground">{formatearEtiqueta(label)}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-muted-foreground">{etiquetaSerie || p.name}</span>
          <span className="ml-auto font-medium tabular-nums">{fmt.format(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function formatearEtiqueta(label) {
  if (typeof label === "string" && /^\d{4}-\d{2}-\d{2}/.test(label)) {
    return new Date(label).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  }
  return label;
}

function SinSerie({ mensaje = "Aún no hay suficientes datos", icono: Icono }) {
  return (
    <div className="flex h-full min-h-[8rem] flex-col items-center justify-center gap-2 text-center">
      {Icono && <Icono className="h-6 w-6 text-muted-foreground/50" />}
      <p className="text-sm text-muted-foreground">{mensaje}</p>
    </div>
  );
}

function EstadoVacio() {
  return (
    <section className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <Wallet className="mx-auto h-8 w-8 text-muted-foreground/50" />
      <h2 className="mt-3 font-medium">Todavía no hay movimientos</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Importa el Excel de YAPE o el estado de cuenta de BCP desde la sección Importar, o registra una
        transacción a mano.
      </p>
    </section>
  );
}

function iniciales(nombre) {
  return String(nombre)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
