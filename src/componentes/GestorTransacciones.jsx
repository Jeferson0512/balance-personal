import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, PageHeader } from "./ui";
import { construir, validarCuadre, conNombresCuenta } from "../motor/motor.js";
import { marcarEliminadas, soloActivas } from "../services/papelera.js";
import { CUENTAS_DEFAULT, TX_SEMILLA, fmtPEN as fmt } from "../datos/semillas.js";
import { Plus, Trash2, Edit2, Check, X, Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { confirmarPeligro, avisoExito } from "../ui/dialogos.js";
import { escaparHtml } from "../ui/escaparHtml.js";

/* Bloque 3 — Gestor de transacciones (RF-04, RF-07, RF-08) */

const TIPOS_TX = [
  { v: "gasto", t: "Gasto", icono: ArrowUpRight, tono: "text-rose-600", desc: "Dinero que sale de una cuenta a una categoría" },
  { v: "ingreso", t: "Ingreso", icono: ArrowDownLeft, tono: "text-emerald-600", desc: "Dinero que entra de una categoría a una cuenta" },
  { v: "transferencia", t: "Transferencia", icono: ArrowLeftRight, tono: "text-primary", desc: "Dinero que se mueve entre tus cuentas" },
];

export default function GestorTransacciones({ transactionsData, cuentasData }) {
  // Si vienen props del App (con persistencia), usarlas; si no, usar estado local
  const [transaccionesLocal, setTransaccionesLocal] = useState(TX_SEMILLA);
  const [cuentasLocal] = useState(CUENTAS_DEFAULT);

  const transacciones = transactionsData?.transacciones || transaccionesLocal;
  const setTransacciones = transactionsData?.setTransacciones || setTransaccionesLocal;
  const cuentas = cuentasData?.cuentas || cuentasLocal;

  // Estado del formulario
  const [tipoTx, setTipoTx] = useState("gasto");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [categoriaId, setCategoriaId] = useState("");
  const [cuentaPagoId, setCuentaPagoId] = useState("");
  const [cuentaDestinoId, setCuentaDestinoId] = useState("");
  const [msg, setMsg] = useState("");

  // Estado de edición
  const [editId, setEditId] = useState(null);
  const [editMonto, setEditMonto] = useState("");

  // Filtros del historial
  const [busqueda, setBusqueda] = useState("");
  const [filtroCuenta, setFiltroCuenta] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Opciones dinámicas según tipo de transacción
  const categorias = useMemo(
    () => cuentas.filter((c) => c.activa && (tipoTx === "gasto" ? c.tipo === "gasto" : c.tipo === "ingreso")),
    [cuentas, tipoTx]
  );

  const cuentasActivo = useMemo(
    () => cuentas.filter((c) => c.activa && c.tipo === "activo"),
    [cuentas]
  );

  const cuentasPasivo = useMemo(
    () => cuentas.filter((c) => c.activa && c.tipo === "pasivo"),
    [cuentas]
  );

  // Cuentas de pago (activos + pasivos)
  const cuentasPago = useMemo(() => [...cuentasActivo, ...cuentasPasivo], [cuentasActivo, cuentasPasivo]);

  function crear() {
    setMsg("");

    // Validar datos comunes
    const m = parseFloat(monto);
    if (!monto || isNaN(m) || m <= 0) {
      setMsg("Ingresa un monto válido y positivo.");
      return;
    }
    if (!descripcion.trim()) {
      setMsg("Escribe una descripción.");
      return;
    }

    // Validar según tipo
    if (tipoTx === "gasto") {
      if (!categoriaId || !cuentaPagoId) {
        setMsg("Selecciona categoría y cuenta de pago.");
        return;
      }
      const movimientos = construir.gasto({ categoriaId, cuentaPagoId, monto: m });
      const validacion = validarCuadre(movimientos);
      if (!validacion.ok) {
        setMsg(validacion.error);
        return;
      }
      const id = "tx-" + Date.now().toString(36);
      setTransacciones((prev) => [...prev, { id, fecha, descripcion: descripcion.trim(), movimientos: conNombresCuenta(movimientos, cuentas) }]);
    } else if (tipoTx === "ingreso") {
      if (!categoriaId || !cuentaDestinoId) {
        setMsg("Selecciona categoría y cuenta de destino.");
        return;
      }
      const movimientos = construir.ingreso({ categoriaId, cuentaDestinoId, monto: m });
      const validacion = validarCuadre(movimientos);
      if (!validacion.ok) {
        setMsg(validacion.error);
        return;
      }
      const id = "tx-" + Date.now().toString(36);
      setTransacciones((prev) => [...prev, { id, fecha, descripcion: descripcion.trim(), movimientos: conNombresCuenta(movimientos, cuentas) }]);
    } else if (tipoTx === "transferencia") {
      if (!cuentaPagoId || !cuentaDestinoId) {
        setMsg("Selecciona cuenta origen y destino.");
        return;
      }
      if (cuentaPagoId === cuentaDestinoId) {
        setMsg("Las cuentas origen y destino no pueden ser iguales.");
        return;
      }
      const movimientos = construir.transferencia({ origenId: cuentaPagoId, destinoId: cuentaDestinoId, monto: m });
      const validacion = validarCuadre(movimientos);
      if (!validacion.ok) {
        setMsg(validacion.error);
        return;
      }
      const id = "tx-" + Date.now().toString(36);
      setTransacciones((prev) => [...prev, { id, fecha, descripcion: descripcion.trim(), movimientos: conNombresCuenta(movimientos, cuentas) }]);
    }

    // Limpiar formulario
    setMonto("");
    setDescripcion("");
    setFecha(new Date().toISOString().split("T")[0]);
    setCategoriaId("");
    setCuentaPagoId("");
    setCuentaDestinoId("");
    setMsg("✅ Transacción registrada.");
  }

  async function eliminar(id) {
    const tx = transacciones.find((t) => t.id === id);
    if (!tx) return;

    const monto = Math.abs(tx.movimientos?.[0]?.monto ?? 0);
    const quien = tx.contraparte?.nombre
      ? `${tx.contraparte.direccion === "recibido" ? "de" : "a"} ${tx.contraparte.nombre}`
      : "";

    const ok = await confirmarPeligro({
      titulo: "¿Eliminar esta transacción?",
      html: `
        <div class="balance-detalle">
          <strong>${escaparHtml(tx.descripcion || "Sin descripción")}</strong>
          <div class="meta">${escaparHtml(quien)}</div>
          <div class="meta">${new Date(tx.fecha).toLocaleDateString("es-ES")} · ${fmt.format(monto)}${
            tx.metadatos?.fuente ? ` · ${tx.metadatos.fuente}` : ""
          }</div>
        </div>
        <p style="margin-top:.75rem">Irá a la papelera; podrás recuperarla.</p>`,
      confirmar: "Enviar a la papelera",
    });
    if (!ok) return;

    setTransacciones((prev) => marcarEliminadas(prev, [id]));
    avisoExito("Transacción eliminada", "Puedes recuperarla desde la papelera");
  }

  function abrirEditar(tx) {
    setEditId(tx.id);
    setEditMonto(tx.movimientos[0].monto.toString());
  }

  function guardarEdit(id) {
    const m = parseFloat(editMonto);
    if (!editMonto || isNaN(m) || m <= 0) {
      setMsg("Monto inválido.");
      return;
    }

    setTransacciones((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          // Recalcular movimientos con el nuevo monto
          const factor = m / Math.abs(t.movimientos[0].monto);
          const nuevosMov = t.movimientos.map((mov) => ({ ...mov, monto: mov.monto * factor }));
          return { ...t, movimientos: nuevosMov };
        }
        return t;
      })
    );

    setEditId(null);
    setEditMonto("");
    setMsg("✅ Transacción actualizada.");
  }

  function cancelarEdit() {
    setEditId(null);
    setEditMonto("");
  }

  // Ordenar por fecha descendente y aplicar filtros
  const txOrdenadas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return soloActivas(transacciones)
      .filter((tx) => {
        if (texto) {
          const enDescripcion = (tx.descripcion || "").toLowerCase().includes(texto);
          const enContraparte = (tx.contraparte?.nombre || "").toLowerCase().includes(texto);
          if (!enDescripcion && !enContraparte) return false;
        }

        if (filtroCuenta && !tx.movimientos?.some((m) => m.idCuenta === filtroCuenta)) return false;

        // Las importadas traen fecha ISO completa; recortar para comparar por día.
        const dia = (tx.fecha || "").slice(0, 10);
        if (desde && dia < desde) return false;
        if (hasta && dia > hasta) return false;

        return true;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [transacciones, busqueda, filtroCuenta, desde, hasta]);

  const hayFiltros = Boolean(busqueda || filtroCuenta || desde || hasta);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroCuenta("");
    setDesde("");
    setHasta("");
  }

  // Buscar nombre de cuenta
  const nombreCuenta = (id) => cuentas.find((c) => c.id === id)?.nombre || "?";

  /* La categoría dice más que la cuenta de fondos: en un ingreso el primer
     movimiento es la cuenta destino, y "YAPE • YAPE" no informa de nada. */
  const etiquetaCuenta = (tx) => {
    const conCategoria = tx.movimientos?.find((m) => {
      const c = cuentas.find((x) => x.id === m.idCuenta);
      return c?.tipo === "gasto" || c?.tipo === "ingreso";
    });
    return nombreCuenta((conCategoria || tx.movimientos?.[0])?.idCuenta);
  };

  return (
    <div className="space-y-4">
      <PageHeader titulo="Transacciones" descripcion="Registra movimientos y consulta tu historial" />

      {/* Formulario de creación */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar transacción</CardTitle>
          <CardDescription>Ingresa un movimiento (gasto, ingreso o transferencia)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleccionar tipo */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de transacción</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TIPOS_TX.map((t) => (
                <button
                  key={t.v}
                  onClick={() => {
                    setTipoTx(t.v);
                    setCategoriaId("");
                    setCuentaPagoId("");
                    setCuentaDestinoId("");
                    setMsg("");
                  }}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    tipoTx === t.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <t.icono className={`h-4 w-4 ${t.tono}`} />
                    {t.t}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Campos comunes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monto</label>
              <Input type="number" step="0.01" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input
              placeholder="Ej. Almuerzo con amigos"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Campos condicionales según tipo */}
          {(tipoTx === "gasto" || tipoTx === "ingreso") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {tipoTx === "gasto" ? "Categoría de gasto" : "Categoría de ingreso"}
                </label>
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  {tipoTx === "gasto" ? "Cuenta de pago" : "Cuenta de destino"}
                </label>
                <select
                  value={tipoTx === "gasto" ? cuentaPagoId : cuentaDestinoId}
                  onChange={(e) => (tipoTx === "gasto" ? setCuentaPagoId(e.target.value) : setCuentaDestinoId(e.target.value))}
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
            </div>
          )}

          {tipoTx === "transferencia" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div>
                <label className="block text-sm font-medium mb-1">Desde (cuenta origen)</label>
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

              <div>
                <label className="block text-sm font-medium mb-1">Hacia (cuenta destino)</label>
                <select
                  value={cuentaDestinoId}
                  onChange={(e) => setCuentaDestinoId(e.target.value)}
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
            </div>
          )}

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
            <Plus className="w-4 h-4 mr-2" /> Registrar transacción
          </Button>
        </CardContent>
      </Card>

      {/* Historial de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de transacciones</CardTitle>
          <CardDescription>
            {hayFiltros
              ? `${txOrdenadas.length} de ${transacciones.length} transacciones`
              : `${transacciones.length} transacciones registradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-4 space-y-3 p-3 bg-muted/40 rounded-lg border border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción o persona (ej. Diana)"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={filtroCuenta}
                onChange={(e) => setFiltroCuenta(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              >
                <option value="">Todas las cuentas</option>
                {cuentas
                  .filter((c) => c.activa)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
              </select>

              <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} title="Desde" />
              <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} title="Hasta" />
            </div>

            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {txOrdenadas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {hayFiltros ? "Ninguna transacción coincide con los filtros." : "No hay transacciones todavía."}
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {txOrdenadas.map((tx) => {
                const monto = Math.abs(tx.movimientos?.[0]?.monto ?? 0);
                const contraparte = tx.contraparte;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{tx.descripcion}</div>

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
                        {new Date(tx.fecha).toLocaleDateString("es-ES")} • {etiquetaCuenta(tx)}
                        {tx.metadatos?.fuente && ` • ${tx.metadatos.fuente}`}
                      </div>
                    </div>

                    {editId === tx.id ? (
                      <div className="flex gap-2 items-center shrink-0 ml-4">
                        <Input
                          type="number"
                          step="0.01"
                          value={editMonto}
                          onChange={(e) => setEditMonto(e.target.value)}
                          className="w-24 text-right"
                        />
                        <Button size="sm" onClick={() => guardarEdit(tx.id)} className="bg-emerald-600 hover:bg-emerald-700">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelarEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="tabular-nums font-medium">{fmt.format(monto)}</span>
                        <button
                          onClick={() => abrirEditar(tx)}
                          className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminar(tx.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
