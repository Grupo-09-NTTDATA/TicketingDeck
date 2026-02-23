"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubtaskManager } from "@/components/subtask-manager"
import { DependenciesManager } from "@/components/dependencies-manager"
import { ApprovalWorkflow } from "@/components/approval-workflow"
import { SLATracker } from "@/components/sla-tracker"
import type { Ticket } from "@/hooks/use-tickets"

interface TicketDetailViewProps {
  ticket: Ticket
  allTickets?: Ticket[]
  onStatusChange: (status: Ticket["status"]) => void
  onAssignChange: (assignee: string) => void
  onAddComment: (text: string, mentions: string[]) => void
  onAddSubtask?: (subtask: any) => void
  onUpdateSubtask?: (subtaskId: string, completed: boolean) => void
  userName: string
}

const statusColors: Record<string, string> = {
  nuevo: "bg-slate-100 text-slate-800",
  en_progreso: "bg-blue-100 text-blue-800",
  revisión: "bg-yellow-100 text-yellow-800",
  aprobado: "bg-green-100 text-green-800",
  completado: "bg-emerald-100 text-emerald-800",
  rechazado: "bg-red-100 text-red-800",
}

const priorityColors: Record<string, string> = {
  baja: "bg-blue-50 text-blue-700 border-blue-200",
  media: "bg-yellow-50 text-yellow-700 border-yellow-200",
  alta: "bg-red-50 text-red-700 border-red-200",
}

// El equipo real de Data Analytics Soltrak
const ANALYST_TEAM = [
  "Leonardo", "Mauricio", "Martin Vargas", "Carlos Santoyo", 
  "Jean Zevallos", "Alejandro Zarate", "Leo Soto", "Julio Egocheaga", "Sebastian Galvez"
]

