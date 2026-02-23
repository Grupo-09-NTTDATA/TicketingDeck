"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Ticket } from "@/hooks/use-tickets"

interface FilterOptions {
  search: string
  status: Ticket["status"][]
  priority: Ticket["priority"][]
  type: Ticket["type"][]
  department: string[]
  assignedTo: string[]
  createdAfter?: string
  createdBefore?: string
  dueAfter?: string
  dueBefore?: string
}

interface AdvancedFiltersProps {
  tickets: Ticket[]
  onFiltersChange: (filtered: Ticket[]) => void
}

const STATUSES: Ticket["status"][] = ["nuevo", "en_progreso", "revisión", "aprobado", "completado", "rechazado"]
const PRIORITIES: Ticket["priority"][] = ["baja", "media", "alta"]
const TYPES: Ticket["type"][] = ["mejora", "corrección", "nueva_funcionalidad", "actualización"]

export function AdvancedFilters({ tickets, onFiltersChange }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    status: [],
    priority: [],
    type: [],
    department: [],
    assignedTo: [],
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const uniqueDepartments = Array.from(new Set(tickets.map((t) => t.department)))
  const uniqueAssignees = Array.from(new Set(tickets.map((t) => t.assignedTo).filter(Boolean)))

  const applyFilters = () => {
    let filtered = tickets

    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.id.toLowerCase().includes(search),
      )
    }

    // Status
    if (filters.status.length > 0) {
      filtered = filtered.filter((t) => filters.status.includes(t.status))
    }

    // Priority
    if (filters.priority.length > 0) {
      filtered = filtered.filter((t) => filters.priority.includes(t.priority))
    }

    // Type
    if (filters.type.length > 0) {
      filtered = filtered.filter((t) => filters.type.includes(t.type))
    }

    // Department
    if (filters.department.length > 0) {
      filtered = filtered.filter((t) => filters.department.includes(t.department))
    }

    // Assigned To
    if (filters.assignedTo.length > 0) {
      filtered = filtered.filter((t) => (t.assignedTo ? filters.assignedTo.includes(t.assignedTo) : false))
    }

    // Date ranges
    if (filters.createdAfter) {
      filtered = filtered.filter((t) => new Date(t.createdAt) >= new Date(filters.createdAfter!))
    }
    if (filters.createdBefore) {
      filtered = filtered.filter((t) => new Date(t.createdAt) <= new Date(filters.createdBefore!))
    }
    if (filters.dueAfter && filters.dueAfter) {
      filtered = filtered.filter((t) => t.dueDate && new Date(t.dueDate) >= new Date(filters.dueAfter!))
    }
    if (filters.dueBefore) {
      filtered = filtered.filter((t) => t.dueDate && new Date(t.dueDate) <= new Date(filters.dueBefore!))
    }

    onFiltersChange(filtered)
  }

  const handleStatusToggle = (status: Ticket["status"]) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status) ? prev.status.filter((s) => s !== status) : [...prev.status, status],
    }))
  }

  const handlePriorityToggle = (priority: Ticket["priority"]) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority],
    }))
  }

  const handleTypeToggle = (type: Ticket["type"]) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type) ? prev.type.filter((t) => t !== type) : [...prev.type, type],
    }))
  }

  const handleDepartmentToggle = (dept: string) => {
    setFilters((prev) => ({
      ...prev,
      department: prev.department.includes(dept)
        ? prev.department.filter((d) => d !== dept)
        : [...prev.department, dept],
    }))
  }

  const handleAssigneeToggle = (assignee: string) => {
    setFilters((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(assignee)
        ? prev.assignedTo.filter((a) => a !== assignee)
        : [...prev.assignedTo, assignee],
    }))
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      status: [],
      priority: [],
      type: [],
      department: [],
      assignedTo: [],
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Filtros Avanzados</CardTitle>
            <CardDescription>Busca y filtra tickets por múltiples criterios</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "Ocultar" : "Mostrar"} Filtros
          </Button>
        </div>
      </CardHeader>

      {showAdvanced && (
        <CardContent className="space-y-6">
          {/* Search */}
          <div>
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Buscar
            </Label>
            <Input
              id="search"
              placeholder="Buscar por título, descripción o ID..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="bg-background"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Estado</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {STATUSES.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <Label htmlFor={`status-${status}`} className="font-normal cursor-pointer text-sm">
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Prioridad</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRIORITIES.map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={filters.priority.includes(priority)}
                    onCheckedChange={() => handlePriorityToggle(priority)}
                  />
                  <Label htmlFor={`priority-${priority}`} className="font-normal cursor-pointer text-sm">
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Tipo</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.type.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Departamento</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {uniqueDepartments.map((dept) => (
                <div key={dept} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dept-${dept}`}
                    checked={filters.department.includes(dept)}
                    onCheckedChange={() => handleDepartmentToggle(dept)}
                  />
                  <Label htmlFor={`dept-${dept}`} className="font-normal cursor-pointer text-sm">
                    {dept}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          {uniqueAssignees.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Asignado a</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {uniqueAssignees.map((assignee) => (
                  <div key={assignee} className="flex items-center space-x-2">
                    <Checkbox
                      id={`assignee-${assignee}`}
                      checked={filters.assignedTo.includes(assignee as string)}
                      onCheckedChange={() => handleAssigneeToggle(assignee as string)}
                    />
                    <Label htmlFor={`assignee-${assignee}`} className="font-normal cursor-pointer text-sm">
                      {assignee}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="created-after" className="text-sm font-medium mb-2 block">
                Creado desde
              </Label>
              <Input
                id="created-after"
                type="date"
                value={filters.createdAfter || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, createdAfter: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="created-before" className="text-sm font-medium mb-2 block">
                Creado hasta
              </Label>
              <Input
                id="created-before"
                type="date"
                value={filters.createdBefore || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, createdBefore: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="due-after" className="text-sm font-medium mb-2 block">
                Vencimiento desde
              </Label>
              <Input
                id="due-after"
                type="date"
                value={filters.dueAfter || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, dueAfter: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="due-before" className="text-sm font-medium mb-2 block">
                Vencimiento hasta
              </Label>
              <Input
                id="due-before"
                type="date"
                value={filters.dueBefore || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, dueBefore: e.target.value || undefined }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={applyFilters} className="bg-primary hover:bg-primary/90 flex-1">
              Aplicar Filtros
            </Button>
            <Button onClick={resetFilters} variant="outline" className="flex-1 bg-transparent">
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
