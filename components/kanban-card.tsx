"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import type { Ticket } from "@/hooks/use-tickets"

interface KanbanCardProps {
  ticket: Ticket
  isDragging?: boolean
  onDragStart?: (e: React.DragEvent) => void
}

export function KanbanCard({ ticket, isDragging, onDragStart }: KanbanCardProps) {
  const priorityColor: Record<string, string> = {
    baja: "bg-blue-100 text-blue-800",
    media: "bg-yellow-100 text-yellow-800",
    alta: "bg-red-100 text-red-800",
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`bg-white rounded-lg border-2 border-foreground/10 p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-md"
      }`}
    >
      <div className="mb-2">
        <p className="text-xs font-bold text-primary uppercase">{ticket.id}</p>
        <p className="text-sm font-medium text-foreground line-clamp-2">{ticket.title}</p>
      </div>

      <div className="flex gap-2 mb-3">
        <Badge variant="outline" className={priorityColor[ticket.priority]}>
          {ticket.priority}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Área: {ticket.area}</p>
        {ticket.assignedTo && <p>Asignado: {ticket.assignedTo}</p>}
      </div>
    </div>
  )
}
