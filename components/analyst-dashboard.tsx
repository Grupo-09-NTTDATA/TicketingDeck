"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTickets } from "@/hooks/use-tickets"
import { KanbanBoard } from "@/components/kanban-board"
import { AdvancedFilters } from "@/components/advanced-filters"
import { TicketDetailView } from "@/components/ticket-detail-view"
import { AnalystTicketCard } from "@/components/analyst-ticket-card"
import { DashboardOverview } from "@/components/dashboard-overview"

export function AnalystDashboard() {
  const { tickets, updateTicket, addComment, addSubtask, loading } = useTickets()
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  
  const [filteredTickets, setFilteredTickets] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban")

  // Sincronizar datos al cargar
  useEffect(() => {
    if (tickets) {
      setFilteredTickets(tickets);
    }
  }, [tickets]);

  const selectedTicket = selectedTicketId ? tickets.find((t: any) => t.id === selectedTicketId) : null

  const handleUpdateSubtask = useCallback(
    (ticketId: string, subtaskId: string, completed: boolean) => {
      const ticket = tickets.find((t: any) => t.id === ticketId)
      if (ticket) {
        const updatedSubtasks = ticket.subtasks.map((s: any) => (s.id === subtaskId ? { ...s, completed } : s))
        updateTicket(ticketId, { subtasks: updatedSubtasks }, "Analista")
      }
    },
    [tickets, updateTicket],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#b31942] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium">Sincronizando base de datos central...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Corporativo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Control</h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Gestión global de requerimientos de análisis de GRUPO 9
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen (KPIs) */}
      <DashboardOverview tickets={filteredTickets} />

      {/* Filtros Avanzados */}
      <AdvancedFilters tickets={tickets} onFiltersChange={setFilteredTickets} />

      {/* View Modes */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "kanban" | "table")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
          <TabsTrigger value="kanban" className="data-[state=active]:bg-white data-[state=active]:text-[#b31942] data-[state=active]:font-bold">
            Vista Kanban
          </TabsTrigger>
          <TabsTrigger value="table" className="data-[state=active]:bg-white data-[state=active]:text-[#b31942] data-[state=active]:font-bold">
            Vista de Lista
          </TabsTrigger>
        </TabsList>

        {/* Kanban View */}
        <TabsContent value="kanban" className="space-y-4">
          <KanbanBoard
            tickets={filteredTickets}
            onStatusChange={(ticketId, newStatus, changedBy) => {
              updateTicket(ticketId, { status: newStatus }, changedBy)
            }}
            // 👇 ESTA ES LA CONEXIÓN CLAVE PARA ASIGNAR RESPONSABLES 👇
            onAssignChange={(ticketId, assignee) => {
              updateTicket(ticketId, { 
                assignedTo: assignee || "",
                assignedAt: new Date().toISOString(), // Guardamos la fecha de asignación
                assignedBy: "Coordinador"
              }, "Analista")
            }}
            onSelectTicket={setSelectedTicketId}
            userName="Analista"
          />
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <Card className="bg-slate-50/50 border-dashed border-2">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-slate-500 font-medium">No se encontraron tickets con los filtros actuales</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredTickets.map((ticket) => (
                  <AnalystTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onUpdate={(updatedTicket: any) => updateTicket(ticket.id, updatedTicket, "Analista")}
                    isSelected={selectedTicketId === ticket.id}
                    onSelect={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed View Panel */}
      {selectedTicket && (
        <div className="mt-8 border-t border-slate-200 pt-8 animate-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Detalle del Requerimiento</h3>
          <TicketDetailView
            ticket={selectedTicket}
            allTickets={filteredTickets}
            onStatusChange={(status: string) => updateTicket(selectedTicket.id, { status }, "Analista")}
            // 👇 CONEXIÓN PARA ASIGNAR DESDE LA VISTA COMPLETA 👇
            onAssignChange={(assignee: string) => updateTicket(selectedTicket.id, { 
              assignedTo: assignee || "",
              assignedAt: new Date().toISOString(),
              assignedBy: "Coordinador"
            }, "Analista")}
            onAddComment={(text: string, mentions: string[]) => addComment(selectedTicket.id, "Analista", text, mentions)}
            onAddSubtask={(subtask: any) => addSubtask(selectedTicket.id, subtask)}
            onUpdateSubtask={(subtaskId: string, completed: boolean) => handleUpdateSubtask(selectedTicket.id, subtaskId, completed)}
            userName="Analista"
          />
        </div>
      )}
    </div>
  )
}
