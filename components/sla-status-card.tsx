"use client"

import type { Ticket } from "@/hooks/use-tickets"

interface SlaStatusCardProps {
  ticket: Ticket
}

export function SlaStatusCard({ ticket }: SlaStatusCardProps) {
  const slaHours = ticket.priority === "alta" ? 24 : ticket.priority === "media" ? 72 : 120

  const createdDate = new Date(ticket.createdAt)
  const nowDate = new Date()
  const hoursPassed = (nowDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
  const percentage = (hoursPassed / slaHours) * 100

  const isViolated = percentage > 100
  const isWarning = percentage > 75

  return (
    <div className="p-4 bg-card rounded-lg border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">SLA Status</span>
        <span
          className={`text-xs font-bold px-2 py-1 rounded ${
            isViolated
              ? "bg-destructive/10 text-destructive"
              : isWarning
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
          }`}
        >
          {isViolated ? "Vencido" : isWarning ? "Crítico" : "En tiempo"}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {Math.round(hoursPassed)}h / {slaHours}h
          </span>
          <span className="font-semibold">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isViolated ? "bg-destructive" : isWarning ? "bg-warning" : "bg-success"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
