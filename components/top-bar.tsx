"use client"

import { useState } from "react"

interface TopBarProps {
  title: string
  subtitle?: string
  currentUser: string
  notificationCount?: number
  isSidebarExpanded?: boolean
}

export function TopBar({ title, subtitle, currentUser, notificationCount = 0, isSidebarExpanded = true }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className={`fixed top-0 right-0 h-16 bg-background border-b border-border flex items-center justify-between px-6 z-30 transition-all duration-300 ${isSidebarExpanded ? "left-64" : "left-20"}`}>
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
          <span className="text-muted-foreground">🔍</span>
          <input
            type="text"
            placeholder="Buscar tickets..."
            className="bg-transparent text-sm outline-none text-foreground placeholder-muted-foreground w-48"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <span className="text-lg">🔔</span>
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-card rounded-lg border border-border shadow-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Notificaciones</p>
              <div className="space-y-2">
                <div className="p-2 rounded bg-primary/10 text-sm text-foreground border-l-2 border-primary">
                  Ticket REQ-001 requiere aprobación
                </div>
                <div className="p-2 rounded bg-warning/10 text-sm text-foreground border-l-2 border-warning">
                  SLA vencimiento en 4 horas para REQ-005
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <span className="text-lg">⚙️</span>
        </button>
      </div>
    </div>
  )
}
