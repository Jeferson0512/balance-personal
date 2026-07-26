import { X, Home, Send, Wallet, Calendar, BarChart3, DollarSign, Tag, Zap, AlertCircle, Upload, Trash2 } from "lucide-react";
import { useIsDesktop } from "../hooks/useIsDesktop.js";

export default function Sidebar({ vista, setVista, vistas, collapsed, setCollapsed, open, setOpen }) {
  const isDesktop = useIsDesktop();

  const grupos = [
    {
      titulo: "PRINCIPAL",
      items: [{ id: "dashboard", icon: Home, label: "Dashboard" }],
    },
    {
      titulo: "GESTIÓN",
      items: [
        { id: "transacciones", icon: Send, label: "Transacciones" },
        { id: "cuentas", icon: Wallet, label: "Cuentas" },
        { id: "importar", icon: Upload, label: "Importar" },
        { id: "recurrencias", icon: Calendar, label: "Recurrencias" },
      ],
    },
    {
      titulo: "ANÁLISIS",
      items: [
        { id: "graficos", icon: BarChart3, label: "Gráficos" },
        { id: "presupuestos", icon: DollarSign, label: "Presupuestos" },
      ],
    },
    {
      titulo: "MÁS",
      items: [
        { id: "etiquetas", icon: Tag, label: "Etiquetas" },
        { id: "papelera", icon: Trash2, label: "Papelera" },
        { id: "motor", icon: Zap, label: "Motor" },
        { id: "legal", icon: AlertCircle, label: "Legal" },
      ],
    },
  ];

  const handleItemClick = (id) => {
    setVista(id);
    if (!isDesktop) {
      setOpen(false);
    }
  };

  // En móvil, no renderizar sidebar si está cerrado
  if (!isDesktop && !open) {
    return null;
  }

  return (
    <>
      {/* BACKDROP/OVERLAY — Solo en móvil cuando está abierto */}
      {!isDesktop && open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setOpen(false)}
          role="presentation"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)]
          bg-card border-r border-border overflow-y-auto
          transition-all duration-300 z-40 flex flex-col
          ${!isDesktop ? (open ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
        style={{
          width: isDesktop ? (collapsed ? "80px" : "256px") : "256px",
        }}
      >
        <div className={`flex flex-col h-full ${collapsed ? "p-2" : "p-4"} space-y-4`}>
          {/* Header móvil: botón cerrar */}
          {!isDesktop && (
            <div className="flex items-center justify-between">
              {!collapsed && <span className="font-bold text-sm">Menú</span>}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navegación */}
          <nav className="space-y-4 flex-1 overflow-y-auto">
            {grupos.map((grupo) => (
              <div key={grupo.titulo}>
                {/* Título grupo — solo visible cuando expandido en desktop */}
                {!collapsed && (
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-2">
                    {grupo.titulo}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                  {grupo.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = vista === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg
                          text-sm font-medium transition-colors
                          ${collapsed && isDesktop && "justify-center"}
                          ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }
                        `}
                        title={collapsed && isDesktop ? item.label : ""}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
