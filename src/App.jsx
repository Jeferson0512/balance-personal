import { useState, useEffect } from "react";
import Navbar from "./componentes/Navbar.jsx";
import Sidebar from "./componentes/Sidebar.jsx";
import { DisclaimerModal } from "./componentes/DisclaimerModal.jsx";
import MotorBench from "./componentes/MotorBench.jsx";
import GestorCuentas from "./componentes/GestorCuentas.jsx";
import GestorTransacciones from "./componentes/GestorTransacciones.jsx";
import DashboardFinanciero from "./componentes/DashboardFinanciero.jsx";
import GraficosFinancieros from "./componentes/GraficosFinancieros.jsx";
import GestorRecurrencias from "./componentes/GestorRecurrencias.jsx";
import GestorPresupuestos from "./componentes/GestorPresupuestos.jsx";
import GestorEtiquetas from "./componentes/GestorEtiquetas.jsx";
import GestorImportaciones from "./componentes/GestorImportaciones.jsx";
import Papelera from "./componentes/Papelera.jsx";
import { DisclaimerPage } from "./componentes/DisclaimerModal.jsx";
import { CUENTAS_DEFAULT } from "./datos/semillas.js";
import { TX_HISTORICO, CATEGORIAS_HISTORICO } from "./datos/historico.js";
import { soloActivas } from "./services/papelera.js";

/* Sin emojis: la iconografía la pone el sidebar con lucide, y mezclar ambas
   hace que la interfaz parezca improvisada. */
const VISTAS = [
  { id: "dashboard", nombre: "Dashboard" },
  { id: "transacciones", nombre: "Transacciones" },
  { id: "cuentas", nombre: "Cuentas" },
  { id: "importar", nombre: "Importar" },
  { id: "graficos", nombre: "Gráficos" },
  { id: "recurrencias", nombre: "Recurrencias" },
  { id: "presupuestos", nombre: "Presupuestos" },
  { id: "etiquetas", nombre: "Etiquetas" },
  { id: "papelera", nombre: "Papelera" },
  { id: "motor", nombre: "Motor" },
  { id: "legal", nombre: "Legal" },
];

const KEYS = {
  CUENTAS: "balance_cuentas",
  TRANSACCIONES: "balance_transacciones",
  RECURRENCIAS: "balance_recurrencias",
  PRESUPUESTOS: "balance_presupuestos",
  ETIQUETAS: "balance_etiquetas",
  VERSION: "balance_version_datos",
};

/* Subir este número descarta lo guardado y recarga el histórico del repo.
   Es la vía para reemplazar datos de pruebas por el punto de partida real
   sin pedirle al usuario que limpie el navegador a mano. */
const VERSION_DATOS = 4;

/* El plan de cuentas por defecto puede crecer entre versiones. Las cuentas
   guardadas mandan (el usuario pudo renombrarlas), pero las nuevas del default
   se añaden: sin ellas, una importación apuntaría a cuentas inexistentes. */
function fusionarCuentas(guardadas) {
  if (!Array.isArray(guardadas) || guardadas.length === 0) return CUENTAS_DEFAULT;
  const existentes = new Set(guardadas.map((c) => c.id));
  const faltantes = CUENTAS_DEFAULT.filter((c) => !existentes.has(c.id));
  return faltantes.length ? [...guardadas, ...faltantes] : guardadas;
}

/** Punto de partida: el histórico real, no transacciones de ejemplo. */
function datosIniciales() {
  return {
    cuentas: [...CUENTAS_DEFAULT, ...CATEGORIAS_HISTORICO],
    transacciones: TX_HISTORICO,
    recurrencias: [],
    presupuestos: [],
    etiquetas: [],
  };
}

function cargarDatos() {
  try {
    // Un cambio de versión invalida lo guardado: es lo que descarta los datos
    // de prueba de 2026 sin tener que limpiar el navegador a mano.
    const versionGuardada = Number(localStorage.getItem(KEYS.VERSION) || 0);
    if (versionGuardada < VERSION_DATOS) {
      const iniciales = datosIniciales();
      guardarDatos(
        iniciales.cuentas, iniciales.transacciones,
        iniciales.recurrencias, iniciales.presupuestos, iniciales.etiquetas
      );
      localStorage.setItem(KEYS.VERSION, String(VERSION_DATOS));
      return iniciales;
    }

    const guardadas = JSON.parse(localStorage.getItem(KEYS.TRANSACCIONES) || "null");
    return {
      cuentas: fusionarCuentas(JSON.parse(localStorage.getItem(KEYS.CUENTAS) || "null")),
      transacciones: Array.isArray(guardadas) ? guardadas : TX_HISTORICO,
      recurrencias: JSON.parse(localStorage.getItem(KEYS.RECURRENCIAS) || "null") || [],
      presupuestos: JSON.parse(localStorage.getItem(KEYS.PRESUPUESTOS) || "null") || [],
      etiquetas: JSON.parse(localStorage.getItem(KEYS.ETIQUETAS) || "null") || [],
    };
  } catch {
    return datosIniciales();
  }
}

