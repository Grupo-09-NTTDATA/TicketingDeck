"use client"

import type { Ticket } from "@/hooks/use-tickets"
import { MetricsCard } from "./metrics-card"

interface DashboardOverviewProps {
  tickets: Ticket[]
}

export function DashboardOverview({ tickets }: DashboardOverviewProps) {
  const totalTickets = tickets.length
  const newTickets = tickets.filter((t) => t.status === "nuevo").length
  const inProgressTickets = tickets.filter((t) => t.status === "en_progreso").length
  const completedTickets = tickets.filter((t) => t.status === "completado").length
  const pendingApproval = tickets.filter((t) => t.status === "revisión").length

  const completionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0
  const overallTrend = 10 // Mock trend

  // Mantuve este cálculo por si decides agregarlo a otra tarjeta en el futuro
  const averageTimeToCompletion = Math.round(
    tickets.reduce((acc, t) => {
      if (t.status === "completado" && t.updatedAt && t.createdAt) {
        return acc + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
      }
      return acc
    }, 0) / Math.max(completedTickets, 1),
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard
        title="Total de Tickets"
        value={totalTickets}
        icon="📋"
        color="primary"
        trend={overallTrend}
        subtitle="Todos los requerimientos"
      />
      <MetricsCard
        title="Tickets Completados"
        value={completedTickets}
        icon="✅"
        color="success"
        subtitle={`${pendingApproval} listos para revisión`}
      />
      <MetricsCard
        title="En Progreso"
        value={inProgressTickets}
        icon="⚙️"
        color="info"
        subtitle={`${newTickets} nuevos`}
      /> 
      <MetricsCard
        title="Tasa de Completitud"
        value={`${completionRate}%`}
        icon="📊"
        color="primary"
        subtitle="Avance global"
      />
    </div>
  )
}
