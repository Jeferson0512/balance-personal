import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "./ui";
import { AlertCircle, X } from "lucide-react";

/* Bloque 6 — Disclaimer Legal (RF-13) */

export function DisclaimerModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-1" />
            <CardTitle>Disclaimer Legal</CardTitle>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold text-base mb-2">⚠️ Herramienta Educativa</h3>
            <p className="text-muted-foreground">
              Balance es una herramienta educativa y de registro personal de finanzas. Funciona como un cuaderno digital que te
              ayuda a llevar un registro organizado de tus movimientos de dinero usando los principios de la contabilidad de partida doble.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">❌ No es asesoría financiera</h3>
            <p className="text-muted-foreground">
              Balance <strong>no proporciona asesoría financiera, de inversiones, ni tributaria</strong>. No debe usarse como base
              para decisiones de inversión, gestión de deuda o planificación fiscal. Consulta con profesionales licenciados (asesor
              financiero, contador, abogado) para cualquier decisión importante.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">📋 No es asesoría contable</h3>
            <p className="text-muted-foreground">
              Los reportes generados por Balance son un registro personal. Si necesitas estados financieros formales para propósitos
              legales, tributarios o de negocio, debes contar con un contador profesional certificado.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">🔒 Privacidad de datos</h3>
            <p className="text-muted-foreground">
              En el MVP, todos los datos se guardan localmente en tu dispositivo (localStorage del navegador). Ningún dato se envía
              a servidores externos. Eres responsable de hacer backup de tus datos. Si limpias el almacenamiento del navegador,
              los datos se pierden.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">⚖️ Responsabilidad</h3>
            <p className="text-muted-foreground">
              El usuario es responsable de la precisión y completitud de los datos que ingresa. Balance calcula basado en lo que
              registres; si hay errores en el registro, los cálculos reflejarán esos errores. Verifica regularmente tus transacciones.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2">📅 Cambios en la herramienta</h3>
            <p className="text-muted-foreground">
              Esta herramienta está en desarrollo (MVP). Funcionalidades, interfaz y comportamiento pueden cambiar sin aviso.
              No se garantiza compatibilidad hacia atrás con datos antiguos.
            </p>
          </section>

          <section className="bg-muted/50 p-3 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Resumen:</strong> Balance es tu cuaderno de finanzas personales. Úsalo para organizar, entender y registrar
              tu dinero. Para decisiones importantes (inversiones, deuda, impuestos), consulta con profesionales.
            </p>
          </section>

          <Button onClick={onClose} className="w-full">
            Entendido, cerrar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente alternativo: página completa del disclaimer
export function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
            <div>
              <CardTitle>Disclaimer Legal</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Importante: lee antes de usar Balance</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <section>
            <h3 className="font-semibold text-lg mb-2">⚠️ Herramienta Educativa</h3>
            <p className="text-muted-foreground">
              Balance es una herramienta educativa y de registro personal de finanzas. Funciona como un cuaderno digital que te
              ayuda a llevar un registro organizado de tus movimientos de dinero usando los principios de la contabilidad de partida doble.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">❌ No es asesoría financiera</h3>
            <p className="text-muted-foreground">
              Balance <strong>no proporciona asesoría financiera, de inversiones, ni tributaria</strong>. No debe usarse como base
              para decisiones de inversión, gestión de deuda o planificación fiscal. Consulta con profesionales licenciados (asesor
              financiero, contador, abogado) para cualquier decisión importante.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">📋 No es asesoría contable</h3>
            <p className="text-muted-foreground">
              Los reportes generados por Balance son un registro personal. Si necesitas estados financieros formales para propósitos
              legales, tributarios o de negocio, debes contar con un contador profesional certificado.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">🔒 Privacidad de datos</h3>
            <p className="text-muted-foreground">
              En el MVP, todos los datos se guardan localmente en tu dispositivo (localStorage del navegador). Ningún dato se envía
              a servidores externos. Eres responsable de hacer backup de tus datos. Si limpias el almacenamiento del navegador,
              los datos se pierden.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">⚖️ Responsabilidad</h3>
            <p className="text-muted-foreground">
              El usuario es responsable de la precisión y completitud de los datos que ingresa. Balance calcula basado en lo que
              registres; si hay errores en el registro, los cálculos reflejarán esos errores. Verifica regularmente tus transacciones.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2">📅 Cambios en la herramienta</h3>
            <p className="text-muted-foreground">
              Esta herramienta está en desarrollo (MVP). Funcionalidades, interfaz y comportamiento pueden cambiar sin aviso.
              No se garantiza compatibilidad hacia atrás con datos antiguos.
            </p>
          </section>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
            <p className="text-sm text-emerald-900 font-medium">
              ✅ <strong>Resumen:</strong> Balance es tu cuaderno de finanzas personales. Úsalo para organizar, entender y registrar
              tu dinero. Para decisiones importantes (inversiones, deuda, impuestos), consulta con profesionales.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
