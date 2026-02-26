"use client"

import { cn } from "@/lib/utils"

// isExpanded y onToggle se reciben desde page.tsx para sincronizar el margen del contenido

interface NavItem {
  icon: string
  label: string
  href: string
  sublabel?: string
  badge?: string
  badgeColor?: "red" | "yellow" | "blue" | "green"
  isAlert?: boolean       // Resalta desviaciones críticas
  analystOnly?: boolean   // Gobernanza: solo visible para analistas
}

interface NavGroup {
  groupLabel?: string
  items: NavItem[]
}

interface SidebarNavProps {
  currentUser: string
  onLogout: () => void
  isExpanded: boolean
  onToggle: () => void
  selectedArea: "Data" | "Procesos"
  onAreaChange: (area: "Data" | "Procesos") => void
  activeItem: string
  onItemChange: (item: string) => void
}

// ─── Jerarquías de navegación por área ──────────────────────────────────────

const NAV_DATA_ANALYST: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      {
        icon: "🗂️",
        label: "General de Data",
        sublabel: "KPIs · Proyectos prioritarios",
        href: "#",
        badge: "4",
        badgeColor: "red",
      },
    ],
  },
  {
    groupLabel: "Sub-áreas",
    items: [
      { icon: "📊", label: "Business Intelligence", sublabel: "Dashboards & reporting", href: "#" },
      { icon: "🔧", label: "Data Engineering", sublabel: "Pipelines & arquitectura", href: "#" },
      { icon: "🤖", label: "Data Science", sublabel: "Modelos & análisis", href: "#" },
    ],
  },
  {
    groupLabel: "Proyectos",
    items: [
      {
        icon: "🗓️",
        label: "Gestión de Proyectos",
        sublabel: "Alcance · Tiempo · Presupuesto",
        href: "#",
        badge: "2",
        badgeColor: "yellow",
        isAlert: true,
      },
      {
        icon: "⏱️",
        label: "Bolsa de Horas",
        sublabel: "Capacidad mensual · Analistas",
        href: "#",
        analystOnly: true,
      },
    ],
  },
  {
    groupLabel: "Operación",
    items: [
      { icon: "🎫", label: "Tickets de Operación", sublabel: "Tareas · Seguimiento diario", href: "#" },
    ],
  },
]

const NAV_DATA_REQUESTER: NavGroup[] = [
  {
    items: [
      { icon: "🗂️", label: "Mi Dashboard", sublabel: "Mis proyectos activos", href: "#" },
      { icon: "✏️", label: "Crear Solicitud", href: "#" },
      { icon: "🎫", label: "Mis Tickets", href: "#" },
      { icon: "📈", label: "Mi Historial", href: "#" },
    ],
  },
]

const NAV_PROCESOS_ANALYST: NavGroup[] = [
  {
    groupLabel: "Portafolio",
    items: [
      {
        icon: "📁",
        label: "Portafolio de Proyectos",
        sublabel: "Módulo Loussiana",
        href: "#",
        badge: "3",
        badgeColor: "blue",
        isAlert: true,
      },
      {
        icon: "⏱️",
        label: "Bolsa de Horas",
        sublabel: "Análisis de Capacidad · Katy",
        href: "#",
        analystOnly: true,
      },
    ],
  },
  {
    groupLabel: "Incidencias",
    items: [
      {
        icon: "🚨",
        label: "Incidencias",
        sublabel: "SAP · GCP · Módulo Xiomara",
        href: "#",
        badge: "1",
        badgeColor: "red",
      },
    ],
  },
  {
    groupLabel: "Mejora Continua",
    items: [
      {
        icon: "♻️",
        label: "Mejora Continua (SIG)",
        sublabel: "Sistema Integrado de Gestión",
        href: "#",
      },
    ],
  },
]

const NAV_PROCESOS_REQUESTER: NavGroup[] = [
  {
    items: [
      { icon: "📁", label: "Mis Proyectos", sublabel: "Módulo Loussiana", href: "#" },
      { icon: "🚨", label: "Mis Incidencias", sublabel: "SAP · GCP", href: "#" },
      { icon: "✏️", label: "Crear Solicitud", href: "#" },
    ],
  },
]

// ─── Badge helper ──────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
  red: "bg-red-500/20 text-red-400 border border-red-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border border-green-500/30",
}

