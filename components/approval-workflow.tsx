"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Ticket } from "@/hooks/use-tickets"

interface ApprovalWorkflowProps {
  ticket: Ticket
  onStatusChange: (status: "revisión" | "aprobado" | "rechazado") => void
  userName: string
}

export function ApprovalWorkflow({ ticket, onStatusChange, userName }: ApprovalWorkflowProps) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [approvalNotes, setApprovalNotes] = useState("")

  const isInReview = ticket.status === "revisión"
  const isApproved = ticket.status === "aprobado"
  const isRejected = ticket.status === "rechazado"

  const canApprove = ticket.status === "revisión" || ticket.status === "en_progreso"
  const approvalCompletion = {
    hasDescription: ticket.description.length > 0,
    hasAssignee: ticket.assignedTo !== null,
    allSubtasksComplete: ticket.subtasks.length === 0 || ticket.subtasks.every((s) => s.completed),
    hasComments: ticket.comments.length > 0,
  }

  const readinessPercentage = Math.round(
    (Object.values(approvalCompletion).filter(Boolean).length / Object.keys(approvalCompletion).length) * 100,
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Flujo de Aprobación</CardTitle>
          <Badge
            className={
              isApproved
                ? "bg-green-100 text-green-800"
                : isRejected
                  ? "bg-red-100 text-red-800"
                  : isInReview
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-slate-100 text-slate-800"
            }
          >
            {isApproved ? "Aprobado" : isRejected ? "Rechazado" : isInReview ? "En Revisión" : "Pendiente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Readiness Checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Verificación de Completitud</h4>
            <span className="text-xs font-bold text-primary">{readinessPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${readinessPercentage}%` }} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={approvalCompletion.hasDescription ? "text-green-600" : "text-muted-foreground"}>
                {approvalCompletion.hasDescription ? "✓" : "○"}
              </span>
              <span>Descripción completa</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={approvalCompletion.hasAssignee ? "text-green-600" : "text-muted-foreground"}>
                {approvalCompletion.hasAssignee ? "✓" : "○"}
              </span>
              <span>Asignado a un analista</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={approvalCompletion.allSubtasksComplete ? "text-green-600" : "text-muted-foreground"}>
                {approvalCompletion.allSubtasksComplete ? "✓" : "○"}
              </span>
              <span>Subtareas completadas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={approvalCompletion.hasComments ? "text-green-600" : "text-muted-foreground"}>
                {approvalCompletion.hasComments ? "✓" : "○"}
              </span>
              <span>Tiene retroalimentación</span>
            </div>
          </div>
        </div>

        {/* Approval Actions */}
        {!isApproved && !isRejected && (
          <div className="border-t pt-4 space-y-3">
            {/* Send to Review */}
            {ticket.status !== "revisión" && (
              <Button
                onClick={() => onStatusChange("revisión")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={!approvalCompletion.allSubtasksComplete}
              >
                Enviar a Revisión
              </Button>
            )}

            {/* Approve */}
            {isInReview && (
              <div className="space-y-3">
                <textarea
                  placeholder="Notas de aprobación (opcional)..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg bg-background"
                  rows={2}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Aprobar Análisis</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Aprobación</AlertDialogTitle>
                      <AlertDialogDescription>
                        Está a punto de aprobar este análisis. Esta acción registrará al aprobador y la fecha en el
                        historial de auditoría.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <p className="text-sm font-medium">Notas: {approvalNotes || "Sin notas"}</p>
                    </div>
                    <div className="flex gap-3">
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onStatusChange("aprobado")
                          setApprovalNotes("")
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirmar Aprobación
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Reject */}
            {isInReview && (
              <div className="space-y-3">
                <textarea
                  placeholder="Motivo del rechazo..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg bg-background"
                  rows={2}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Rechazar Análisis
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Rechazo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Está a punto de rechazar este análisis. El solicitante recibirá notificación con el motivo del
                        rechazo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <p className="text-sm font-medium">Motivo: {rejectionReason || "Sin especificar"}</p>
                    </div>
                    <div className="flex gap-3">
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onStatusChange("rechazado")
                          setRejectionReason("")
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Confirmar Rechazo
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}

        {/* Approved/Rejected Status */}
        {(isApproved || isRejected) && (
          <div className={`rounded-lg p-3 ${isApproved ? "bg-green-50" : "bg-red-50"}`}>
            <p className={`text-sm font-medium ${isApproved ? "text-green-900" : "text-red-900"}`}>
              {isApproved ? "Aprobado por" : "Rechazado por"} {ticket.approvedBy || "Sistema"}
            </p>
            {ticket.approvedAt && (
              <p className={`text-xs ${isApproved ? "text-green-700" : "text-red-700"}`}>
                {new Date(ticket.approvedAt).toLocaleDateString("es-ES", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
