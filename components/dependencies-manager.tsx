"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Ticket } from "@/hooks/use-tickets"

interface DependenciesManagerProps {
  ticket: Ticket
  allTickets: Ticket[]
  onSelectTicket: (ticketId: string) => void
}

export function DependenciesManager({ ticket, allTickets, onSelectTicket }: DependenciesManagerProps) {
  // SALVAVIDAS 1: Garantizamos que el ticket actual tenga un arreglo válido
  const currentDependencies = ticket.dependencies || []

  const relatedTickets = allTickets.filter((t) => 
    currentDependencies.includes(t.id)
  )
  
  const dependingTickets = allTickets.filter((t) => {
    // SALVAVIDAS 2: Garantizamos que cada ticket de la lista general tenga un arreglo válido
    const tDependencies = t.dependencies || []
    return tDependencies.includes(ticket.id)
  })

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-800">Dependencias y Relaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Depende de */}
        <div>
          <h4 className="font-medium text-[11px] uppercase tracking-widest text-slate-400 mb-3">Depende de</h4>
          {relatedTickets.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">No tiene dependencias</p>
          ) : (
            <div className="space-y-2">
              {relatedTickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-[#b31942]/30 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[10px] font-black text-[#b31942] tracking-wider">{t.id}</p>
                    <p className="text-sm font-medium text-slate-700 truncate">{t.title}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onSelectTicket(t.id)} className="text-xs h-7 text-slate-600 bg-white">
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloqueadores */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="font-medium text-[11px] uppercase tracking-widest text-slate-400 mb-3">Bloqueados por este ticket</h4>
          {dependingTickets.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">No hay bloqueos</p>
          ) : (
            <div className="space-y-2">
              {dependingTickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[10px] font-black text-red-700 tracking-wider">{t.id}</p>
                    <p className="text-sm font-bold text-red-900 truncate">{t.title}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectTicket(t.id)}
                    className="text-xs h-7 text-red-800 border-red-200 hover:bg-red-200 bg-white"
                  >
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
