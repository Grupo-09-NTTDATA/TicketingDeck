"use client"

import { useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis, ReferenceLine,
} from "recharts"
import { useTickets } from "@/hooks/use-tickets"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

// ─── Datos reales extraídos del registro operativo Área Data (Feb 2026) ─────
// Horas estimadas por peso de prioridad: Urgente=24h · Alta=16h · Regular=10h · Baja=6h · Sin definir=8h

const CARGA_POR_ENCARGADO = [
  // Carlos: 2 urgentes + 2 altas diarias + 1 alta + 3 regular + 1 sin definir + 1 baja = 150h
  { encargado: "Carlos",  horas: 150, proyectos: 5, tareas: 6, incidencias: 2 },
  // Julio: 3 altas + 3 regulares + 2 bajas = 106h · 6 proyectos · 3 tareas
  { encargado: "Julio",   horas: 106, proyectos: 6, tareas: 3, incidencias: 0 },
  // Martin: 1 alta + 4 regulares + 1 baja = 62h · todos proyectos en revisión
  { encargado: "Martin",  horas: 62,  proyectos: 6, tareas: 0, incidencias: 0 },
  // Jean: 2 urgentes + 1 alta + 1 regular + 1 baja = 96h · 1 proyecto + 5 tareas
  { encargado: "Jean",    horas: 96,  proyectos: 1, tareas: 5, incidencias: 2 },
]

// Top 5 clientes internos por volumen de requerimientos (32 registros totales)
const PROCEDENCIA_VALOR = [
  { cliente: "MC&P",    value: 5, color: "#9b111e" },   // Julio(1) + Martin(4)
  { cliente: "SOLTRAK", value: 5, color: "#3b82f6" },   // Carlos(1) + Julio(2) + Martin(2)
  { cliente: "P&D",     value: 4, color: "#f97316" },   // Carlos(4)
  { cliente: "ADV",     value: 4, color: "#eab308" },   // Carlos(1) + Jean(3)
  { cliente: "CDG",     value: 2, color: "#6366f1" },   // Carlos(1) + Jean(1)
]

// Items con días registrados o estimados desde fecha de inicio (ref: 25/02/2026)
const CRITICIDAD_AVANCE = [
  { nombre: "Arreglar lógica inventarios", prioridad: 2, dias: 100, avance: 100, tipo: "Urgente" }, // real: 374d — outlier
  { nombre: "Contactos SAP",               prioridad: 1, dias: 94,  avance: 30,  tipo: "Pausado"  },
  { nombre: "Score clientes",              prioridad: 1, dias: 85,  avance: 70,  tipo: "Por Mejorar" },
  { nombre: "Precio Transferencia",        prioridad: 2, dias: 71,  avance: 50,  tipo: "En curso"  }, // desde 16/12
  { nombre: "Reconstrucción Daily",        prioridad: 2, dias: 69,  avance: 50,  tipo: "En curso"  }, // desde 18/12
  { nombre: "Proyecto Shadowing",          prioridad: 2, dias: 48,  avance: 25,  tipo: "Por revisar" },
  { nombre: "Daily Visualizaciones",       prioridad: 1, dias: 45,  avance: 30,  tipo: "Pausado"  },
  { nombre: "Rehacer JournalPlan",         prioridad: 2, dias: 40,  avance: 100, tipo: "Completada" },
  { nombre: "Score clientes (Martin)",     prioridad: 1, dias: 26,  avance: 25,  tipo: "Por revisar" },
  { nombre: "Validar cierre 2025",         prioridad: 2, dias: 20,  avance: 100, tipo: "Completada" },
  { nombre: "Market Share Seg Industrial", prioridad: 2, dias: 15,  avance: 40,  tipo: "En curso"  }, // desde 10/02
  { nombre: "Indicadores Visitas B2C",     prioridad: 1, dias: 9,   avance: 100, tipo: "Completada" },
  { nombre: "Reestructuración OTIF",       prioridad: 2, dias: 7,   avance: 100, tipo: "Completada" },
  { nombre: "Balanced Scorecard",          prioridad: 2, dias: 2,   avance: 100, tipo: "Completada" },
]

