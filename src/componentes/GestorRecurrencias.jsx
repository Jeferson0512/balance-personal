import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, PageHeader } from "./ui";
import { Plus, Trash2, Copy } from "lucide-react";
import { construir, validarCuadre } from "../motor/motor.js";
import { CUENTAS_DEFAULT, fmtPEN as fmt } from "../datos/semillas.js";
import { confirmarPeligro, avisoExito } from "../ui/dialogos.js";
import { escaparHtml } from "../ui/escaparHtml.js";


/* MLP — Transacciones Recurrentes */

const FRECUENCIAS = [
  { v: "diaria", t: "Diaria" },
  { v: "semanal", t: "Semanal" },
  { v: "quincenal", t: "Quincenal" },
  { v: "mensual", t: "Mensual" },
];

export default function GestorRecurrencias({ recurrencias, setRecurrencias, transacciones, setTransacciones, cuentas = CUENTAS_DEFAULT }) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [frecuencia, setFrecuencia] = useState("mensual");
  const [categoriaId, setCategoriaId] = useState("");
  const [cuentaPagoId, setCuentaPagoId] = useState("");
  const [msg, setMsg] = useState("");

  const categorias = useMemo(
    () => cuentas.filter((c) => c.activa && c.tipo === (tipo === "gasto" ? "gasto" : "ingreso")),
    [cuentas, tipo]
  );

  const cuentasPago = useMemo(
    () => cuentas.filter((c) => c.activa && (c.tipo === "activo" || c.tipo === "pasivo")),
    [cuentas]
  );

  function crear() {
    setMsg("");
    const m = parseFloat(monto);
    if (!nombre.trim() || !monto || isNaN(m) || m <= 0) {
      setMsg("Completa todos los campos correctamente.");
      return;
    }
    if (!categoriaId || !cuentaPagoId) {
      setMsg("Selecciona categoría y cuenta.");
      return;
    }

    const rec = {
      id: "rec-" + Date.now().toString(36),
      nombre: nombre.trim(),
      tipo,
      monto: m,
      descripcion: descripcion.trim(),
      frecuencia,
      categoriaId,
      cuentaPagoId,
      proximaFecha: new Date().toISOString().split("T")[0],
      activa: true,
    };

    setRecurrencias([...recurrencias, rec]);
    setNombre("");
    setMonto("");
    setDescripcion("");
    setCategoriaId("");
    setCuentaPagoId("");
    setMsg("✅ Plantilla recurrente creada.");
  }

  function aplicarAhora(rec) {
    const movimientos = construir[rec.tipo === "ingreso" ? "ingreso" : "gasto"]({
      categoriaId: rec.categoriaId,
      cuentaPagoId: rec.cuentaPagoId,
      cuentaDestinoId: rec.cuentaPagoId,
      monto: rec.monto,
    });

    const validacion = validarCuadre(movimientos);
    if (!validacion.ok) {
      setMsg(validacion.error);
      return;
    }

    const tx = {
      id: "tx-" + Date.now().toString(36),
      fecha: new Date().toISOString().split("T")[0],
      descripcion: rec.descripcion || rec.nombre,
      movimientos,
    };

    setTransacciones([...transacciones, tx]);
    setMsg(`✅ "${rec.nombre}" aplicada hoy.`);
  }

  async function eliminar(id) {
    const rec = recurrencias.find((r) => r.id === id);
    const ok = await confirmarPeligro({
      titulo: "¿Eliminar esta recurrencia?",
      html: `
        <div class="balance-detalle">
          <strong>${escaparHtml(rec?.nombre || "Recurrencia")}</strong>
          <div class="meta">Las transacciones ya generadas por ella no se borran.</div>
        </div>`,
    });
    if (!ok) return;
    setRecurrencias(recurrencias.filter((r) => r.id !== id));
    avisoExito("Recurrencia eliminada");
  }

  function toggleActiva(id) {
    setRecurrencias(recurrencias.map((r) => (r.id === id ? { ...r, activa: !r.activa } : r)));
  }

  return (
    <div className="space-y-4">
      <PageHeader titulo="Recurrencias" descripcion="Plantillas para los movimientos que se repiten cada mes" />

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Crear plantilla recurrente</CardTitle>
          <CardDescription>Define un movimiento que se repita automáticamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de la plantilla</label>
              <Input placeholder="Ej. Pago de renta" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frecuencia</label>
              <select
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                {FRECUENCIAS.map((f) => (
                  <option key={f.v} value={f.v}>
                    {f.t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monto</label>
              <Input type="number" step="0.01" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="">— Selecciona —</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
            <Input placeholder="Ej. Pago mensual del alquiler" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cuenta de pago</label>
            <select
              value={cuentaPagoId}
              onChange={(e) => setCuentaPagoId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="">— Selecciona —</option>
              {cuentasPago.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
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

          <Button onClick={crear} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Crear plantilla
          </Button>
        </CardContent>
      </Card>

      {/* Lista de plantillas */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas activas</CardTitle>
          <CardDescription>{recurrencias.filter((r) => r.activa).length} plantillas configuradas</CardDescription>
        </CardHeader>
        <CardContent>
          {recurrencias.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay plantillas configuradas.</p>
          ) : (
            <div className="space-y-3">
              {recurrencias.map((rec) => (
                <div
                  key={rec.id}
                  className={`flex items-center justify-between p-3 border border-border rounded-lg ${
                    !rec.activa ? "opacity-50 bg-muted/30" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{rec.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {rec.tipo === "gasto" ? "🔴" : "🟢"} {rec.descripcion || "Sin descripción"} • {rec.frecuencia}
                    </div>
                  </div>
                  <div className="text-sm font-medium mr-4">{fmt.format(rec.monto)}</div>
                  <div className="flex gap-2">
                    {rec.activa && (
                      <button
                        onClick={() => aplicarAhora(rec)}
                        className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                        title="Aplicar ahora"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleActiva(rec.id)}
                      className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                    >
                      {rec.activa ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminar(rec.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
        <strong>💡 Nota:</strong> Las plantillas recurrentes te permiten crear transacciones repetitivas rápidamente. El botón
        copiar aplica la transacción hoy; en futuras versiones se automatizará completamente.
      </div>
    </div>
  );
}
