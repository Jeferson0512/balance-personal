import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, PageHeader, Metrica } from "./ui";

const fechaCorta = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-ES", { month: "short", year: "numeric" }) : "—";
import { Upload, AlertCircle, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import UploadFiles from "./UploadFiles";
import PreviewImportacion from "./PreviewImportacion";
import { parseYAPEExcel } from "../services/parseYAPE";
import { parseBCPPDF } from "../services/parseBCP";
import { deduplicarTransacciones } from "../services/deduplicator";
import { aImportables } from "../services/importador.js";
import { parseMoneyManagerExcel, esFormatoMoneyManager } from "../services/parseMoneyManager.js";
import { aImportablesMoneyManager, categoriasFaltantes } from "../services/importadorMoneyManager.js";
import { avisoExito, confirmarPeligro } from "../ui/dialogos.js";
import { cargarConfig, guardarConfig } from "../datos/config.js";
import * as XLSX from "xlsx";

/** Lee solo las primeras filas para decidir de qué app viene el Excel. */
async function pareceMoneyManager(file) {
  try {
    const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: "array", sheetRows: 6 });
    const hoja = wb.Sheets[wb.SheetNames[0]];
    return esFormatoMoneyManager(XLSX.utils.sheet_to_json(hoja, { header: 1, raw: false }));
  } catch {
    return false;
  }
}

