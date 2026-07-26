import { AlertCircle, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useIsDesktop } from "../hooks/useIsDesktop.js";

export default function Navbar({
  sidebarCollapsed,
  onToggleCollapse,
  sidebarOpen,
  onToggleSidebar,
  onDisclaimerClick,
}) {
  const isDesktop = useIsDesktop();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border shadow-sm z-50">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left: Toggle + Branding */}
        <div className="flex items-center gap-2">
          {/* Hamburguesa SOLO en móvil */}
          {!isDesktop && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center p-2 hover:bg-muted rounded-lg transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Toggle collapse SOLO en desktop */}
          {isDesktop && (
            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center p-2 hover:bg-muted rounded-lg transition-colors"
              title={sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}

          {/* Branding */}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground">💰 Balance</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">MVP + MLP</p>
          </div>
        </div>

        {/* Right: Disclaimer */}
        <button
          className="flex items-center justify-center p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
          title="Ver disclaimer legal"
          onClick={onDisclaimerClick}
        >
          <AlertCircle className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
