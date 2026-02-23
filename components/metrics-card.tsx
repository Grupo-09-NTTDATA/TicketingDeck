"use client"

import { cn } from "@/lib/utils"

interface MetricsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: string
  trend?: number
  color?: "primary" | "success" | "warning" | "destructive" | "info"
  className?: string
}

const colorConfig = {
  primary: "bg-primary/10 text-primary border-primary/30",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-info/10 text-info border-info/30",
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon = "📊",
  trend,
  color = "primary",
  className,
}: MetricsCardProps) {
  return (
    <div
      className={cn(
        "p-5 bg-card rounded-lg border border-border hover:shadow-lg hover:border-primary/50 transition-all",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", colorConfig[color])}>
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "px-2 py-1 rounded text-xs font-semibold",
              trend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
