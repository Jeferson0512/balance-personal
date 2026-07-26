import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, PageHeader } from "./ui";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { saldoCrudo, esDebitoNormal } from "../motor/motor.js";
import { fmtPEN as fmt } from "../datos/semillas.js";
import { confirmarPeligro, avisoExito } from "../ui/dialogos.js";
import { escaparHtml } from "../ui/escaparHtml.js";


/* MLP — Presupuestos por categoría */

export default function GestorPresupuestos({ presupuestos, setPresupuestos, transacciones, cuentas = [] }) {
  const [categoriaId, setCategoriaId] = useState("");
  const [limite, setLimite] = useState("");
  const [msg, setMsg] = useState("");

  const movimientos = useMemo(() => transacciones.flatMap((t) => t.movimientos), [transacciones]);

  // Categorías de gasto disponibles
  const categoriasGasto = useMemo(
    () => cuentas.filter((c) => c.activa && c.tipo === "gasto" && c.idPadre === null),
    [cuentas]
  );

  // Gastos reales del mes actual
  const gastosDelMes = useMemo(() => {
    const ahora = new Date();
    const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;

    const gastos = {};
    transacciones.forEach((tx) => {
      if (!tx.fecha.startsWith(mesActual)) return;

      tx.movimientos.forEach((mov) => {
        const cuenta = cuentas.find((c) => c.id === mov.idCuenta);
        if (cuenta && cuenta.tipo === "gasto") {
          if (!gastos[cuenta.id]) gastos[cuenta.id] = 0;
          gastos[cuenta.id] += Math.abs(mov.monto);
        }
      });
    });

    return gastos;
  }, [transacciones, cuentas]);

  function agregar() {
    setMsg("");
    const l = parseFloat(limite);
    if (!categoriaId || !limite || isNaN(l) || l <= 0) {
      setMsg("Selecciona categoría e ingresa un límite válido.");
      return;
    }

    if (presupuestos.some((p) => p.categoriaId === categoriaId)) {
      setMsg("Esta categoría ya tiene un presupuesto.");
      return;
    }

    setPresupuestos([
      ...presupuestos,
      { id: "pres-" + Date.now().toString(36), categoriaId, limite: l },
    ]);

    setCategoriaId("");
    setLimite("");
    setMsg("✅ Presupuesto agregado.");
  }

  async function eliminar(id) {
    const pres = presupuestos.find((p) => p.id === id);
    const nombre = cuentas.find((c) => c.id === pres?.categoriaId)?.nombre || "esta categoría";
    const ok = await confirmarPeligro({
      titulo: "¿Eliminar este presupuesto?",
      html: `
        <div class="balance-detalle">
          <strong>${escaparHtml(nombre)}</strong>
          <div class="meta">Límite de ${fmt.format(pres?.limite ?? 0)}</div>
          <div class="meta">Dejarás de recibir avisos al pasarte en esta categoría.</div>
        </div>`,
    });
    if (!ok) return;
    setPresupuestos(presupuestos.filter((p) => p.id !== id));
    avisoExito("Presupuesto eliminado");
  }

  return (
    <div className="space-y-4">
      <PageHeader titulo="Presupuestos" descripcion="Fija un límite mensual por categoría y sigue tu avance" />

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Establecer presupuesto mensual</CardTitle>
          <CardDescription>Define un límite de gasto por categoría</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Categoría de gasto</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="">— Selecciona categoría —</option>
                {categoriasGasto.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Límite mensual</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={limite}
                onChange={(e) => setLimite(e.target.value)}
              />
            </div>
          </div>

          {msg && (
            <div
              className={`p-3 rounded-lg text-sm ${
                msg.includes("✅") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
              }`}
            >
              {msg}
            </div>
          )}

          <Button onClick={agregar} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Agregar presupuesto
          </Button>
        </CardContent>
      </Card>

      {/* Lista de presupuestos con progreso */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuestos configurados</CardTitle>
          <CardDescription>Mes actual - {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</CardDescription>
        </CardHeader>
        <CardContent>
          {presupuestos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay presupuestos configurados.</p>
          ) : (
            <div className="space-y-4">
              {presupuestos.map((pres) => {
                const categoria = cuentas.find((c) => c.id === pres.categoriaId);
                const gastado = gastosDelMes[pres.categoriaId] || 0;
                const porcentaje = (gastado / pres.limite) * 100;
                const excedido = gastado > pres.limite;

                return (
                  <div key={pres.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">{categoria?.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {fmt.format(gastado)} de {fmt.format(pres.limite)}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminar(pres.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all ${
                          excedido ? "bg-destructive" : porcentaje > 75 ? "bg-orange-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      />
                    </div>

                    {/* Estado */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{Math.round(porcentaje)}% gastado</span>
                      {excedido && (
                        <div className="flex items-center gap-1 text-destructive font-medium">
                          <AlertCircle className="w-3 h-3" /> +{fmt.format(gastado - pres.limite)} excedido
                        </div>
                      )}
                      {!excedido && porcentaje > 75 && (
                        <span className="text-orange-600 font-medium">Casi al límite</span>
                      )}
                      {!excedido && porcentaje <= 75 && (
                        <span className="text-emerald-600">{fmt.format(pres.limite - gastado)} disponible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
        <strong>💡 Nota:</strong> Los presupuestos se calculan para el mes en curso. Excedera el límite no previene
        registrar transacciones, solo te da una alerta visual.
      </div>
    </div>
  );
}
