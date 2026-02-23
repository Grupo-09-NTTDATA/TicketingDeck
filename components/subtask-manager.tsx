"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Ticket, Subtask } from "@/hooks/use-tickets"

interface SubtaskManagerProps {
  ticket: Ticket
  onAddSubtask: (subtask: Subtask) => void
  onUpdateSubtask: (subtaskId: string, completed: boolean) => void
}

export function SubtaskManager({ ticket, onAddSubtask, onUpdateSubtask }: SubtaskManagerProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState("")
  const [showForm, setShowForm] = useState(false)

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const subtask: Subtask = {
        id: `subtask-${Date.now()}`,
        title: newSubtaskTitle,
        completed: false,
        assignedTo: newSubtaskAssignee || undefined,
        createdAt: new Date().toISOString(),
      }
      onAddSubtask(subtask)
      setNewSubtaskTitle("")
      setNewSubtaskAssignee("")
      setShowForm(false)
    }
  }

  const completedCount = ticket.subtasks.filter((s) => s.completed).length
  const totalCount = ticket.subtasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Subtareas</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount}/{totalCount} completadas ({progress}%)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "+ Agregar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Add New Subtask */}
        {showForm && (
          <div className="border-t pt-4 space-y-3">
            <Input
              placeholder="Título de la subtarea..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
            />
            <Select value={newSubtaskAssignee} onValueChange={setNewSubtaskAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Asignar a (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
                <SelectItem value="María García">María García</SelectItem>
                <SelectItem value="Carlos López">Carlos López</SelectItem>
                <SelectItem value="Ana Martínez">Ana Martínez</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleAddSubtask} size="sm" className="bg-primary hover:bg-primary/90 flex-1">
                Agregar Subtarea
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" size="sm" className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Subtasks List */}
        {ticket.subtasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No hay subtareas</p>
            <p className="text-xs mt-1">Agrega una para dividir el trabajo</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ticket.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-foreground/5 hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={(checked) => onUpdateSubtask(subtask.id, Boolean(checked))}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p
                    className={
                      subtask.completed ? "line-through text-muted-foreground text-sm" : "text-sm text-foreground"
                    }
                  >
                    {subtask.title}
                  </p>
                  {subtask.assignedTo && (
                    <p className="text-xs text-muted-foreground mt-1">Asignado a: {subtask.assignedTo}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(subtask.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </div>
                {subtask.completed && <Badge className="bg-green-100 text-green-800">Completada</Badge>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
