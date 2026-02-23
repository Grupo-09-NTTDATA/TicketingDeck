"use client"

import type { Ticket } from "@/hooks/use-tickets"
import { cn } from "@/lib/utils"

interface AuditTimelineProps {
  ticket: Ticket
}

const ACTION_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  created: { icon: "🆕", label: "Creado", color: "bg-blue-100 text-blue-700" },
  status_changed: { icon: "➡️", label: "Estado Cambiado", color: "bg-primary/10 text-primary" },
  assigned: { icon: "👤", label: "Asignado", color: "bg-info/10 text-info" },
  commented: { icon: "💬", label: "Comentario", color: "bg-purple-100 text-purple-700" },
  subtask_added: { icon: "✓", label: "Subtarea Agregada", color: "bg-green-100 text-green-700" },
  approved: { icon: "✅", label: "Aprobado", color: "bg-success/10 text-success" },
  rejected: { icon: "❌", label: "Rechazado", color: "bg-destructive/10 text-destructive" },
  updated: { icon: "🔄", label: "Actualizado", color: "bg-warning/10 text-warning" },
}

export function AuditTimeline({ ticket }: AuditTimelineProps) {
  const timeline = ticket.auditLog || []

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Historial de Cambios</h3>

      <div className="space-y-4">
        {timeline.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay cambios registrados</p>
        ) : (
          timeline.map((log, index) => {
            const config = ACTION_CONFIG[log.action] || {
              icon: "📝",
              label: log.action,
              color: "bg-muted text-muted-foreground",
            }

            return (
              <div key={index} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg", config.color)}>
                    {config.icon}
                  </div>
                  {index < timeline.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{config.label}</h4>
                    <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>

                  <p className="text-sm text-foreground mb-2">
                    <span className="font-medium text-primary">{log.changedBy}</span>
                    {log.details && ` - ${log.details}`}
                  </p>

                  {/* Change Details */}
                  {log.oldValue && log.newValue && (
                    <div className="bg-muted/50 rounded p-3 text-xs space-y-1">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Anterior:</span>
                        <span className="font-mono line-through text-destructive/50">{String(log.oldValue)}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Nuevo:</span>
                        <span className="font-mono text-success font-semibold">{String(log.newValue)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