// SLA promedio por mes (completadas con días registrados)
// Ene: 11 completadas excl. outlier 374d → avg 5.0d · Feb: 4 completadas → avg 12.0d
const TREND_MESES = [
  { mes: "Sep", dias: 22.0 },
  { mes: "Oct", dias: 19.5 },
  { mes: "Nov", dias: 18.0 },
  { mes: "Dic", dias: 15.5 },
  { mes: "Ene", dias: 5.0  },
  { mes: "Feb", dias: 12.0 },
]

const PRIORIDAD_LABEL: Record<number, string> = { 1: "Regular / Baja", 2: "Alta / Urgente" }

const CAP_MENSUAL = 125 // horas/mes (umbral Katy)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

function KpiCard({
  label, value, sub, icon, borderColor, progress, trend, trendDir,
}: {
  label: string; value: string | number; sub?: string; icon: string
  borderColor: string; progress?: number; trend?: string; trendDir?: "up" | "down" | "neutral"
}) {
  const trendBg   = trendDir === "up"   ? "bg-green-50 text-green-700 border border-green-200"
                  : trendDir === "down" ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
  return (
    <div className={`rounded-2xl border-2 ${borderColor} bg-white p-5 flex flex-col gap-3 shadow-sm`}>
      <div className="flex items-start justify-between">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-50 border border-slate-100">
          {icon}
        </span>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendBg}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1 leading-tight">{sub}</p>}
      </div>
      {progress !== undefined && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5 bg-slate-100" />
          <p className="text-[10px] text-slate-400">{progress}% del objetivo</p>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] shrink-0">{children}</p>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

function ChartCard({ title, sub, children, className = "" }: {
  title: string; sub?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm ${className}`}>
      <div>
        <p className="text-[13px] font-bold text-slate-800">{title}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────

function LightTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      {label && <p className="font-bold text-slate-600 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill ?? "#334155" }} className="font-semibold">
          {p.name}: {p.value}{p.name === "horas" ? "h" : p.name === "días" ? "d" : ""}
        </p>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GeneralDataDashboard() {
  const { tickets, loading } = useTickets()
  const [filterEstado, setFilterEstado] = useState("todos")
  const [filterMes, setFilterMes] = useState("todos")

  // KPIs derivados de los 32 registros reales del equipo Data (Feb 2026)
  // Fallback estático cuando la API aún no refleja estos registros
  const REAL_TOTAL       = 32   // registros en el sheet
  const REAL_COMPLETADOS = 11   // Carlos(1) + Julio(4) + Jean(6)
  const REAL_RATE        = 34   // 11/32

  const kpis = useMemo(() => {
    const apiHasData = tickets.length > 0
    let base = tickets
    if (filterEstado !== "todos") base = base.filter((t: any) => t.status === filterEstado)
    if (filterMes !== "todos") {
      const mes = parseInt(filterMes) - 1
      base = base.filter((t: any) => new Date(t.createdAt).getMonth() === mes)
    }
    const total        = apiHasData ? base.length       : REAL_TOTAL
    const completados  = apiHasData
      ? base.filter((t: any) => t.status === "completado").length
      : REAL_COMPLETADOS
    const rate         = apiHasData
      ? (total > 0 ? Math.round((completados / total) * 100) : 0)
      : REAL_RATE
    const bolsaHoras   = CARGA_POR_ENCARGADO.reduce((s, e) => s + e.horas, 0)
    const proyectos    = CARGA_POR_ENCARGADO.reduce((s, e) => s + e.proyectos, 0)
    return { total, completados, rate, bolsaHoras, proyectos }
  }, [tickets, filterEstado, filterMes])

  // Leyenda donut
  const totalProcedencia = PROCEDENCIA_VALOR.reduce((s, d) => s + d.value, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="col-span-2 h-72 rounded-2xl bg-slate-100" />
          <Skeleton className="h-72 rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9b111e] animate-pulse" />
            <span className="text-[10px] font-black text-[#9b111e]/80 uppercase tracking-[0.18em]">
              Área Data · Jefatura
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">General de Data</h2>
          <p className="text-sm text-slate-500">Vista gerencial · Capacidad, proyectos y SLA</p>
        </div>

        {/* ── FilterBar ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 outline-none cursor-pointer shadow-sm"
          >
            <option value="todos">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="en_progreso">En Progreso</option>
            <option value="revisión">Revisión</option>
            <option value="completado">Completado</option>
          </select>
          <select
            value={filterMes}
            onChange={(e) => setFilterMes(e.target.value)}
            className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 outline-none cursor-pointer shadow-sm"
          >
            <option value="todos">Todos los meses</option>
            {MESES.map((m, i) => (
              <option key={m} value={String(i + 1)}>{m}</option>
            ))}
          </select>
          <div className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total Proyectos"
          value={kpis.proyectos}
          sub={`${kpis.total} requerimientos activos`}
          icon="🗓️"
          borderColor="border-slate-200"
          trend="Área Data"
          trendDir="neutral"
        />
        <KpiCard
          label="Bolsa de Horas"
          value={`${kpis.bolsaHoras}h`}
          sub={`Capacidad mes · Umbral ${CAP_MENSUAL}h/analista`}
          icon="⏱️"
          borderColor={Math.round(kpis.bolsaHoras / 4) > CAP_MENSUAL ? "border-red-200" : "border-slate-200"}
          trend={`${Math.round(kpis.bolsaHoras / 4)}h avg`}
          trendDir={Math.round(kpis.bolsaHoras / 4) > CAP_MENSUAL ? "down" : "up"}
          progress={Math.min(Math.round((kpis.bolsaHoras / 4 / (CAP_MENSUAL * 1.2)) * 100), 100)}
        />
        <KpiCard
          label="Tasa de Completitud"
          value={`${kpis.rate}%`}
          sub={`${kpis.completados} de ${kpis.total} completados`}
          icon="✅"
          borderColor={kpis.rate >= 70 ? "border-green-200" : "border-slate-200"}
          trend={kpis.rate >= 70 ? "↑ En meta" : "↓ Bajo meta"}
          trendDir={kpis.rate >= 70 ? "up" : "down"}
          progress={kpis.rate}
        />
        <KpiCard
          label="SLA Promedio"
          value="12.0d"
          sub="Días promedio de cierre · Feb 2026 (excl. outlier)"
          icon="📐"
          borderColor="border-green-200"
          trend="↓ vs meta 20d"
          trendDir="up"
          progress={Math.round((12.0 / 20) * 100)}
        />
      </div>

      {/* ── Fila 2: Carga + Procedencia ──────────────────────────────────── */}
      <div>
        <SectionLabel>Distribución de capacidad y demanda</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Bar chart — Carga por encargado */}
          <ChartCard
            title="Distribución de Carga"
            sub="Horas mensuales por analista · Umbral 125h/mes"
            className="lg:col-span-2"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CARGA_POR_ENCARGADO} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="encargado"
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<LightTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <ReferenceLine
                    y={CAP_MENSUAL}
                    stroke="#eab308"
                    strokeDasharray="4 3"
                    label={{ value: "125h límite", fill: "#b45309", fontSize: 10, position: "insideTopRight" }}
                  />
                  <Bar dataKey="horas" name="horas" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {CARGA_POR_ENCARGADO.map((e) => (
                      <Cell
                        key={e.encargado}
                        fill={e.horas > CAP_MENSUAL ? "#9b111e" : "#3b82f6"}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Leyenda debajo */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-100 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-[11px] text-slate-500 font-semibold">Capacidad normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#9b111e]" />
                <span className="text-[11px] text-slate-500 font-semibold">Excede umbral ({">"}{ CAP_MENSUAL}h)</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="inline-block w-6 border-t-2 border-dashed border-yellow-500" />
                <span className="text-[11px] text-yellow-600 font-semibold">Límite mensual</span>
              </div>
            </div>
          </ChartCard>

          {/* Donut — Procedencia por cliente interno */}
          <ChartCard
            title="Procedencia de Valor"
            sub="Demanda por cliente interno"
          >
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROCEDENCIA_VALOR}
                    dataKey="value"
                    nameKey="cliente"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    strokeWidth={2} stroke="#fff"
                  >
                    {PROCEDENCIA_VALOR.map((d) => (
                      <Cell key={d.cliente} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0]
                      return (
                        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
                          <p className="font-bold text-slate-700">{d.name}</p>
                          <p style={{ color: d.payload.color }} className="font-semibold">
                            {d.value} req · {Math.round((Number(d.value) / totalProcedencia) * 100)}%
                          </p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {PROCEDENCIA_VALOR.map((d) => (
                <div key={d.cliente} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-[11px] text-slate-600 truncate">{d.cliente}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(d.value / totalProcedencia) * 100}%`, background: d.color }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 w-7 text-right">
                      {Math.round((d.value / totalProcedencia) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── Fila 3: SLA Trend + Criticidad vs Avance ─────────────────────── */}
      <div>
        <SectionLabel>Criticidad y evolución del SLA</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* SLA Trend Bar */}
          <ChartCard title="Tendencia SLA Promedio" sub="Días promedio de cierre · últimos 6 meses">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TREND_MESES} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[14, 24]} />
                  <Tooltip content={<LightTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <ReferenceLine y={20} stroke="#9b111e" strokeDasharray="4 3"
                    label={{ value: "Meta 20d", fill: "#9b111e", fontSize: 10, position: "insideTopRight" }} />
                  <Bar dataKey="dias" name="días" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {TREND_MESES.map((m) => (
                      <Cell key={m.mes} fill={m.dias > 20 ? "#9b111e" : "#22c55e"} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Criticidad vs Avance — Scatter */}
          <ChartCard
            title="Criticidad vs. Avance"
            sub="Alta prioridad vs días de atención"
            className="lg:col-span-2"
          >
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number" dataKey="dias" name="Días"
                    label={{ value: "Días de atención", position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 10 }}
                    tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false}
                  />
                  <YAxis
                    type="number" dataKey="avance" name="% Avance" domain={[0, 100]}
                    label={{ value: "Avance %", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
                    tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false}
                  />
                  <ZAxis range={[60, 120]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0]?.payload
                      return (
                        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg space-y-0.5">
                          <p className="font-bold text-slate-800">{d?.nombre}</p>
                          <p className="text-slate-500">Tipo: <span className="text-slate-700 font-semibold">{d?.tipo}</span></p>
                          <p className="text-slate-500">Prioridad: <span className="text-slate-700 font-semibold">{PRIORIDAD_LABEL[d?.prioridad]}</span></p>
                          <p className="text-slate-500">Días: <span className="text-slate-700 font-semibold">{d?.dias}d</span></p>
                          <p className="text-slate-500">Avance: <span className="text-slate-700 font-semibold">{d?.avance}%</span></p>
                        </div>
                      )
                    }}
                  />
                  {/* Alta prioridad */}
                  <Scatter name="Alta"    data={CRITICIDAD_AVANCE.filter((d) => d.prioridad === 2)} fill="#9b111e" opacity={0.8} />
                  <Scatter name="Regular" data={CRITICIDAD_AVANCE.filter((d) => d.prioridad === 1)} fill="#3b82f6" opacity={0.75} />
                  <ReferenceLine x={20} stroke="#eab308" strokeDasharray="4 3"
                    label={{ value: "Meta 20d", fill: "#b45309", fontSize: 10, position: "insideTopRight" }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            {/* Leyenda tipos */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-100 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#9b111e]" />
                <span className="text-[11px] text-slate-500 font-semibold">Alta prioridad</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[11px] text-slate-500 font-semibold">Prioridad regular</span>
              </div>
              <p className="ml-auto text-[10px] text-slate-400">
                Inf-der = riesgo: alta prioridad · bajo avance · muchos días
              </p>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── Fila 4: Tabla de carga detallada ─────────────────────────────── */}
      <div>
        <SectionLabel>Detalle de carga por analista</SectionLabel>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Analista", "Proyectos", "Tareas", "Incidencias", "Horas Totales", "Capacidad", "Estado"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CARGA_POR_ENCARGADO.map((e, i) => {
                const pct = Math.min(Math.round((e.horas / (CAP_MENSUAL * 1.2)) * 100), 100)
                const overCap = e.horas > CAP_MENSUAL
                return (
                  <tr key={e.encargado} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#9b111e] to-red-500 flex items-center justify-center text-[11px] font-black text-white">
                          {e.encargado[0]}
                        </div>
                        <span className="text-[13px] font-semibold text-slate-800">{e.encargado}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{e.proyectos}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{e.tareas}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{e.incidencias}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[13px] font-black ${overCap ? "text-[#9b111e]" : "text-slate-800"}`}>
                        {e.horas}h
                      </span>
                    </td>
                    <td className="px-5 py-3.5 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: overCap ? "#9b111e" : "#3b82f6" }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 w-7 shrink-0">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                        overCap
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-green-50 border-green-200 text-green-700"
                      }`}>
                        {overCap ? "⚠ Sobrecargado" : "✓ Normal"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