export function TicketDetailView({
  ticket,
  allTickets = [],
  onStatusChange,
  onAssignChange,
  onAddComment,
  onAddSubtask,
  onUpdateSubtask,
  userName,
}: TicketDetailViewProps) {
  const [comment, setComment] = useState("")
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null)

  // SALVAVIDAS: Si las listas vienen como undefined de Google Sheets, las convertimos en arreglos vacíos []
  const labels = ticket?.labels || []
  const subtasks = ticket?.subtasks || []
  const comments = ticket?.comments || []
  const changeHistory = ticket?.changeHistory || []
  const auditLog = ticket?.auditLog || []

  const handleAddComment = () => {
    if (comment.trim()) {
      const mentions = comment.match(/@(\w+)/g)?.map((m) => m.slice(1)) || []
      onAddComment(comment, mentions)
      setComment("")
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-[#b31942] uppercase mb-2">{ticket.id}</p>
            <h1 className="text-3xl font-bold text-slate-900">{ticket.title}</h1>
          </div>
          <Badge className={statusColors[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
        </div>

        <p className="text-slate-600">{ticket.description}</p>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Metadata */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">Información Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prioridad</p>
                  <Badge className={priorityColors[ticket.priority]} variant="outline">
                    {ticket.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo</p>
                  <Badge variant="secondary" className="capitalize">{ticket.type || "Requerimiento"}</Badge>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Departamento</p>
                  <p className="text-sm font-semibold text-slate-700">{ticket.department || ticket.area}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impacto</p>
                  <Badge variant="outline" className="capitalize">{ticket.impact || "Medio"}</Badge>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Horas Estimadas</p>
                  <p className="text-sm font-semibold text-slate-700">{ticket.estimatedHours || "No definido"}</p>
                </div>
              </div>

              {labels.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Etiquetas</p>
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label: string) => (
                      <Badge key={label} variant="outline" className="bg-slate-50 text-slate-600">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-800">Subtareas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {subtasks.map((subtask: any) => (
                  <div key={subtask.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <input 
                      type="checkbox" 
                      checked={subtask.completed} 
                      onChange={(e) => onUpdateSubtask && onUpdateSubtask(subtask.id, e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#b31942] rounded border-slate-300 focus:ring-[#b31942]" 
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${subtask.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {subtask.title}
                      </p>
                      {subtask.assignedTo && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Asignado a: {subtask.assignedTo}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Subtask Manager */}
          {onAddSubtask && onUpdateSubtask && (
            <SubtaskManager ticket={ticket} onAddSubtask={onAddSubtask} onUpdateSubtask={onUpdateSubtask} />
          )}

          {/* Comentarios */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">Comentarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No hay comentarios aún.</p>
                ) : (
                  comments.map((c: any) => (
                    <div key={c.id} className="border-l-2 border-[#b31942]/40 pl-4 py-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-sm text-slate-800">{c.author || c.user}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString("es-ES", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <Textarea
                  placeholder="Escribe un comentario... Usa @nombre para mencionar"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="resize-none focus-visible:ring-[#b31942]"
                />
                <Button
                  onClick={handleAddComment}
                  className="bg-[#b31942] hover:bg-[#8e1435] text-white"
                  disabled={!comment.trim()}
                >
                  Agregar Comentario
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assignments and Status */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">Asignación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Responsable IT</p>
                <Select value={ticket.assignedTo || "default"} onValueChange={onAssignChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccionar analista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Sin asignar</SelectItem>
                    {ANALYST_TEAM.map(analyst => (
                      <SelectItem key={analyst} value={analyst}>{analyst}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {ticket.assignedAt && (
                <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-3">
                  <p>Asignado por: <span className="font-bold text-slate-700">{ticket.assignedBy}</span></p>
                  <p>{new Date(ticket.assignedAt).toLocaleDateString("es-ES")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Change */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">Cambiar Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={ticket.status} onValueChange={(value) => onStatusChange(value as Ticket["status"])}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="revisión">Revisión</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* SLA Tracker */}
          <SLATracker ticket={ticket} />

          {/* Approval Workflow */}
          <ApprovalWorkflow ticket={ticket} onStatusChange={(status) => onStatusChange(status)} userName={userName} />

          {/* Dependencies Manager */}
          {allTickets.length > 0 && (
            <DependenciesManager
              ticket={ticket}
              allTickets={allTickets}
              onSelectTicket={(ticketId) => {
                // Handle ticket selection (e.g., scroll to it)
              }}
            />
          )}

          {/* Dates */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">Fechas Clave</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <p className="text-slate-500 font-medium">Creado</p>
                <p className="font-bold text-slate-800">{new Date(ticket.createdAt).toLocaleDateString("es-ES")}</p>
              </div>
              {ticket.dueDate && (
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <p className="text-slate-500 font-medium">Vencimiento</p>
                  <p className="font-bold text-[#b31942]">{new Date(ticket.dueDate).toLocaleDateString("es-ES")}</p>
                </div>
              )}
              {ticket.completedAt && (
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 font-medium">Completado</p>
                  <p className="font-bold text-emerald-600">{new Date(ticket.completedAt).toLocaleDateString("es-ES")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audit Trail */}
      <Card className="border-slate-200 shadow-sm mt-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-800">Historial y Auditoría</CardTitle>
          <CardDescription>Registro inmutable de todas las modificaciones (Trazabilidad Soltrak)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
              <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:text-[#b31942] data-[state=active]:font-bold">Timeline Simple</TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-white data-[state=active]:text-[#b31942] data-[state=active]:font-bold">Log de Auditoría Técnico</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-0">
              {changeHistory.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-4 text-center">No hay registros de cambios.</p>
              ) : (
                changeHistory.map((entry: any, idx: number) => (
                  <div key={idx} className="flex gap-4 pb-0 relative group">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#b31942] mt-1.5 z-10 outline outline-4 outline-white" />
                      {idx < changeHistory.length - 1 && <div className="w-0.5 h-full bg-slate-200 absolute top-4 left-1.5" />}
                    </div>
                    <div className="flex-1 pb-6 pt-0.5">
                      <p className="font-bold text-sm text-slate-800">{entry.user}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{entry.summary}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                        {new Date(entry.date).toLocaleDateString("es-ES", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="audit" className="space-y-3">
              {auditLog.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-4 text-center">No hay auditoría técnica disponible.</p>
              ) : (
                // Aquí aplicamos el spread operator [...] para clonar el array antes de hacer reverse()
                [...auditLog].reverse().map((log: any) => (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-[#b31942]/30 hover:shadow-sm cursor-pointer transition-all bg-white"
                    onClick={() => setExpandedAudit(expandedAudit === log.id ? null : log.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider bg-slate-50 text-slate-500">{log.action}</Badge>
                          <p className="font-bold text-sm text-slate-800">{log.changedBy}</p>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">Campo modificado: <span className="font-bold text-slate-900">{log.field || "General"}</span></p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                        {new Date(log.changedAt).toLocaleDateString("es-ES", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {expandedAudit === log.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-red-50/50 p-3 rounded-lg border border-red-100">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-red-800/60 mb-1">Valor Anterior</p>
                          <p className="font-mono text-red-900 line-clamp-2">{log.oldValue || "N/A"}</p>
                        </div>
                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/60 mb-1">Nuevo Valor</p>
                          <p className="font-mono text-emerald-900 line-clamp-2">{log.newValue || "N/A"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