function guardarDatos(cuentas, transacciones, recurrencias, presupuestos, etiquetas) {
  try {
    localStorage.setItem(KEYS.CUENTAS, JSON.stringify(cuentas));
    localStorage.setItem(KEYS.TRANSACCIONES, JSON.stringify(transacciones));
    localStorage.setItem(KEYS.RECURRENCIAS, JSON.stringify(recurrencias));
    localStorage.setItem(KEYS.PRESUPUESTOS, JSON.stringify(presupuestos));
    localStorage.setItem(KEYS.ETIQUETAS, JSON.stringify(etiquetas));
  } catch (e) {
    console.error("Error guardando:", e);
  }
}

export default function App() {
  const [vista, setVista] = useState("dashboard");
  const [cuentas, setCuentas] = useState(CUENTAS_DEFAULT);
  const [transacciones, setTransacciones] = useState(TX_HISTORICO);
  const [recurrencias, setRecurrencias] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [cargado, setCargado] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const datos = cargarDatos();
    setCuentas(datos.cuentas);
    setTransacciones(datos.transacciones);
    setRecurrencias(datos.recurrencias);
    setPresupuestos(datos.presupuestos);
    setEtiquetas(datos.etiquetas);
    setCargado(true);
  }, []);

  useEffect(() => {
    if (cargado) guardarDatos(cuentas, transacciones, recurrencias, presupuestos, etiquetas);
  }, [cuentas, transacciones, recurrencias, presupuestos, etiquetas, cargado]);

  if (!cargado) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;

  /* Saldos y estadísticas nunca cuentan lo que está en la papelera; solo esa
     vista trabaja con la lista completa. */
  const activas = soloActivas(transacciones);

  const renderVista = () => {
    switch (vista) {
      case "dashboard":
        return <DashboardFinanciero transacciones={activas} cuentas={cuentas} />;
      case "transacciones":
        return <GestorTransaccionesState transacciones={transacciones} setTransacciones={setTransacciones} cuentas={cuentas} />;
      case "cuentas":
        return <GestorCuentasState cuentas={cuentas} setCuentas={setCuentas} transacciones={activas} />;
      case "importar":
        return <GestorImportaciones transacciones={transacciones} setTransacciones={setTransacciones} cuentas={cuentas} setCuentas={setCuentas} />;
      case "graficos":
        return <GraficosFinancieros transacciones={activas} cuentas={cuentas} />;
      case "recurrencias":
        return <GestorRecurrencias recurrencias={recurrencias} setRecurrencias={setRecurrencias} transacciones={transacciones} setTransacciones={setTransacciones} cuentas={cuentas} />;
      case "presupuestos":
        return <GestorPresupuestos presupuestos={presupuestos} setPresupuestos={setPresupuestos} transacciones={activas} cuentas={cuentas} />;
      case "etiquetas":
        return <GestorEtiquetas etiquetas={etiquetas} setEtiquetas={setEtiquetas} transacciones={transacciones} setTransacciones={setTransacciones} cuentas={cuentas} />;
      case "papelera":
        return <Papelera transacciones={transacciones} setTransacciones={setTransacciones} />;
      case "motor":
        return <MotorBench />;
      case "legal":
        return <DisclaimerPage />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Navbar */}
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onDisclaimerClick={() => setDisclaimerOpen(true)}
      />

      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar
          vista={vista}
          setVista={setVista}
          vistas={VISTAS}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        {/* Contenido principal */}
        <main className={`flex-1 overflow-auto h-[calc(100vh-4rem)] transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}>
          <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
            {renderVista()}
          </div>
        </main>
      </div>

      {/* Modal de disclaimer */}
      <DisclaimerModal open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />
    </div>
  );
}

// Wrappers para estado local de componentes
function GestorTransaccionesState({ transacciones, setTransacciones, cuentas }) {
  return <GestorTransacciones transactionsData={{ transacciones, setTransacciones }} cuentasData={{ cuentas }} />;
}

function GestorCuentasState({ cuentas, setCuentas, transacciones }) {
  return <GestorCuentas cuentasData={{ cuentas, setCuentas }} transacciones={transacciones} />;
}
