"use client"

import { useState, useCallback, useEffect } from "react"

export function useTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 1. CARGA INICIAL (GET)
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tickets')
      if (response.ok) {
        const data = await response.json()
        const normalizedData = data.map((t: any) => ({
          ...t,
          auditLog: typeof t.auditLog === 'string' ? JSON.parse(t.auditLog) : (t.auditLog || []),
          changeHistory: typeof t.changeHistory === 'string' ? JSON.parse(t.changeHistory) : (t.changeHistory || []),
          comments: typeof t.comments === 'string' ? JSON.parse(t.comments) : (t.comments || []),
          subtasks: typeof t.subtasks === 'string' ? JSON.parse(t.subtasks) : (t.subtasks || []),
        }))
        setTickets(normalizedData)
      }
    } catch (error) {
      console.error("Error cargando tickets de Soltrak:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // 2. CREACIÓN DE TICKET (POST)
  const addTicket = useCallback(async (baseTicket: any) => {
    // Generación del código progresivo
    const nextNumber = tickets.length + 1
    const formattedId = `STRKDT-${String(nextNumber).padStart(4, "0")}`

    const fullTicket = {
      ...baseTicket,
      id: formattedId,
    }

    // Actualización local rápida
    setTickets((prev) => [fullTicket, ...prev])

    // Envío al backend
    try {
      await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullTicket),
      })
    } catch (error) {
      console.error("Error al sincronizar con Sheets:", error)
    }
  }, [tickets.length])

  // =========================================================================
  // NUEVAS FUNCIONES PARA EL PANEL DE ANALISTA (KANBAN, COMENTARIOS Y TAREAS)
  // =========================================================================

  // 3. ACTUALIZACIÓN GENERAL (PUT) - Usado para mover tickets en el Kanban
  const updateTicket = useCallback(async (ticketId: string, updates: any, changedBy: string) => {
    let ticketModificado: any = null;

    // Actualización local para reflejar el cambio al instante en el Kanban
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id === ticketId) {
          ticketModificado = {
            ...ticket,
            ...updates,
            changeHistory: [
              ...(ticket.changeHistory || []),
              {
                date: new Date().toISOString(),
                user: changedBy,
                summary: `Actualizó: ${Object.keys(updates).join(', ')}`,
              },
            ],
          };
          return ticketModificado;
        }
        return ticket;
      })
    );

    // Envío silencioso al backend
    if (ticketModificado) {
      try {
        await fetch('/api/tickets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ticketId, updates: ticketModificado }),
        });
      } catch (error) {
        console.error(`Error actualizando el ticket ${ticketId}:`, error);
      }
    }
  }, []);

  // 4. AGREGAR COMENTARIO (PUT)
  const addComment = useCallback(async (ticketId: string, userName: string, text: string, mentions: string[] = []) => {
    let ticketModificado: any = null;

    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id === ticketId) {
          ticketModificado = {
            ...ticket,
            comments: [
              ...(ticket.comments || []),
              {
                id: `msg-${Date.now()}`,
                user: userName,
                text,
                mentions,
                createdAt: new Date().toISOString(),
              },
            ],
          };
          return ticketModificado;
        }
        return ticket;
      })
    );

    if (ticketModificado) {
      try {
        await fetch('/api/tickets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ticketId, updates: ticketModificado }),
        });
      } catch (error) {
        console.error("Error agregando comentario:", error);
      }
    }
  }, []);

  // 5. AGREGAR SUBTAREA (PUT)
  const addSubtask = useCallback(async (ticketId: string, subtask: any) => {
    let ticketModificado: any = null;

    setTickets((prevTickets) =>
      prevTickets.map((ticket) => {
        if (ticket.id === ticketId) {
          ticketModificado = {
            ...ticket,
            subtasks: [
              ...(ticket.subtasks || []),
              { ...subtask, id: `sub-${Date.now()}`, completed: false },
            ],
          };
          return ticketModificado;
        }
        return ticket;
      })
    );

    if (ticketModificado) {
      try {
        await fetch('/api/tickets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ticketId, updates: ticketModificado }),
        });
      } catch (error) {
        console.error("Error agregando subtarea:", error);
      }
    }
  }, []);

  // Exportamos todas las herramientas necesarias
  return { 
    tickets, 
    loading, 
    addTicket, 
    updateTicket, 
    addComment, 
    addSubtask 
  }
}
