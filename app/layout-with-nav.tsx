"use client"

import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { TopBar } from "@/components/top-bar"
import { useState, useEffect } from "react"

interface LayoutWithNavProps {
  children: React.ReactNode
  currentUser?: string
  onLogout?: () => void
}

export function LayoutWithNav({ children, currentUser = "Usuario", onLogout = () => {} }: LayoutWithNavProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav currentUser={currentUser} onLogout={onLogout} />
      <div className="ml-64 w-full">
        <TopBar title="Dashboard" currentUser={currentUser} />
        <main className="mt-16 pt-6 px-6 pb-12">{children}</main>
      </div>
    </div>
  )
}