export function SidebarNav({
  currentUser,
  onLogout,
  isExpanded,
  onToggle,
  selectedArea,
  onAreaChange,
  activeItem,
  onItemChange,
}: SidebarNavProps) {
  const isAnalyst = currentUser === "Analista"

  // Selecciona la jerarquía según área y rol
  const navGroups: NavGroup[] = (() => {
    if (selectedArea === "Data") return isAnalyst ? NAV_DATA_ANALYST : NAV_DATA_REQUESTER
    return isAnalyst ? NAV_PROCESOS_ANALYST : NAV_PROCESOS_REQUESTER
  })()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-[#0a0a0a] border-r border-white/5 transition-all duration-300 z-40 flex flex-col",
        isExpanded ? "w-64" : "w-20",
      )}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        <div className={cn("flex items-center gap-3", !isExpanded && "justify-center w-full")}>
          <div className="w-9 h-9 bg-linear-to-tr from-[#9b111e] to-[#ef4444] rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-red-950/20">
            S
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white tracking-tight">SOLTRAK</span>
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest leading-tight">
                Management
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "absolute transition-all duration-300 flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white backdrop-blur-sm",
            isExpanded
              ? "right-4 w-7 h-7"
              : "-right-2.5 w-6 h-8 shadow-[4px_0px_10px_rgba(0,0,0,0.5)]",
          )}
        >
          <span className="text-[10px] font-bold">{isExpanded ? "←" : "→"}</span>
        </button>
      </div>

      {/* ── Selector de Área ─────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-white/5 shrink-0">
        {isExpanded ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
                Unidad de Gestión
              </label>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="p-1 bg-white/3 rounded-xl border border-white/5 flex gap-1">
              {(["Data", "Procesos"] as const).map((area) => (
                <button
                  key={area}
                  onClick={() => {
                    onAreaChange(area)
                    onItemChange(area === "Data" ? "General de Data" : "Portafolio de Proyectos")
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200",
                    selectedArea === area
                      ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                      : "text-white/40 hover:text-white/70 hover:bg-white/2",
                  )}
                >
                  <span>{area === "Data" ? "📍" : "⚙️"}</span>
                  {area}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {(["Data", "Procesos"] as const).map((area) => (
              <button
                key={area}
                onClick={() => {
                  onAreaChange(area)
                  onItemChange(area === "Data" ? "General de Data" : "Portafolio de Proyectos")
                }}
                title={area}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all border border-white/5",
                  selectedArea === area ? "bg-white/10 border-white/20" : "opacity-30 hover:opacity-100",
                )}
              >
                {area === "Data" ? "📍" : "⚙️"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Navegación dinámica ───────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {navGroups.map((group, gi) => {
          // Filtrar items por gobernanza de rol
          const visibleItems = group.items.filter(
            (item) => !item.analystOnly || isAnalyst,
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={gi} className="space-y-0.5">
              {/* Etiqueta de grupo */}
              {isExpanded && group.groupLabel && (
                <p className="px-3 pb-1 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                  {group.groupLabel}
                </p>
              )}

              {visibleItems.map((item) => {
                const isActive = activeItem === item.label
                return (
                  <button
                    key={item.label}
                    onClick={() => onItemChange(item.label)}
                    title={!isExpanded ? item.label : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-left",
                      isActive
                        ? "bg-white/8 text-white border border-white/8"
                        : "text-white/45 hover:text-white hover:bg-white/3",
                      item.isAlert && !isActive && "border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-200/60 hover:text-yellow-200",
                      !isExpanded && "justify-center px-0",
                    )}
                  >
                    {/* Indicador activo */}
                    {isActive && isExpanded && (
                      <span className="absolute left-3 w-0.5 h-5 bg-red-500 rounded-full" />
                    )}

                    <span
                      className={cn(
                        "text-base min-w-5 transition-all shrink-0",
                        isActive ? "grayscale-0 opacity-100" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100",
                      )}
                    >
                      {item.icon}
                    </span>

                    {isExpanded && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 leading-none",
                                BADGE_STYLES[item.badgeColor ?? "blue"],
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.sublabel && (
                          <span className="text-[10px] text-white/30 truncate block leading-tight mt-0.5">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Dot badge en modo colapsado */}
                    {!isExpanded && item.badge && (
                      <span
                        className={cn(
                          "absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full",
                          item.badgeColor === "red" ? "bg-red-500" :
                          item.badgeColor === "yellow" ? "bg-yellow-500" :
                          item.badgeColor === "green" ? "bg-green-500" : "bg-blue-500",
                        )}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* ── Perfil de usuario ─────────────────────────────────────────────── */}
      <div className="p-4 bg-linear-to-t from-black to-transparent shrink-0 border-t border-white/5">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-white/3 border border-white/5",
            !isExpanded && "justify-center px-0",
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#9b111e] to-red-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {currentUser[0]}
          </div>
          {isExpanded && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-bold text-white truncate">{currentUser}</span>
              <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider truncate">
                {selectedArea} · {isAnalyst ? "Analyst" : "Key User"}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className={cn(
            "w-full mt-3 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all text-left",
            !isExpanded && "text-center px-0",
          )}
        >
          {isExpanded ? "Cerrar Sesión" : "🚪"}
        </button>
      </div>
    </aside>
  )
}
