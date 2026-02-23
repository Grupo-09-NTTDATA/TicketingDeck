"use client"

import type React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface KanbanBoardProps {
  tickets: any[]
  onStatusChange: (ticketId: string, newStatus: string, changedBy: string) => void
  onSelectTicket: (ticketId: string) => void
  onAssignChange?: (ticketId: string, assignee: string) => void // NUEVO PROP PARA ASIGNACIÓN
  userName: string
}

const STATUS_COLUMNS = [
  { id: "nuevo", label: "Nuevo", color: "bg-slate-100 border-slate-300", hoverColor: "bg-slate-200" },
  { id: "en_progreso", label: "En Progreso", color: "bg-blue-50 border-blue-200", hoverColor: "bg-blue-100" },
  { id: "revisión", label: "Revisión", color: "bg-yellow-50 border-yellow-200", hoverColor: "bg-yellow-100" },
  { id: "aprobado", label: "Aprobado", color: "bg-green-50 border-green-200", hoverColor: "bg-green-100" },
  { id: "completado", label: "Completado", color: "bg-emerald-50 border-emerald-200", hoverColor: "bg-emerald-100" },
  { id: "rechazado", label: "Rechazado", color: "bg-red-50 border-red-200", hoverColor: "bg-red-100" },
]

const PRIORITY_COLORS: Record<string, string> = {
  baja: "bg-blue-50 text-blue-700 border-blue-200",
  media: "bg-yellow-50 text-yellow-700 border-yellow-200",
  alta: "bg-red-50 text-red-700 border-red-200",
}

// Lista de tu equipo de Data Analytics
const ANALYST_TEAM = [
  "Jean Zevallos", "Carlos Santoyo", "Julio Egocheaga",
  "Alejandro Zarate", "Leo Soto", "Sebastian Galvez", "Enrique Rioja"
]

export function KanbanBoard({ tickets, onStatusChange, onSelectTicket, onAssignChange, userName }: KanbanBoardProps) {
  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  const [previewTicket, setPreviewTicket] = useState<any | null>(null)

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData("ticketId", ticketId)
    e.dataTransfer.effectAllowed = "move"
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "0.4"
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = "1"
    setActiveColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault() 
    e.dataTransfer.dropEffect = "move"
    if (activeColumn !== columnId) setActiveColumn(columnId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setActiveColumn(null)
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setActiveColumn(null)
    const ticketId = e.dataTransfer.getData("ticketId")
    if (ticketId) onStatusChange(ticketId, newStatus, userName)
  }

  return (
    <div className="space-y-4">
      {/* GRID KANBAN PRINCIPAL */}
      <div className="flex overflow-x-auto pb-6 gap-3 snap-x custom-scrollbar">
        {STATUS_COLUMNS.map((column) => {
          const columnTickets = tickets.filter((t) => t.status === column.id)
          const isOver = activeColumn === column.id

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex-shrink-0 snap-center w-[280px] lg:w-0 lg:flex-1 lg:min-w-[220px] lg:max-w-[320px] rounded-xl border-2 p-3 min-h-[500px] flex flex-col transition-colors duration-200 ${
                isOver ? column.hoverColor + ' border-dashed border-slate-400' : column.color
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800 uppercase tracking-wide text-[11px] xl:text-xs truncate mr-2">{column.label}</h4>
                <span className="text-xs font-bold text-slate-500 bg-white shadow-sm px-2 py-0.5 rounded-full border border-slate-200">
                  {columnTickets.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {columnTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setPreviewTicket(ticket)}
                    className="bg-white rounded-lg border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#b31942]/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#b31942] tracking-wider mb-0.5">{ticket.id}</p>
                        <p className="text-xs font-semibold text-slate-800 leading-snug truncate">{ticket.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0 ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </Badge>
                      <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0 rounded-sm uppercase tracking-wider truncate max-w-[100px]">
                        {ticket.type || "Req"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 mt-2">
                      <span className="font-medium text-slate-400 truncate max-w-[90px]">{ticket.department}</span>
                      {ticket.assignedTo ? (
                        <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{ticket.assignedTo.split(" ")[0]}</span>
                      ) : (
                        <span className="text-slate-300 italic text-[9px]">Sin asignar</span>
                      )}
                    </div>
                  </div>
                ))}

                {columnTickets.length === 0 && (
                  <div className="h-full min-h-[120px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200/60 rounded-lg">
                    <p className="text-slate-400 text-xs font-medium">Vacío</p>
                    <p className="text-[9px] uppercase tracking-widest text-slate-300 mt-1 font-bold">Arrastra aquí</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* =========================================
          MODAL DE VISTA RÁPIDA LIMPIO (CON EDICIÓN)
          ========================================= */}
      {previewTicket && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewTicket(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-[#b31942] tracking-wider">{previewTicket.id}</span>
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0 ${PRIORITY_COLORS[previewTicket.priority]}`}>
                    {previewTicket.priority}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{previewTicket.title}</h2>
              </div>
              <button 
                onClick={() => setPreviewTicket(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors bg-white hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center border border-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo del Modal (Scrollable) */}
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6">
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Solicitante</p>
                  <p className="text-sm font-medium text-slate-700">{previewTicket.requesterEmail}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{previewTicket.department}</p>
                </div>

                {/* SELECTOR DE ESTADO */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                  <select 
                    value={previewTicket.status}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreviewTicket({ ...previewTicket, status: val });
                      onStatusChange(previewTicket.id, val, userName);
                    }}
                    className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#b31942]/50 shadow-sm"
                  >
                    {STATUS_COLUMNS.map(col => (
                      <option key={col.id} value={col.id}>{col.label}</option>
                    ))}
                  </select>
                </div>

                {/* SELECTOR DE RESPONSABLE IT */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Responsable IT</p>
                  <select 
                    value={previewTicket.assignedTo || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreviewTicket({ ...previewTicket, assignedTo: val });
                      if (onAssignChange) onAssignChange(previewTicket.id, val);
                    }}
                    className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#b31942]/50 shadow-sm"
                  >
                    <option value="">Sin Asignar</option>
                    {ANALYST_TEAM.map(analyst => (
                      <option key={analyst} value={analyst}>{analyst}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha de Creación</p>
                  <p className="text-sm font-medium text-slate-700 mt-1.5">
                    {new Date(previewTicket.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                  Descripción del Requerimiento
                </h3>
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {previewTicket.description || "No se proporcionó una descripción detallada."}
                </div>
              </div>
            </div>

            {/* Pie del Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPreviewTicket(null)} className="text-slate-600 bg-white">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  onSelectTicket(previewTicket.id);
                  setPreviewTicket(null);
                  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
                }}
                className="bg-[#b31942] hover:bg-[#8e1435] text-white font-medium"
              >
                Modificar Subtareas / Comentarios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
