"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketForm } from "@/components/ticket-form"
import { TicketCard } from "@/components/ticket-card"
import { useTickets } from "@/hooks/use-tickets"

export function RequesterDashboard({ userName }: { userName: string }) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  // Obtenemos tickets y loading del hook
  const { tickets, addTicket, loading } = useTickets()

  // Mapeo oficial de áreas para Soltrak
  const AREA_MAP: Record<string, string> = {
    "mejora.continua@soltrak.com.pe": "Mejora Continua",
    "logistica@soltrak.com.pe": "Logística",
    "planeamiento@soltrak.com.pe": "Planeamiento y Demanda",
    "marketing@soltrak.com.pe": "Marketing",
    "creditos@soltrak.com.pe": "Créditos y Cobranzas",
  };

  // Normalización del usuario actual para evitar errores de comparación
  const safeUserName = (userName || "").toLowerCase().trim();

  // Agrega esto justo debajo del AREA_MAP
  const currentArea = AREA_MAP[safeUserName] || "Área no identificada";

  /**
   * FILTRO DE SEGURIDAD ESTRICTO
   * Solo permite ver tickets cuyo requesterEmail coincida exactamente con el usuario logueado.
   * Esto garantiza que cada área solo vea sus propias solicitudes.
   */
  const userTickets = useMemo(() => {
    return (tickets || []).filter((t: any) => {
      const ticketEmail = (t.requesterEmail || "").toLowerCase().trim();
      return ticketEmail === safeUserName;
    });
  }, [tickets, safeUserName]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);

    // Identificamos el nombre del área real desde el mapa
    const areaName = AREA_MAP[safeUserName] || "Área General";
    const now = new Date().toISOString();

    // Estructura de datos completa para garantizar la integridad en Google Sheets
    const baseData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "nuevo",
      requesterId: areaName,      // Nombre del área (Ej: Logística)
      requesterEmail: safeUserName, // Correo para el filtrado de seguridad
      requestedBy: areaName,
      createdAt: now,
      comments: [],
      auditLog: [{
        id: `log-${Date.now()}`,
        action: "created",
        changedBy: areaName,
        changedAt: now
      }],
      changeHistory: [{
        date: now,
        user: areaName,
        summary: "Creó el requerimiento"
      }],
      subtasks: [],
      assignedTo: null,
      type: "mejora",
      department: areaName,
      area: areaName,
      impact: "medio",
      labels: [],
      dependencies: []
    };

    try {
      // El hook addTicket asignará el ID STRKDT-XXXX automáticamente
      await addTicket(baseData);
      setShowForm(false);
    } catch (error) {
      console.error("Error al registrar requerimiento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // 👇 AGREGA ESTAS DOS LÍNEAS AQUÍ, JUSTO ANTES DEL RETURN 👇
  console.log("=== DEBUGGING LOGIN ===");
  console.log("Valor real de userName recibido del padre:", userName);
  console.log("Valor después de limpiar (safeUserName):", safeUserName);
  console.log("Área mapeada (currentArea):", currentArea);
  // 👆 ======================================================= 👆

  // ... tu código anterior

  console.log("1. Total de tickets que llegan de la BD:", tickets);
  console.log("2. Usuario buscando coincidencia:", safeUserName);
  if (tickets && tickets.length > 0) {
    console.log("3. Email del primer ticket:", tickets[0].requesterEmail);
  }
  
  return (
    <div className="space-y-6">
      {/* Header con identificación de contexto por Área */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Solicitudes</h2>
          <p className="text-muted-foreground mt-1 font-medium">
            {/* Cambiamos AREA_MAP[safeUserName] por currentArea */}
            Área: <span className="text-[#b31942] uppercase font-bold">{currentArea}</span>
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          disabled={isSubmitting || loading}
          className="bg-[#b31942] hover:bg-[#8e1435] text-white gap-2 shadow-md transition-transform active:scale-95 px-6"
        >
          {showForm ? "✕ Cerrar" : "+ Nuevo Requerimiento"}
        </Button>
      </div>

      {/* Formulario de Solicitudes */}
      {showForm && (
        <Card className="border-[#b31942]/20 shadow-xl animate-in fade-in zoom-in duration-200">
          <CardHeader>
            <CardTitle>Crear Nuevo Requerimiento</CardTitle>
            <CardDescription>Detalla tu solicitud para el equipo de Analytics</CardDescription>
          </CardHeader>
          <CardContent className={isSubmitting ? "opacity-50 pointer-events-none" : ""}>
            <TicketForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} userEmail={safeUserName} />
          </CardContent>
        </Card>
      )}

      {/* Tarjetas de Estadísticas Filtradas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: userTickets.length, color: "text-[#b31942]" },
          { label: "Nuevo", value: userTickets.filter(t => t.status === "nuevo").length, color: "text-blue-500" },
          { label: "En Progreso", value: userTickets.filter(t => t.status === "en_progreso").length, color: "text-amber-500" },
          { label: "Completado", value: userTickets.filter(t => t.status === "completado").length, color: "text-emerald-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {loading ? "..." : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listado de Requerimientos con Detalle Dinámico */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b pb-2">
          Historial de Tickets — {currentArea}
        </h3>

        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse font-medium">Sincronizando con Google Sheets...</div>
        ) : userTickets.length === 0 ? (
          <Card className="bg-slate-50/50 border-dashed border-2 border-slate-200">
            <CardContent className="pt-12 pb-12 text-center text-slate-400 font-medium">
              No tienes requerimientos registrados para esta área.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {userTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isExpanded={selectedTicketId === ticket.id}
                onExpand={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
