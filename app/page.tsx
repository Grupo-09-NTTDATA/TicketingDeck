"use client"

import { useState } from "react"
import { LoginView } from "@/components/login-view"
import { RequesterDashboard } from "@/components/requester-dashboard"
import { AnalystDashboard } from "@/components/analyst-dashboard"
import { SidebarNav } from "@/components/sidebar-nav"
import { TopBar } from "@/components/top-bar"
import { PanelCanvas } from "@/components/panel-canvas"
import { GeneralDataDashboard } from "@/components/general-data-dashboard"

// ─── Metadatos de cada panel ─────────────────────────────────────────────────

type Area = "Data" | "Procesos"

interface PanelMeta {
  title: string
  subtitle: string
  icon?: string
  tags?: string[]
  area: Area
  /** Si tiene componente propio, se renderiza en lugar del PanelCanvas */
  component?: "AnalystDashboard" | "RequesterDashboard" | "GeneralDataDashboard"
}

const PANEL_REGISTRY: Record<string, PanelMeta> = {
  // ── DATA · ANALISTA ────────────────────────────────────────────────────────
  "General de Data": {
    title: "General de Data",
    subtitle: "KPIs de criticidad · Proyectos priorizados · Vista macro",
    icon: "🗂️",
    area: "Data",
    component: "GeneralDataDashboard",
  },
  "Business Intelligence": {
    title: "Business Intelligence",
    subtitle: "Dashboards de reporting · Visualizaciones · KPIs de negocio",
    icon: "📊",
    area: "Data",
    tags: ["Power BI", "Tableau", "Reporting"],
  },
  "Data Engineering": {
    title: "Data Engineering",
    subtitle: "Pipelines de datos · Arquitectura · ETL/ELT",
    icon: "🔧",
    area: "Data",
    tags: ["Pipelines", "ETL", "Arquitectura", "Airflow"],
  },
  "Data Science": {
    title: "Data Science",
    subtitle: "Modelos predictivos · Análisis estadístico · MLOps",
    icon: "🤖",
    area: "Data",
    tags: ["ML Models", "Python", "Estadística", "MLOps"],
  },
  "Gestión de Proyectos": {
    title: "Gestión de Proyectos",
    subtitle: "Alcance · Tiempo · Presupuesto (Horas) · Avance · Desviaciones",
    icon: "🗓️",
    area: "Data",
    tags: ["Alcance", "Tiempo", "Presupuesto", "Desviaciones"],
  },
  "Bolsa de Horas": {
    title: "Bolsa de Horas",
    subtitle: "Análisis de capacidad mensual · Carga laboral de analistas · Katy",
    icon: "⏱️",
    area: "Data",
    tags: ["Capacidad", "Horas/Mes", "Analistas", "Carga laboral"],
  },
  "Tickets de Atención": {
    title: "Tickets de Atención",
    subtitle: "Detalle de tareas · Seguimiento diario · Operación continua",
    icon: "🎫",
    area: "Data",
    component: "AnalystDashboard",
  },

  // ── DATA · SOLICITANTE ────────────────────────────────────────────────────
  "Mi Dashboard": {
    title: "Mi Dashboard",
    subtitle: "Mis proyectos activos · Estado de mis solicitudes",
    icon: "🗂️",
    area: "Data",
    component: "RequesterDashboard",
  },
  "Crear Solicitud": {
    title: "Crear Solicitud",
    subtitle: "Nueva solicitud de análisis o requerimiento",
    icon: "✏️",
    area: "Data",
    tags: ["Nuevo ticket", "Requerimiento", "Solicitud"],
  },
  "Mis Tickets": {
    title: "Mis Tickets",
    subtitle: "Estado y seguimiento de mis tickets activos",
    icon: "🎫",
    area: "Data",
    component: "RequesterDashboard",
  },
  "Mi Historial": {
    title: "Mi Historial",
    subtitle: "Tickets cerrados · Historial de solicitudes",
    icon: "📈",
    area: "Data",
    tags: ["Cerrados", "Completados", "Historial"],
  },

  // ── PROCESOS · ANALISTA ───────────────────────────────────────────────────
  "Portafolio de Proyectos": {
    title: "Portafolio de Proyectos",
    subtitle: "Módulo Loussiana · Gestión de portafolio · Desviaciones",
    icon: "📁",
    area: "Procesos",
    tags: ["Loussiana", "Portafolio", "Desviaciones", "Gobernanza"],
  },
  "Incidencias": {
    title: "Incidencias",
    subtitle: "Módulo Xiomara · SAP · GCP · Gestión de incidencias",
    icon: "🚨",
    area: "Procesos",
    tags: ["SAP", "GCP", "Xiomara", "Incidencias"],
  },
  "Mejora Continua (SIG)": {
    title: "Mejora Continua — SIG",
    subtitle: "Sistema Integrado de Gestión · Auditorías · Indicadores",
    icon: "♻️",
    area: "Procesos",
    tags: ["SIG", "Auditorías", "ISO", "Indicadores"],
  },

  // ── PROCESOS · SOLICITANTE ────────────────────────────────────────────────
  "Mis Proyectos": {
    title: "Mis Proyectos",
    subtitle: "Módulo Loussiana · Mis proyectos activos",
    icon: "📁",
    area: "Procesos",
    tags: ["Loussiana", "Mis proyectos"],
  },
  "Mis Incidencias": {
    title: "Mis Incidencias",
    subtitle: "SAP · GCP · Seguimiento de mis incidencias",
    icon: "🚨",
    area: "Procesos",
    tags: ["SAP", "GCP", "Incidencias"],
  },
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [selectedArea, setSelectedArea] = useState<Area>("Data")
  const [activeItem, setActiveItem] = useState("General de Data")

  const handleLogin = (role: string) => {
    setCurrentUser(role)
    setActiveItem(role === "Analista" ? "General de Data" : "Mi Dashboard")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setSelectedArea("Data")
    setActiveItem("General de Data")
  }

  const handleAreaChange = (area: Area) => {
    setSelectedArea(area)
  }

  const handleItemChange = (item: string) => {
    setActiveItem(item)
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />
  }

  const panel = PANEL_REGISTRY[activeItem]

  const renderPanel = () => {
    if (!panel) return null
    if (panel.component === "AnalystDashboard") return <AnalystDashboard />
    if (panel.component === "GeneralDataDashboard") return <GeneralDataDashboard />
    if (panel.component === "RequesterDashboard")
      return <RequesterDashboard userName={currentUser} />
    return (
      <PanelCanvas
        title={panel.title}
        subtitle={panel.subtitle}
        area={panel.area}
        icon={panel.icon}
        tags={panel.tags}
      />
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav
        currentUser={currentUser}
        onLogout={handleLogout}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded((prev) => !prev)}
        selectedArea={selectedArea}
        onAreaChange={handleAreaChange}
        activeItem={activeItem}
        onItemChange={handleItemChange}
      />

      {/* Main Content */}
      <div className={`${isSidebarExpanded ? "ml-64" : "ml-20"} w-full transition-all duration-300`}>
        {/* Top Bar */}
        <TopBar
          title={panel?.title ?? activeItem}
          subtitle={panel?.subtitle}
          currentUser={currentUser}
          isSidebarExpanded={isSidebarExpanded}
        />

        {/* Content Area */}
        <main className="mt-16 pt-6 px-4 pb-12">
          {renderPanel()}
        </main>
      </div>
    </div>
  )
}

