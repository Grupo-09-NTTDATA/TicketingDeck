"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Ticket } from "@/hooks/use-tickets"

interface SLATrackerProps {
  ticket: Ticket
}

const SLA_TIMES: Record<string, number> = {
  baja: 120, // 5 days
  media: 72, // 3 days
  alta: 24, // 1 day
}

export function SLATracker({ ticket }: SLATrackerProps) {
  const slaHours = SLA_TIMES[ticket.priority] || 72
  const createdDate = new Date(ticket.createdAt)
  const slaDeadline = new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000)
  const now = new Date()

  const totalMs = slaDeadline.getTime() - createdDate.getTime()
  const elapsedMs = now.getTime() - createdDate.getTime()
  const slaPercentage = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100))

  const isOverdue = now > slaDeadline
  const hoursRemaining = Math.max(0, (slaDeadline.getTime() - now.getTime()) / (60 * 60 * 1000))
  const daysRemaining = Math.floor(hoursRemaining / 24)
  const remainingHours = Math.floor(hoursRemaining % 24)

  const statusColor = isOverdue ? "bg-red-100" : slaPercentage > 75 ? "bg-yellow-100" : "bg-green-100"
  const badgeColor = isOverdue ? "bg-red-600" : slaPercentage > 75 ? "bg-yellow-600" : "bg-green-600"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">SLA y Vencimiento</CardTitle>
          <Badge className={badgeColor} variant="default">
            {isOverdue ? "Vencido" : "En Tiempo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SLA Priority */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Prioridad SLA</p>
            <p className="text-xs text-muted-foreground">
              {slaHours} horas ({Math.ceil(slaHours / 24)} días)
            </p>
          </div>
          <Progress value={slaPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {slaPercentage.toFixed(0)}% del tiempo total transcurrido
          </p>
        </div>

        {/* Timeline */}
        <div className={`rounded-lg p-3 ${statusColor}`}>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-foreground/70">Creado</p>
              <p className="text-sm font-mono">{createdDate.toLocaleString("es-ES")}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/70">Vencimiento SLA</p>
              <p className="text-sm font-mono">{slaDeadline.toLocaleString("es-ES")}</p>
            </div>
            {!isOverdue && (
              <div className="pt-2 border-t border-foreground/10">
                <p className="text-sm font-bold">
                  {daysRemaining > 0
                    ? `${daysRemaining}d ${remainingHours}h restantes`
                    : `${Math.round(hoursRemaining)}h restantes`}
                </p>
              </div>
            )}
            {isOverdue && (
              <div className="pt-2 border-t border-red-200">
                <p className="text-sm font-bold text-red-700">
                  Vencido por {Math.floor((now.getTime() - slaDeadline.getTime()) / (60 * 60 * 1000))} horas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-medium">Métricas</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">Horas Estimadas</p>
              <p className="font-bold">{ticket.estimatedHours || "N/A"}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">Horas Reales</p>
              <p className="font-bold">{ticket.actualHours || "N/A"}</p>
            </div>
            {ticket.estimatedHours && ticket.actualHours && (
              <div className="bg-muted p-2 rounded col-span-2">
                <p className="text-muted-foreground">Variancia</p>
                <p className="font-bold">
                  {ticket.actualHours > ticket.estimatedHours ? "+" : ""}
                  {ticket.actualHours - ticket.estimatedHours} horas
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
