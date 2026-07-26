import { useState, useMemo } from "react";
import { TIPOS, esDebitoNormal, saldoCrudo, saldoCrudoConSub, validarCuadre, construir, integridadGlobal, patrimonioNeto } from "../motor/motor.js";
import { CUENTAS_DEFAULT, TX_SEMILLA, fmtPEN as fmt } from "../datos/semillas.js";

/* Bloque 1 — banco de pruebas para ejercitar el motor y verlo cuadrar. */

const nombreDe = (id) => CUENTAS_DEFAULT.find((c) => c.id === id)?.nombre ?? id;
const cuentasDeTipo = (tipos) => CUENTAS_DEFAULT.filter((c) => tipos.includes(c.tipo) && c.activa);

function correrPruebas() {
  const r = [];
  const cae = (nombre, ok) => r.push({ nombre, ok });
  cae("Un gasto genera un asiento que cuadra",
    validarCuadre(construir.gasto({ categoriaId: "g", cuentaPagoId: "b", monto: 100 })).ok);
  cae("Un ingreso genera un asiento que cuadra",
    validarCuadre(construir.ingreso({ categoriaId: "i", cuentaDestinoId: "b", monto: 100 })).ok);
  cae("Rechaza un asiento descuadrado (RF-06)",
    validarCuadre([{ idCuenta: "a", monto: 100 }, { idCuenta: "b", monto: -90 }]).ok === false);
  const cs = [
    { id: "comida", tipo: "gasto", idPadre: null },
    { id: "super", tipo: "gasto", idPadre: "comida" },
    { id: "resto", tipo: "gasto", idPadre: "comida" },
  ];
  const ms = [{ idCuenta: "super", monto: 250 }, { idCuenta: "resto", monto: 80 }];
  cae("El padre consolida a sus subcuentas (250 + 80 = 330)",
    saldoCrudoConSub("comida", cs, ms) === 330);
  return r;
}

