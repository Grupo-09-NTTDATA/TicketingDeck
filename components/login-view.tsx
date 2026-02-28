"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Mapeo de cuentas autorizadas para el piloto GRUPO 9 2026
const AUTHORIZED_USERS: Record<string, string> = {
  "mejora.continua@soltrak.com.pe": "Mejora Continua",
  "logistica@soltrak.com.pe": "Logística",
  "planeamiento@soltrak.com.pe": "Planeamiento y Demanda",
  "marketing@soltrak.com.pe": "Marketing",
  "creditos@soltrak.com.pe": "Créditos y Cobranzas",
};

interface LoginViewProps {
  // onLogin ahora recibe el correo del usuario para determinar su área
  onLogin: (userEmail: string) => void
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.toLowerCase().trim()

    // 1. LLAVE MAESTRA: Si es el correo del equipo de data, entra como Analista
    if (cleanEmail === "analista@soltrak.com.pe" || cleanEmail === "admin@soltrak.com.pe") {
      setIsAnimating(true)
      setError("")
      setTimeout(() => {
        onLogin("Analista") // Le pasamos la palabra exacta que activa el AnalystDashboard
      }, 500)
      return; // Cortamos la ejecución aquí
    }

    // 2. FLUJO NORMAL: Validación para las áreas solicitantes
    if (AUTHORIZED_USERS[cleanEmail]) {
      setIsAnimating(true)
      setError("")
      setTimeout(() => {
        onLogin(cleanEmail)
      }, 500)
    } else {
      setError("Este correo no está autorizado para el piloto de Data Analytics.")
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">

      {/* 1. HEADER UNIFICADO */}
      <div className={cn(
        "w-full max-w-6xl mb-12 flex items-center gap-4 transition-all duration-500",
        isAnimating && "opacity-0 -translate-y-4"
      )}>
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
          ⬤
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">GRUPO 9</h1>
          <h3 className="text-1x font-bold tracking-tight text-slate-500 leading-none">Reto 1</h3>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className={cn(
        "w-full max-w-6xl grid md:grid-cols-2 gap-12 items-start transition-all duration-500",
        isAnimating && "opacity-0 scale-95"
      )}>

        {/* COLUMNA IZQUIERDA: Info & Viñetas */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Gestión Inteligente de Requerimientos
            </h2>
            <p className="text-lg text-slate-600">
              Trazabilidad completa para las áreas core de GRUPO 9.
            </p>
          </div>

          <div className="grid gap-5">
            {[
              { icon: "📊", title: "Dashboard Inteligente", desc: "Visualización en tiempo real de todos los requerimientos" },
              { icon: "🔍", title: "Trazabilidad Total", desc: "Historial completo de cambios con auditoría" },
              { icon: "⚡", title: "Kanban Dinámico", desc: "Gestión visual con drag & drop" },
              { icon: "🔔", title: "Notificaciones", desc: "Alertas de SLA y cambios importantes" },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 group">
                <span className="text-2xl group-hover:scale-110 transition-transform bg-slate-50 w-12 h-12 flex items-center justify-center rounded-lg border border-slate-100 shadow-sm">
                  {feature.icon}
                </span>
                <div>
                  <p className="font-bold text-slate-900">{feature.title}</p>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: Card de Login con Validación */}
        <div className="relative">
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(179,25,66,0.08)] space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Iniciar Sesión</h3>
              <p className="text-sm text-slate-500">
                Selecciona tu acceso corporativo para continuar
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="usuario@grupo9.com.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "h-12 rounded-xl border-slate-200 focus:ring-[#b31942]",
                    error && "border-red-500 focus:ring-red-500"
                  )}
                  required
                />
                {error && (
                  <p className="text-[11px] text-red-500 font-bold ml-1 animate-pulse">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#b31942] hover:bg-[#8e1435] text-white rounded-2xl py-8 h-auto transition-all duration-300 shadow-xl shadow-[#b31942]/20 group overflow-hidden relative"
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <span className="text-xl font-bold group-hover:scale-105 transition-transform">
                    Ingresar al Sistema
                  </span>
                  <span className="text-xs opacity-70 font-medium tracking-wide">
                    Módulo de Piloto — GRUPO 9 2026
                  </span>
                </div>
              </Button>
            </form>

            <div className="pt-6 border-t border-slate-50">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-[10px] text-blue-600 font-bold text-center uppercase tracking-wider">
                  Acceso habilitado para: Mejora Continua, Logística, Planeamiento, Marketing y Créditos.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
