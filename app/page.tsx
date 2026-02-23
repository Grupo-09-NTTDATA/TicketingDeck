"use client"

import { useState } from "react"
import { LoginView } from "@/components/login-view"
import { RequesterDashboard } from "@/components/requester-dashboard"
import { AnalystDashboard } from "@/components/analyst-dashboard"
import { SidebarNav } from "@/components/sidebar-nav"
import { TopBar } from "@/components/top-bar"

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  const handleLogin = (role: string) => {
    setCurrentUser(role)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="ml-64 w-full">
        {/* Top Bar */}
        <TopBar
          title={currentUser === "Analista" ? "Panel de Control" : "Mis Solicitudes"}
          subtitle={
            currentUser === "Analista"
              ? "Gestiona todos los requerimientos de análisis"
              : "Monitorea tus solicitudes de análisis"
          }
          currentUser={currentUser}
        />

        {/* Content Area */}
        <main className="mt-16 pt-6 px-6 pb-12">
          {currentUser === "Analista" ? (
            <AnalystDashboard />
          ) : (
            <RequesterDashboard userName={currentUser} />
          )}
        </main>
      </div>
    </div>
  )
}
