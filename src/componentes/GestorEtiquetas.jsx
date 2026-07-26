import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, PageHeader } from "./ui";
import { Plus, Trash2, Tag, TrendingUp } from "lucide-react";
import { fmtPEN as fmt } from "../datos/semillas.js";
import { confirmarPeligro, avisoExito } from "../ui/dialogos.js";
import { escaparHtml } from "../ui/escaparHtml.js";


/* MLP — Etiquetas Transversales (Tags) — DIFERENCIADOR */

export default function GestorEtiquetas({ etiquetas, setEtiquetas, transacciones, setTransacciones, cuentas = [] }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("blue");
  const [msg, setMsg] = useState("");

  const COLORES = [
    { v: "blue", t: "Azul", class: "bg-blue-100 text-blue-900 border-blue-300" },
    { v: "red", t: "Rojo", class: "bg-red-100 text-red-900 border-red-300" },
    { v: "green", t: "Verde", class: "bg-green-100 text-green-900 border-green-300" },
    { v: "yellow", t: "Amarillo", class: "bg-yellow-100 text-yellow-900 border-yellow-300" },
    { v: "purple", t: "Púrpura", class: "bg-purple-100 text-purple-900 border-purple-300" },
    { v: "pink", t: "Rosa", class: "bg-pink-100 text-pink-900 border-pink-300" },
  ];

  function agregar() {
    setMsg("");
    const n = nombre.trim();
    if (!n) {
      setMsg("Escribe un nombre para la etiqueta.");
      return;
    }

    if (etiquetas.some((e) => e.nombre.toLowerCase() === n.toLowerCase())) {
      setMsg("Esta etiqueta ya existe.");
      return;
    }

    setEtiquetas([
      ...etiquetas,
      {
        id: "etq-" + Date.now().toString(36),
        nombre: n,
        descripcion: descripcion.trim(),
        color,
      },
    ]);

    setNombre("");
    setDescripcion("");
    setMsg("✅ Etiqueta creada.");
  }

  async function eliminar(id) {
    const etq = etiquetas.find((e) => e.id === id);
    const usos = transacciones.filter((tx) => tx.etiquetas?.includes(id)).length;

    const ok = await confirmarPeligro({
      titulo: "¿Eliminar esta etiqueta?",
      html: `
        <div class="balance-detalle">
          <strong>${escaparHtml(etq?.nombre || "Etiqueta")}</strong>
          <div class="meta">${
            usos
              ? `Se quitará de ${usos} transacci${usos === 1 ? "ón" : "ones"}. Las transacciones no se borran.`
              : "No está en uso en ninguna transacción."
          }</div>
        </div>`,
    });
    if (!ok) return;

    // Remover esta etiqueta de todas las transacciones
    setTransacciones(
      transacciones.map((tx) => ({
        ...tx,
        etiquetas: tx.etiquetas?.filter((e) => e !== id) || [],
      }))
    );

    setEtiquetas(etiquetas.filter((e) => e.id !== id));
    avisoExito("Etiqueta eliminada", usos ? `Se quitó de ${usos} transacciones` : undefined);
  }

  // Estadísticas por etiqueta
  const estadisticas = useMemo(() => {
    const stats = {};
    transacciones.forEach((tx) => {
      (tx.etiquetas || []).forEach((etqId) => {
        if (!stats[etqId]) {
          stats[etqId] = { cantidad: 0, total: 0 };
        }
        stats[etqId].cantidad += 1;
        tx.movimientos.forEach((mov) => {
          const cuenta = cuentas.find((c) => c.id === mov.idCuenta);
          if (cuenta && (cuenta.tipo === "gasto" || cuenta.tipo === "ingreso")) {
            stats[etqId].total += Math.abs(mov.monto);
          }
        });
      });
    });
    return stats;
  }, [transacciones, cuentas]);

  return (
    <div className="space-y-4">
      <PageHeader titulo="Etiquetas" descripcion="Marca movimientos con tags que cruzan categorías" />

      {/* Formulario */}
      <Card className="border-2 border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Crear etiqueta transversal
          </CardTitle>
          <CardDescription>Crea tags que cruzan categorías (ej. "Viaje", "Familia", "Empresa")</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la etiqueta</label>
            <Input
              placeholder="Ej. Viaje 2026, Con la familia, Reembolsable"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
            <Input
              placeholder="Ej. Gastos del viaje a Europa"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLORES.map((c) => (
                <button
                  key={c.v}
                  onClick={() => setColor(c.v)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                    color === c.v ? "border-foreground" : "border-transparent"
                  } ${c.class}`}
                >
                  {c.t}
                </button>
              ))}
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
            <Plus className="w-4 h-4 mr-2" /> Crear etiqueta
          </Button>
        </CardContent>
      </Card>

      {/* Lista de etiquetas con estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Etiquetas disponibles</CardTitle>
          <CardDescription>Úsalas para categorizar transacciones transversalmente</CardDescription>
        </CardHeader>
        <CardContent>
          {etiquetas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay etiquetas. Crea una para comenzar a organizarte de forma transversal.
            </p>
          ) : (
            <div className="space-y-3">
              {etiquetas.map((etq) => {
                const stats = estadisticas[etq.id] || { cantidad: 0, total: 0 };
                const colorClass = COLORES.find((c) => c.v === etq.color)?.class || "";

                return (
                  <div
                    key={etq.id}
                    className={`flex items-start justify-between p-3 rounded-lg border ${colorClass}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{etq.nombre}</div>
                      {etq.descripcion && <div className="text-xs opacity-75 mt-0.5">{etq.descripcion}</div>}
                      <div className="text-xs opacity-75 mt-1 flex items-center gap-3">
                        <span>📌 {stats.cantidad} transacciones</span>
                        {stats.total > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {fmt.format(stats.total)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => eliminar(etq.id)}
                      className="p-1.5 rounded hover:bg-black/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border space-y-2">
        <div className="font-medium text-foreground">💡 ¿Cómo funcionan las etiquetas?</div>
        <ul className="list-disc list-inside space-y-1">
          <li>Son tags que puedes aplicar a cualquier transacción</li>
          <li>Una transacción puede tener múltiples etiquetas</li>
          <li>Cruzan categorías (una comida puede ser "Viaje" y "Familia")</li>
          <li>Úsalas para ver estadísticas por personas, eventos, proyectos</li>
          <li>En futuras versiones: reportes y gráficos por etiqueta</li>
        </ul>
      </div>
    </div>
  );
}
