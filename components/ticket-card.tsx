"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LayoutPanelLeft, User, QrCode, ChevronRight, Activity } from "lucide-react"

export function TicketCard({ ticket, isExpanded, onExpand }: any) {
  const dateStr = format(new Date(ticket.createdAt), "dd MMM", { locale: es }).toUpperCase()
  const timeStr = format(new Date(ticket.createdAt), "HH:mm")

  // 1. Mapeo dinámico de estados integrado a tu diseño
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string, color: string, dot: string, width: string }> = {
      "nuevo": { label: "RECIBIDO", color: "text-slate-500", dot: "bg-slate-400", width: "10%" },
      "en_progreso": { label: "EN CURSO", color: "text-emerald-500", dot: "bg-emerald-500", width: "40%" },
      "revisión": { label: "EN REVISIÓN", color: "text-amber-500", dot: "bg-amber-400", width: "70%" },
      "aprobado": { label: "APROBADO", color: "text-teal-600", dot: "bg-teal-500", width: "85%" },
      "completado": { label: "COMPLETADO", color: "text-blue-600", dot: "bg-blue-500", width: "100%" },
      "rechazado": { label: "RECHAZADO", color: "text-red-500", dot: "bg-red-500", width: "100%" },
    }
    return statusMap[status] || statusMap["nuevo"]
  }

  const statusInfo = getStatusDisplay(ticket.status)

  // 2. Colores de prioridad dinámicos
  const priorityColors: Record<string, string> = {
    baja: "text-slate-500 border-slate-200 bg-slate-50",
    media: "text-amber-500 border-amber-100 bg-amber-50/50",
    alta: "text-red-500 border-red-100 bg-red-50/50",
  }

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer ${
        isExpanded ? 'ring-1 ring-[#b31942] border-transparent' : ''
      }`}
      onClick={onExpand}
    >
      {/* SECCIÓN PRINCIPAL */}
      <div className="py-1 px-6 bg-white">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3 text-slate-400">
            <LayoutPanelLeft className="w-4 h-4" />
            <span className="text-[11px] font-medium tracking-widest">{ticket.id}</span>
          </div>
          <div className="text-[11px] text-slate-400 uppercase tracking-tight">
            {dateStr} — {timeStr}
          </div>
        </div>

        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base text-slate-800 leading-snug truncate hover:text-[#b31942] transition-colors">
              {ticket.title}
            </h3>
            
            {/* ESTADO DINÁMICO */}
            <div className="flex items-center gap-3 mt-1.5">
              <div className={`flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase ${statusInfo.color}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                {statusInfo.label}
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-slate-400 tracking-widest">SLA: 48H</span>
            </div>
          </div>
          
          <Badge variant="outline" className={`text-[9px] font-black tracking-widest px-2 py-0 h-5 uppercase ${priorityColors[ticket.priority] || priorityColors.media}`}>
            {ticket.priority}
          </Badge>
        </div>

        {/* LÍNEA DE RUTA DINÁMICA */}
        <div className="relative my-4 flex items-center px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <div className="flex-1 h-[2px] bg-slate-100 mx-1 relative">
             <div 
                className="absolute top-0 left-0 h-[2px] bg-[#b31942] transition-all duration-700 ease-in-out"
                style={{ width: statusInfo.width }}
             >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_0_2px_white]"></div>
             </div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        </div>

        {/* METADATOS */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">Área</p>
              <p className="text-[11px] text-slate-700 truncate">{ticket.department || ticket.requestedBy || 'General'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">Analista</p>
              <p className="text-[11px] text-slate-700">{ticket.assignedTo ? ticket.assignedTo.split(' ')[0] : '--'}</p>
            </div>
          </div>
          <div className="flex items-center justify-end text-slate-300">
             <QrCode className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FOOTER DETALLE */}
      {isExpanded && (
        <div className="bg-slate-50/80 border-t border-slate-100 p-5 animate-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-black text-[#b31942] uppercase tracking-widest mb-2">Detalles del ticket</p>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {ticket.description}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center">
             <span className="text-[9px] text-slate-400 uppercase tracking-widest">Plataforma Analytics 2026</span>
             <div className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#b31942] transition-colors cursor-pointer">
                Ver seguimiento <ChevronRight className="w-3 h-3" />
             </div>
          </div>
        </div>
      )}
    </Card>
  )
}