export default function MotorBench() {
  const [transacciones, setTransacciones] = useState(TX_SEMILLA);
  const [tipo, setTipo] = useState("gasto");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cuentaA, setCuentaA] = useState("g-super");
  const [cuentaB, setCuentaB] = useState("p-tarjeta");
  const [error, setError] = useState("");

  const movimientos = useMemo(() => transacciones.flatMap((t) => t.movimientos), [transacciones]);
  const pruebas = useMemo(() => correrPruebas(), []);
  const { activos, pasivos, neto } = patrimonioNeto(CUENTAS_DEFAULT, movimientos);
  const cuadraTodo = integridadGlobal(movimientos);

  const filas = useMemo(() => {
    const out = [];
    const walk = (c, depth) => {
      const hijos = CUENTAS_DEFAULT.filter((h) => h.idPadre === c.id);
      out.push({ cuenta: c, depth, tieneHijos: hijos.length > 0 });
      hijos.forEach((h) => walk(h, depth + 1));
    };
    TIPOS.forEach((t) => CUENTAS_DEFAULT.filter((c) => c.tipo === t && c.idPadre === null).forEach((c) => walk(c, 0)));
    return out;
  }, []);

  const opcionesA = tipo === "gasto" ? cuentasDeTipo(["gasto"]) : tipo === "ingreso" ? cuentasDeTipo(["ingreso"]) : cuentasDeTipo(["activo"]);
  const opcionesB = tipo === "gasto" ? cuentasDeTipo(["activo", "pasivo"]) : cuentasDeTipo(["activo"]);
  const etiquetaA = tipo === "gasto" ? "Categoría de gasto" : tipo === "ingreso" ? "Categoría de ingreso" : "Sale de";
  const etiquetaB = tipo === "gasto" ? "Pagado con" : tipo === "ingreso" ? "Recibido en" : "Entra a";

  function registrar() {
    setError("");
    const n = parseFloat(monto);
    if (!n || n <= 0) { setError("Ingresa un monto mayor que 0."); return; }
    let movs;
    if (tipo === "gasto") movs = construir.gasto({ categoriaId: cuentaA, cuentaPagoId: cuentaB, monto: n });
    else if (tipo === "ingreso") movs = construir.ingreso({ categoriaId: cuentaA, cuentaDestinoId: cuentaB, monto: n });
    else movs = construir.transferencia({ origenId: cuentaA, destinoId: cuentaB, monto: n });
    const check = validarCuadre(movs);
    if (!check.ok) { setError(check.error); return; }
    setTransacciones((prev) => [...prev, {
      id: "t" + Date.now(), fecha: new Date().toISOString().slice(0, 10),
      descripcion: descripcion.trim() || tipo, movimientos: movs,
    }]);
    setMonto(""); setDescripcion("");
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Patrimonio neto</p>
            <p className="text-2xl font-semibold text-foreground">{fmt.format(neto)}</p>
            <p className="text-xs text-muted-foreground mt-1">Activos {fmt.format(activos)} − Pasivos {fmt.format(pasivos)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Integridad (RF-11)</p>
            <p className={"text-sm font-medium " + (cuadraTodo ? "text-emerald-600" : "text-red-600")}>
              {cuadraTodo ? "✓ Todas las cuentas cuadran" : "✗ Hay un descuadre"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Suma de todos los saldos = 0</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-2">Pruebas del motor</p>
            <ul className="space-y-1">
              {pruebas.map((p, i) => (
                <li key={i} className="text-xs flex gap-1.5">
                  <span className={p.ok ? "text-emerald-600" : "text-red-600"}>{p.ok ? "✓" : "✗"}</span>
                  <span className="text-muted-foreground">{p.nombre}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-medium text-foreground mb-4">Registrar una operación</h2>
            <div className="flex gap-2 mb-4">
              {["gasto", "ingreso", "transferencia"].map((t) => (
                <button key={t} onClick={() => {
                  setTipo(t); setError("");
                  setCuentaA((t === "gasto" ? cuentasDeTipo(["gasto"]) : t === "ingreso" ? cuentasDeTipo(["ingreso"]) : cuentasDeTipo(["activo"]))[0].id);
                  setCuentaB((t === "gasto" ? cuentasDeTipo(["activo", "pasivo"]) : cuentasDeTipo(["activo"]))[0].id);
                }}
                  className={"px-3 py-1.5 rounded-lg text-sm capitalize border " + (tipo === t ? "bg-primary text-primary-foreground border-border" : "bg-card text-muted-foreground border-border hover:border-border")}>
                  {t}
                </button>
              ))}
            </div>
            <label className="block text-xs text-muted-foreground mb-1">{etiquetaA}</label>
            <select value={cuentaA} onChange={(e) => setCuentaA(e.target.value)} className="w-full mb-3 rounded-lg border border-border px-3 py-2 text-sm bg-card">
              {opcionesA.map((c) => <option key={c.id} value={c.id}>{c.idPadre ? "— " : ""}{c.nombre}</option>)}
            </select>
            <label className="block text-xs text-muted-foreground mb-1">{etiquetaB}</label>
            <select value={cuentaB} onChange={(e) => setCuentaB(e.target.value)} className="w-full mb-3 rounded-lg border border-border px-3 py-2 text-sm bg-card">
              {opcionesB.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Monto</label>
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Descripción (opcional)</label>
                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. compra semanal" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              </div>
            </div>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <button onClick={registrar} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90">Registrar</button>
            <p className="text-xs text-muted-foreground mt-3">Registras en lenguaje simple; el motor arma el asiento balanceado por detrás. Nunca ves "debe" ni "haber".</p>
          </section>

          <section className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-medium text-foreground mb-4">Saldos por cuenta</h2>
            <div className="space-y-0.5">
              {filas.map(({ cuenta, depth, tieneHijos }) => {
                const crudo = tieneHijos ? saldoCrudoConSub(cuenta.id, CUENTAS_DEFAULT, movimientos) : saldoCrudo(cuenta.id, movimientos);
                const mostrado = esDebitoNormal(cuenta.tipo) ? crudo : -crudo;
                return (
                  <div key={cuenta.id} className="flex justify-between items-center py-1.5 text-sm" style={{ paddingLeft: depth * 16 }}>
                    <span className={depth === 0 ? "text-foreground" : "text-muted-foreground"}>
                      {cuenta.nombre}{tieneHijos && <span className="text-xs text-muted-foreground"> (con subcuentas)</span>}
                    </span>
                    <span className={"tabular-nums " + (depth === 0 ? "font-medium text-foreground" : "text-muted-foreground")}>{fmt.format(mostrado)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="bg-card rounded-xl border border-border p-5 mt-6">
          <h2 className="font-medium text-foreground mb-4">Historial de transacciones</h2>
          <div className="divide-y divide-border">
            {[...transacciones].reverse().map((t) => {
              const cuadra = validarCuadre(t.movimientos).ok;
              return (
                <div key={t.id} className="py-2.5 flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm text-foreground">{t.descripcion}</p>
                    <p className="text-xs text-muted-foreground">{t.fecha} · {t.movimientos.map((m) => nombreDe(m.idCuenta)).join(" ↔ ")}</p>
                  </div>
                  <span className={"text-xs shrink-0 " + (cuadra ? "text-emerald-600" : "text-red-600")}>{cuadra ? "cuadra ✓" : "descuadre ✗"}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
