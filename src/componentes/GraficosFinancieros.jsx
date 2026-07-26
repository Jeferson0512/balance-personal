import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, PageHeader } from "./ui";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { saldoCrudo, esDebitoNormal, patrimonioNeto } from "../motor/motor.js";
import { fmtPEN as fmt } from "../datos/semillas.js";
import { TrendingUp, TrendingDown } from "lucide-react";

/* MLP — Gráficos de ingresos vs gastos */

export default function GraficosFinancieros({ transacciones, cuentas }) {
  const movimientos = useMemo(() => transacciones.flatMap((t) => t.movimientos), [transacciones]);

  // Agrupar transacciones por mes
  const datosPorMes = useMemo(() => {
    const meses = {};

    transacciones.forEach((tx) => {
      const fecha = new Date(tx.fecha);
      const mesKey = fecha.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit" });

      if (!meses[mesKey]) {
        meses[mesKey] = { mes: mesKey, ingresos: 0, gastos: 0, transferencias: 0 };
      }

      tx.movimientos.forEach((mov) => {
        const cuenta = cuentas.find((c) => c.id === mov.idCuenta);
        if (!cuenta) return;

        const monto = Math.abs(mov.monto);

        if (cuenta.tipo === "ingreso") {
          meses[mesKey].ingresos += monto;
        } else if (cuenta.tipo === "gasto") {
          meses[mesKey].gastos += monto;
        }
      });
    });

    return Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [transacciones, cuentas]);

  // Calcular totales por categoría de gasto
  const gastosPorCategoria = useMemo(() => {
    const cats = {};

    cuentas
      .filter((c) => c.tipo === "gasto" && c.idPadre === null)
      .forEach((cat) => {
        const crudo = saldoCrudo(cat.id, movimientos);
        const mostrado = esDebitoNormal(cat.tipo) ? crudo : -crudo;
        if (mostrado > 0) {
          cats[cat.nombre] = mostrado;
        }
      });

    return Object.entries(cats)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8); // Top 8
  }, [cuentas, movimientos]);

  // Colores para los gráficos
  const COLORES = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  // Totales generales
  const totalIngresos = datosPorMes.reduce((sum, m) => sum + m.ingresos, 0);
  const totalGastos = datosPorMes.reduce((sum, m) => sum + m.gastos, 0);
  const saldo = totalIngresos - totalGastos;

  // Evolución del patrimonio neto por fecha (MLP)
  const datosEvolucion = useMemo(() => {
    const sortedTx = [...transacciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const evolucion = [];
    const movsTotales = [];

    sortedTx.forEach((tx) => {
      movsTotales.push(...tx.movimientos);
      const { neto } = patrimonioNeto(cuentas, movsTotales);
      evolucion.push({
        fecha: new Date(tx.fecha).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        fechaCompleta: tx.fecha,
        patrimonio: neto,
      });
    });

    // Retornar solo el último de cada día (evitar muchos puntos)
    const porDia = {};
    evolucion.forEach((e) => {
      porDia[e.fechaCompleta] = e;
    });
    return Object.values(porDia);
  }, [transacciones, cuentas]);

  return (
    <div className="space-y-4">
      <PageHeader
        titulo="Gráficos"
        descripcion="Análisis detallado de tus ingresos, gastos y patrimonio"
      />

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2">
        <Card>
          <CardContent className="pt-2 md:pt-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-muted-foreground mb-1">Ingresos</div>
                <div className="text-base md:text-2xl font-bold text-emerald-600">{fmt.format(totalIngresos)}</div>
              </div>
              <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-emerald-600 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-2 md:pt-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-muted-foreground mb-1">Gastos</div>
                <div className="text-base md:text-2xl font-bold text-red-600">{fmt.format(totalGastos)}</div>
              </div>
              <TrendingDown className="w-4 md:w-5 h-4 md:h-5 text-red-600 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-2 md:pt-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-muted-foreground mb-1">Saldo</div>
                <div className={`text-base md:text-2xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                  {fmt.format(saldo)}
                </div>
              </div>
              <div className={`w-4 md:w-5 h-4 md:h-5 rounded-full shrink-0 ${saldo >= 0 ? "bg-blue-100" : "bg-orange-100"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de líneas: ingresos y gastos por mes */}
      {datosPorMes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos por mes</CardTitle>
            <CardDescription>Comparativa mes a mes de tus movimientos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => fmt.format(value)} />
                <Legend />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de línea: evolución del patrimonio */}
      {datosEvolucion.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolución del patrimonio neto</CardTitle>
            <CardDescription>Cómo ha crecido o disminuido tu patrimonio en el tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosEvolucion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => fmt.format(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="patrimonio"
                  stroke="#3b82f6"
                  dot={false}
                  name="Patrimonio neto"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de pastel: distribución de gastos por categoría */}
      {gastosPorCategoria.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución de gastos</CardTitle>
            <CardDescription>Dónde va la mayor parte de tu dinero</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    dataKey="valor"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => fmt.format(value)} />
                </PieChart>
              </ResponsiveContainer>

              {/* Leyenda detallada */}
              <div className="flex-1 space-y-2">
                {gastosPorCategoria.map((cat, idx) => (
                  <div key={cat.nombre} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORES[idx % COLORES.length] }} />
                    <div className="flex-1 text-sm">
                      <span className="font-medium">{cat.nombre}</span>
                      <span className="text-muted-foreground ml-2">{fmt.format(cat.valor)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {transacciones.length === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Registra transacciones para ver gráficos 📊</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
