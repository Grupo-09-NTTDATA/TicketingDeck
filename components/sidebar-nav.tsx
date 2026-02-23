"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  currentUser: string
  onLogout: () => void
}

export function SidebarNav({ currentUser, onLogout }: SidebarNavProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const isAnalyst = currentUser === "Analista"

  const navItems = isAnalyst
    ? [
        { icon: "📊", label: "Dashboard", href: "#" },
        { icon: "📋", label: "Todos los Tickets", href: "#" },
        { icon: "🎯", label: "Mis Asignaciones", href: "#" },
        { icon: "📈", label: "Reportes", href: "#" },
        { icon: "⚙️", label: "Configuración", href: "#" },
      ]
    : [
        { icon: "📊", label: "Dashboard", href: "#" },
        { icon: "✏️", label: "Crear Solicitud", href: "#" },
        { icon: "📋", label: "Mis Solicitudes", href: "#" },
        { icon: "📈", label: "Mi Historial", href: "#" },
        { icon: "⚙️", label: "Preferencias", href: "#" },
      ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40",
        isExpanded ? "w-64" : "w-20",
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", !isExpanded && "justify-center w-full")}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-sidebar-foreground font-bold text-lg">
            S
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">SOLTRAK</span>
              <span className="text-xs text-sidebar-foreground/60">Analytics</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-sidebar-accent rounded transition-colors"
        >
          {isExpanded ? "←" : "→"}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground",
            )}
          >
            <span className="text-lg min-w-6">{item.icon}</span>
            {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3 space-y-3">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50",
            !isExpanded && "justify-center",
          )}
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
            {currentUser[0]}
          </div>
          {isExpanded && (
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser}</span>
              <span className="text-xs text-sidebar-foreground/60">{isAnalyst ? "Data Analyst" : "Solicitante"}</span>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full px-3 py-2 text-xs font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent rounded-lg transition-colors text-left"
        >
          {isExpanded ? "Cerrar Sesión" : "🚪"}
        </button>
      </div>
    </aside>
  )
}