export default function GestorImportaciones({ transacciones, setTransacciones, cuentas, setCuentas }) {
  const [paso, setPaso] = useState("upload"); // upload, preview, confirmar
  const [yapeData, setYapeData] = useState(null);
  const [bcpData, setBcpData] = useState(null);
  const [deduplicacionResultado, setDeduplicacionResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [muestraTexto, setMuestraTexto] = useState(null);
  // Un PDF protegido corta el flujo: se guardan los archivos para reintentar
  // en cuanto el usuario escriba la contraseña.
  const [pdfProtegido, setPdfProtegido] = useState(null);
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState(cargarConfig);
  const [moneyManager, setMoneyManager] = useState(null);
  const [cuentasVigentes, setCuentasVigentes] = useState(new Set());

  const alternarVigencia = (id) => {
    setCuentasVigentes((prev) => {
      const copia = new Set(prev);
      copia.has(id) ? copia.delete(id) : copia.add(id);
      return copia;
    });
  };

  /* Una cuenta que ya no existe conserva su historia, pero se marca inactiva:
     si no, seguiría apareciendo en los selectores y en el reparto de saldos
     como si todavía tuvieras esa tarjeta. */
  const aplicarVigencia = (listaCuentas) =>
    listaCuentas.map((c) =>
      moneyManager?.cuentasUsadas.some((u) => u.id === c.id) && !cuentasVigentes.has(c.id)
        ? { ...c, activa: false }
        : c
    );

  const importarMoneyManager = async () => {
    const { transacciones: movimientos, categorias, archivo } = moneyManager;

    const yaImportados = new Set(
      transacciones.map((t) => t.metadatos?.fingerprint).filter(Boolean)
    );
    const nuevos = movimientos.filter((m) => !yaImportados.has(m.fingerprint));

    if (nuevos.length === 0) {
      avisoExito("Sin novedades", "Todos esos movimientos ya estaban importados");
      setMoneyManager(null);
      return;
    }

    const nuevasCuentas = categoriasFaltantes(categorias, cuentas);
    const cuentasFinales = aplicarVigencia([...cuentas, ...nuevasCuentas]);
    setCuentas(cuentasFinales);

    setTransacciones([
      ...transacciones,
      ...aImportablesMoneyManager(nuevos, { cuentas: cuentasFinales }),
    ]);

    setMoneyManager(null);
    avisoExito(
      `${nuevos.length} movimientos importados`,
      nuevasCuentas.length ? `Se crearon ${nuevasCuentas.length} categorías` : archivo
    );
  };

  const borrarTodoYImportar = async () => {
    const ok = await confirmarPeligro({
      titulo: "¿Borrar todo lo actual?",
      html: `
        <p>Se eliminarán las <strong>${transacciones.length} transacciones</strong> que hay ahora
        y se dejará solo el histórico de Money Manager.</p>
        <div class="balance-detalle">
          <strong>${moneyManager.transacciones.length} movimientos quedarán en su lugar</strong>
          <div class="meta">Esta acción no se puede deshacer.</div>
        </div>`,
      confirmar: "Sí, reemplazar todo",
    });
    if (!ok) return;

    const nuevasCuentas = categoriasFaltantes(moneyManager.categorias, cuentas);
    const cuentasFinales = aplicarVigencia([...cuentas, ...nuevasCuentas]);
    setCuentas(cuentasFinales);

    setTransacciones(
      aImportablesMoneyManager(moneyManager.transacciones, { cuentas: cuentasFinales })
    );
    setMoneyManager(null);
    avisoExito(
      `${moneyManager.transacciones.length} movimientos importados`,
      "Se reemplazó todo lo anterior"
    );
  };

  const actualizarTitular = (nombreTitular) => {
    const nueva = { ...config, nombreTitular };
    setConfig(nueva);
    guardarConfig(nueva);
  };

  const handleFilesSelected = async (files, passwordPDF = "") => {
    setLoading(true);
    setError(null);
    setMuestraTexto(null);

    try {
      let yape = null;
      let bcp = null;

      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || file.type.includes('spreadsheet');
        const isPDF = fileName.endsWith('.pdf') || file.type.includes('pdf');

        if (isExcel) {
          try {
            // Money Manager y YAPE son ambos .xlsx: se distingue por columnas.
            if (await pareceMoneyManager(file)) {
              const datos = await parseMoneyManagerExcel(file);
              setMoneyManager({ ...datos, archivo: file.name });
              // Por defecto se dan por vigentes: cerrar una cuenta es la
              // excepción, y el usuario la desmarca.
              setCuentasVigentes(new Set(datos.cuentasUsadas.map((c) => c.id)));
              setLoading(false);
              return;
            }
            yape = await parseYAPEExcel(file);
            setYapeData(yape);
          } catch (err) {
            setError(`Error al parsear ${file.name}: ${err.message}`);
            setLoading(false);
            return;
          }
        } else if (isPDF) {
          try {
            bcp = await parseBCPPDF(file, passwordPDF);
            setBcpData(bcp);
            setPdfProtegido(null);
          } catch (err) {
            if (err.requierePassword) {
              setPdfProtegido({ archivos: files, nombre: file.name, incorrecta: err.incorrecta });
              setError(null);
              setLoading(false);
              return;
            }
            setError(`Error al parsear ${file.name}: ${err.message}`);
            if (err.muestra?.length) setMuestraTexto(err.muestra);
            setLoading(false);
            return;
          }
        }
      }

      if (!yape && !bcp) {
        setError("No se pudieron parsear los archivos. Verifica que sean YAPE (Excel) y/o BCP (PDF)");
        setLoading(false);
        return;
      }

      const resultado = deduplicarTransacciones(
        yape || [],
        bcp || [],
        transacciones
      );

      setDeduplicacionResultado(resultado);
      setPaso("preview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reintentarConPassword = (e) => {
    e.preventDefault();
    if (!password.trim() || !pdfProtegido) return;
    const archivos = pdfProtegido.archivos;
    // La contraseña no se conserva más allá del reintento.
    setPassword("");
    handleFilesSelected(archivos, password);
  };

  const handleImportar = (transaccionesAImportar) => {
    try {
      const nuevasTransacciones = aImportables(transaccionesAImportar, { cuentas, config });

      // Agregar a transacciones existentes
      setTransacciones([...transacciones, ...nuevasTransacciones]);

      // Reset
      setPaso("upload");
      setYapeData(null);
      setBcpData(null);
      setDeduplicacionResultado(null);

      avisoExito(
        `${nuevasTransacciones.length} transacciones importadas`,
        "Ya están en tu historial"
      );
    } catch (err) {
      setError(`Error al importar: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        titulo="Importar transacciones"
        descripcion="Sube el Excel de YAPE o el estado de cuenta de BCP"
      />

      {/* Nombre del titular: sin él, moverte dinero entre tus propias
          cuentas se contabiliza como ingreso. */}
      {paso === "upload" && (
        <Card className={config.nombreTitular ? undefined : "border-amber-300 bg-amber-50"}>
          <CardContent className="pt-6">
            <label className="block text-sm font-medium mb-1">Tu nombre como aparece en los extractos</label>
            <p className="text-xs text-muted-foreground mb-2">
              Sirve para reconocer cuándo te transfieres dinero entre tus propias cuentas (por ejemplo de
              PLIN a YAPE). Sin esto, esos traspasos se cuentan como ingresos y tu balance queda inflado.
            </p>
            <input
              type="text"
              value={config.nombreTitular}
              onChange={(e) => actualizarTitular(e.target.value)}
              placeholder="Ej. Jeferson Bujaico Rodriguez"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
            />
            {!config.nombreTitular && (
              <p className="text-xs text-amber-800 mt-2">
                Configúralo antes de importar para no repetir el trabajo después.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Excel de Money Manager: no pasa por la deduplicación de extractos
          porque la categoría ya viene decidida por el usuario. */}
      {moneyManager && (
        <Card className="border-primary/40">
          <CardContent className="pt-6">
            <h2 className="font-medium">Histórico de Money Manager detectado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {moneyManager.archivo}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Metrica etiqueta="Movimientos" valor={String(moneyManager.transacciones.length)} />
              <Metrica
                etiqueta="Categorías"
                valor={String(categoriasFaltantes(moneyManager.categorias, cuentas).length)}
                detalle="a crear"
              />
              <Metrica
                etiqueta="Desde"
                valor={fechaCorta(moneyManager.transacciones.at(-1)?.fecha)}
              />
              <Metrica
                etiqueta="Hasta"
                valor={fechaCorta(moneyManager.transacciones[0]?.fecha)}
              />
            </div>

            <div className="mt-5 rounded-lg border border-border p-3">
              <p className="text-sm font-medium">¿Cuáles de estas cuentas sigues usando?</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Las que desmarques conservan su historial, pero quedan cerradas: no saldrán en los
                selectores ni contarán como saldo disponible.
              </p>

              <div className="mt-3 space-y-1.5">
                {moneyManager.cuentasUsadas.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={cuentasVigentes.has(c.id)}
                      onChange={() => alternarVigencia(c.id)}
                      className="accent-primary"
                    />
                    <span className="flex-1 truncate">{c.nombre}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {c.movimientos} mov.
                    </span>
                    {!cuentasVigentes.has(c.id) && (
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        cerrada
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={importarMoneyManager}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Añadir a lo que ya tengo
              </button>
              <button
                onClick={borrarTodoYImportar}
                className="rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                Reemplazar todo por este histórico
              </button>
              <button
                onClick={() => setMoneyManager(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF protegido: pedir contraseña */}
      {pdfProtegido && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-amber-900">
                  {pdfProtegido.nombre} está protegido con contraseña
                </div>
                <div className="text-sm text-amber-800 mt-1">
                  BCP cifra el estado de cuenta con el <strong>DNI del titular</strong> (8 dígitos, sin
                  guiones). Se usa solo para abrir el archivo aquí en tu navegador: no se guarda ni sale
                  de tu equipo.
                </div>

                <form onSubmit={reintentarConPassword} className="flex gap-2 mt-3">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña del PDF"
                    autoFocus
                    autoComplete="off"
                    className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm bg-background"
                  />
                  <button
                    type="submit"
                    disabled={!password.trim() || loading}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Abriendo..." : "Desbloquear"}
                  </button>
                </form>

                {pdfProtegido.incorrecta && (
                  <div className="text-sm text-red-700 mt-2">
                    La contraseña no es correcta. Prueba con el DNI del titular de la cuenta.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errores */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-semibold text-red-900">Error</div>
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>

              {muestraTexto && (
                <details className="mt-3">
                  <summary className="text-xs text-red-800 cursor-pointer">
                    Ver el texto que sí se extrajo del PDF
                  </summary>
                  <pre className="mt-2 p-2 bg-background/70 rounded text-[11px] overflow-x-auto max-h-48">
                    {muestraTexto.join("\n")}
                  </pre>
                  <div className="text-xs text-red-800 mt-1">
                    Comparte estas líneas para ajustar el lector al formato de tu extracto.
                  </div>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 1: Upload */}
      {paso === "upload" && (
        <UploadFiles
          onFilesSelected={handleFilesSelected}
          loading={loading}
        />
      )}

      {/* PASO 2: Preview */}
      {paso === "preview" && deduplicacionResultado && (
        <PreviewImportacion
          resultado={deduplicacionResultado}
          onConfirmar={handleImportar}
          onCancelar={() => {
            setPaso("upload");
            setDeduplicacionResultado(null);
          }}
        />
      )}
    </div>
  );
}
