"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "@/lib/date-utils"

interface Ticket {
  id: string
  title: string
  description: string
  priority: string
  status: string
  createdAt: string
  assignedTo: string | null
  requesterEmail: string
  requesterId: string
  comments: Array<{
    id: string
    author: string
    text: string
    createdAt: string
  }>
}

interface AnalystTicketCardProps {
  ticket: Ticket
  onUpdate: (ticket: Ticket) => void
  isSelected: boolean
  onSelect: () => void
}

export function AnalystTicketCard({ ticket, onUpdate, isSelected, onSelect }: AnalystTicketCardProps) {
  const [showDetails, setShowDetails] = useState(isSelected)
  const [newComment, setNewComment] = useState("")
  // Aseguramos valores iniciales definidos para evitar errores de componentes controlados
  const [newStatus, setNewStatus] = useState(ticket?.status || "nuevo")
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo || "")

  // Sincronizar estados si el ticket cambia externamente
  useEffect(() => {
    setShowDetails(isSelected)
  }, [isSelected])

  const priorityColors: Record<string, string> = {
    baja: "bg-blue-100 text-blue-800",
    media: "bg-yellow-100 text-yellow-800",
    alta: "bg-[#b31942]/20 text-[#b31942]",
  }

  const statusColors: Record<string, string> = {
    nuevo: "bg-gray-100 text-gray-800",
    en_progreso: "bg-amber-100 text-amber-800",
    completado: "bg-green-100 text-green-800",
  }

  const statusLabels: Record<string, string> = {
    nuevo: "Nuevo",
    en_progreso: "En Progreso",
    completado: "Completado",
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedTicket = {
        ...ticket,
        // Blindaje: Si comments no existe, creamos un array nuevo
        comments: [
          ...(ticket.comments || []),
          {
            id: `comment-${Date.now()}`,
            author: "Analista",
            text: newComment,
            createdAt: new Date().toISOString(),
          },
        ],
      }
      onUpdate(updatedTicket)
      setNewComment("")
    }
  }

  const handleStatusChange = (status: string) => {
    setNewStatus(status)
    onUpdate({ ...ticket, status })
  }

  const handleAssignChange = (assign: string) => {
    setAssignedTo(assign)
    onUpdate({ ...ticket, assignedTo: assign || null })
  }

  return (
    <Card
      className={`cursor-pointer transition-all mb-4 ${
        showDetails ? "border-[#b31942] border-2 shadow-md" : "hover:border-[#b31942]/50 border-slate-200"
      }`}
      onClick={() => {
        setShowDetails(!showDetails)
        onSelect()
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-900">{ticket?.title || "Sin título"}</CardTitle>
            <CardDescription className="mt-2 text-xs font-medium">
              Solicitante: <span className="text-slate-700">{ticket?.requesterId || "N/A"}</span> ({ticket?.requesterEmail || "S/E"})
            </CardDescription>
            <CardDescription className="mt-1 text-xs">
              {ticket?.createdAt ? formatDistanceToNow(ticket.createdAt) : "Hace un momento"}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className={priorityColors[ticket?.priority || "media"]}>
              {(ticket?.priority || "media").toUpperCase()}
            </Badge>
            <Badge variant="outline" className={statusColors[ticket?.status || "nuevo"]}>
              {statusLabels[ticket?.status || "nuevo"]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4 border-t border-slate-100 pt-4" onClick={(e) => e.stopPropagation()}>
          {/* Descripción */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción del requerimiento</Label>
            <p className="text-sm text-slate-700 mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 italic">
              "{ticket?.description || "No hay descripción disponible."}"
            </p>
          </div>

          {/* Gestión */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold" htmlFor={`status-${ticket.id}`}>Cambiar Estado</Label>
              <Select value={newStatus} onValueChange={handleStatusChange}>
                <SelectTrigger id={`status-${ticket.id}`} className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold" htmlFor={`assign-${ticket.id}`}>Asignar Analista</Label>
              <Input
                id={`assign-${ticket.id}`}
                placeholder="Nombre del analista"
                value={assignedTo || ""}
                onChange={(e) => handleAssignChange(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Comentarios Blindados */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <Label className="text-xs font-bold text-slate-500 uppercase">
              Historial y Comentarios ({(ticket.comments?.length || 0)})
            </Label>
            
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {(ticket.comments || []).map((comment) => (
                <div key={comment.id} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[10px] text-[#b31942] uppercase">{comment.author}</span>
                    <span className="text-[10px] text-slate-400">{formatDistanceToNow(comment.createdAt)}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <Textarea
                placeholder="Escribe una actualización o nota técnica..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="rounded-xl resize-none focus:ring-[#b31942]"
              />
              <Button
                onClick={handleAddComment}
                className="w-full bg-[#b31942] hover:bg-[#8e1435] text-white rounded-lg h-10 transition-all"
                disabled={!newComment.trim()}
              >
                Registrar Comentario
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
