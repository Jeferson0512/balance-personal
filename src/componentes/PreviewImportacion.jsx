import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui";
import {
  CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp,
  Edit2, Save, X, ArrowUpRight, ArrowDownLeft,
} from "lucide-react";
import { fmtPEN as fmt } from "../datos/semillas.js";
import { descripcionDe, contraparteDe } from "../services/normalizarTx";
import { avisoAtencion } from "../ui/dialogos.js";

const ACCIONES_IMPORTAR = new Set(["importar-yape", "importar-bcp", "importar-ambos"]);

export default function PreviewImportacion({ resultado, onConfirmar, onCancelar }) {
  const [expandidos, setExpandidos] = useState({});
  const [decisiones, setDecisiones] = useState({});
  const [editando, setEditando] = useState({});
  const [transaccionesEditadas, setTransaccionesEditadas] = useState({});

  const toggleExpand = (seccion) => {
    setExpandidos((prev) => ({
      ...prev,
      [seccion]: !prev[seccion],
    }));
  };

  const manejarDecision = (id, accion) => {
    setDecisiones((prev) => ({
      ...prev,
      [id]: accion,
    }));
  };

  const iniciarEdicion = (id) => {
    setEditando((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const guardarEdicion = (id) => {
    setEditando((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const actualizarCampo = (id, campo, valor) => {
    setTransaccionesEditadas((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor,
      },
    }));
  };

  const obtenerTransaccion = (tx) => {
    return transaccionesEditadas[tx.id] || tx;
  };

  const obtenerCampo = (tx, campo) => {
    const txEditada = transaccionesEditadas[tx.id] || tx;
    return txEditada[campo] !== undefined ? txEditada[campo] : tx[campo];
  };

  const handleConfirmar = () => {
    const paraImportar = [
      ...resultado.nuevas.map(obtenerTransaccion),
      ...resultado.posiblesDuplicados
        .filter((t) => ACCIONES_IMPORTAR.has(decisiones[t.id]))
        .map(obtenerTransaccion),
      // Las descartadas se importan solo si las rescataste a mano.
      ...resultado.duplicados
        .filter((t) => decisiones[t.id] === "rescatar")
        .map(obtenerTransaccion),
    ];

    if (paraImportar.length === 0) {
      avisoAtencion("Nada que importar", "Selecciona al menos una transacción.");
      return;
    }

    onConfirmar(paraImportar);
  };

  const { resumen } = generarReporte(resultado, decisiones);
  const rescatadas = resumen.rescatadas;

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Total procesadas</div>
              <div className="text-2xl font-bold">{resumen.totalProcessadas}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" /> Nuevas
              </div>
              <div className="text-2xl font-bold text-green-600">{resumen.nuevas}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-600" /> Revisar
              </div>
              <div className="text-2xl font-bold text-yellow-600">{resumen.posiblesDuplicados}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-600" /> Descartar
              </div>
              <div className="text-2xl font-bold text-red-600">
                {resumen.duplicados - resumen.rescatadas}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NUEVAS TRANSACCIONES */}
      {resultado.nuevas.length > 0 && (
        <Card>
          <CardHeader
            onClick={() => toggleExpand("nuevas")}
            className="cursor-pointer hover:bg-muted/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Nuevas Transacciones ({resultado.nuevas.length})
                </CardTitle>
                <CardDescription>Se importarán automáticamente</CardDescription>
              </div>
              {expandidos.nuevas ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CardHeader>

          {expandidos.nuevas && (
            <CardContent className="space-y-2">
              {resultado.nuevas.map((tx) => (
                <TransaccionRow
                  key={tx.id}
                  tx={tx}
                  editando={editando[tx.id] || false}
                  onEdit={iniciarEdicion}
                  onSave={guardarEdicion}
                  onChange={actualizarCampo}
                  obtenerCampo={obtenerTransaccion}
                />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* POSIBLES DUPLICADOS */}
      {resultado.posiblesDuplicados.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader
            onClick={() => toggleExpand("duplicados")}
            className="cursor-pointer hover:bg-yellow-100/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Posibles Duplicados ({resultado.posiblesDuplicados.length})
                </CardTitle>
                <CardDescription>
                  Detectamos transacciones similares. Elige cuál importar
                </CardDescription>
              </div>
              {expandidos.duplicados ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CardHeader>

          {expandidos.duplicados && (
            <CardContent className="space-y-4">
              {resultado.posiblesDuplicados.map((tx) => {
                const decision = decisiones[tx.id];
                return (
                  <div key={tx.id} className="border rounded-lg p-3 space-y-2 bg-white">
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Fuente:</span>{" "}
                        <span className="font-medium">{tx.fuente}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fecha:</span>{" "}
                        <span className="font-medium">{tx.fecha.split("T")[0]}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monto:</span>{" "}
                        <span className="font-medium">{fmt.format(tx.monto)}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div>{(tx.descripcion || "").trim() || descripcionDe(tx)}</div>
                      {contraparteDe(tx)?.nombre && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {contraparteDe(tx).direccion === "recibido" ? "de" : "a"}{" "}
                          <span className="font-medium text-foreground">{contraparteDe(tx).nombre}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap pt-2">
                      {tx.fuente === "YAPE" && (
                        <button
                          onClick={() => manejarDecision(tx.id, "importar-yape")}
                          className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                            decision === "importar-yape"
                              ? "bg-green-600 text-white"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          ✓ Importar YAPE
                        </button>
                      )}
                      {tx.fuente === "BCP" && (
                        <button
                          onClick={() => manejarDecision(tx.id, "importar-bcp")}
                          className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                            decision === "importar-bcp"
                              ? "bg-green-600 text-white"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          ✓ Importar BCP
                        </button>
                      )}
                      <button
                        onClick={() => manejarDecision(tx.id, "ignorar")}
                        className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                          decision === "ignorar"
                            ? "bg-red-600 text-white"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* DUPLICADOS A IGNORAR */}
      {resultado.duplicados.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader
            onClick={() => toggleExpand("ignorar")}
            className="cursor-pointer hover:bg-red-100/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Se descartarán ({resultado.duplicados.length - rescatadas})
                  {rescatadas > 0 && (
                    <span className="text-sm font-normal text-emerald-700">
                      · {rescatadas} rescatada{rescatadas > 1 ? "s" : ""}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Detectadas como repetidas. Si alguna es un movimiento real, recupérala.
                </CardDescription>
              </div>
              {expandidos.ignorar ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CardHeader>

          {expandidos.ignorar && (
            <CardContent className="space-y-2">
              {resultado.duplicados.map((tx) => {
                const rescatada = decisiones[tx.id] === "rescatar";
                const contraparte = contraparteDe(tx);
                return (
                  <div
                    key={tx.id}
                    className={`border rounded-lg p-3 flex items-start justify-between gap-3 ${
                      rescatada ? "border-emerald-300 bg-emerald-50/60" : "bg-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {(tx.descripcion || "").trim() || descripcionDe(tx)}
                      </div>
                      {contraparte?.nombre && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {contraparte.direccion === "recibido" ? "de" : "a"}{" "}
                          <span className="font-medium text-foreground">{contraparte.nombre}</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {tx.fuente} • {new Date(tx.fecha).toLocaleDateString("es-ES")} •{" "}
                        {fmt.format(Math.abs(tx.monto))}
                      </div>
                      <div className="text-xs mt-1 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />
                        <span className="text-amber-800">{tx.decision?.razon}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => manejarDecision(tx.id, rescatada ? "descartar" : "rescatar")}
                      className={`shrink-0 px-3 py-1.5 text-xs rounded font-medium transition-colors ${
                        rescatada
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "border border-border hover:bg-muted"
                      }`}
                    >
                      {rescatada ? "✓ Se importará" : "Importar igual"}
                    </button>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 justify-between">
        <button
          onClick={onCancelar}
          className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmar}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          Importar {resumen.totalAImportar} transacciones
        </button>
      </div>
    </div>
  );
}

function TransaccionRow({ tx, estado = "nuevo", editando: enEdicion, onEdit, onSave, onChange, obtenerCampo }) {
  const txEditada = obtenerCampo ? obtenerCampo(tx) : tx;
  const fecha = new Date(txEditada.fecha).toLocaleDateString("es-ES");
  // Mismas derivaciones que usa el import, para que lo revisado sea lo guardado.
  const descripcion = (txEditada.descripcion || "").trim() || descripcionDe(txEditada);
  const contraparte = contraparteDe(txEditada);
  const monto = txEditada.monto;
  const entra = contraparte?.direccion === "recibido";

  if (enEdicion) {
    return (
      <div className="border rounded-lg p-3 space-y-3 bg-white">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Descripción</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => onChange(tx.id, "descripcion", e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Monto</label>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => onChange(tx.id, "monto", parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha</label>
            <input
              type="date"
              value={new Date(txEditada.fecha).toISOString().split("T")[0]}
              onChange={(e) => onChange(tx.id, "fecha", new Date(e.target.value).toISOString())}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {contraparte?.direccion === "recibido" ? "Recibido de" : "Enviado a"}
            </label>
            <input
              type="text"
              value={contraparte?.nombre || "—"}
              disabled
              className="w-full px-2 py-1 border rounded text-sm bg-muted"
              title="Viene del extracto y no se edita"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onSave(tx.id)}
            className="px-3 py-1 text-xs rounded font-medium bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1"
          >
            <Save className="w-3 h-3" /> Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded hover:bg-muted transition-colors group">
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{descripcion}</div>

        {contraparte?.nombre && (
          <div className="text-xs mt-0.5 flex items-center gap-1 min-w-0">
            {contraparte.direccion === "recibido" ? (
              <ArrowDownLeft className="w-3 h-3 shrink-0 text-emerald-600" />
            ) : (
              <ArrowUpRight className="w-3 h-3 shrink-0 text-orange-600" />
            )}
            <span className="text-muted-foreground shrink-0">
              {contraparte.direccion === "recibido" ? "de" : "a"}
            </span>
            <span className="font-medium truncate">{contraparte.nombre}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-0.5">
          {txEditada.fuente} • {fecha}
        </div>
      </div>
      <div className="text-right ml-4 flex items-center gap-2">
        {/* El extracto siempre da el monto en positivo; el signo lo da la dirección. */}
        <div className={`font-medium tabular-nums ${entra ? "text-emerald-600" : ""}`}>
          {entra ? "+" : "−"}
          {fmt.format(Math.abs(monto))}
        </div>
        <button
          onClick={() => onEdit(tx.id)}
          className="p-1 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function generarReporte(resultado, decisiones) {
  const posiblesDuplicadosSeleccionados = resultado.posiblesDuplicados.filter((t) =>
    ACCIONES_IMPORTAR.has(decisiones[t.id])
  ).length;

  const rescatadas = resultado.duplicados.filter((t) => decisiones[t.id] === "rescatar").length;

  return {
    resumen: {
      totalProcessadas: resultado.totalProcessadas,
      nuevas: resultado.nuevas.length,
      posiblesDuplicados: resultado.posiblesDuplicados.length,
      posiblesDuplicadosSeleccionados,
      duplicados: resultado.duplicados.length,
      rescatadas,
      totalAImportar: resultado.nuevas.length + posiblesDuplicadosSeleccionados + rescatadas,
    },
  };
}
