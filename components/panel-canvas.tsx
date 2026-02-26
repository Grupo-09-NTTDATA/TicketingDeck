"use client"

interface PanelCanvasProps {
  title: string
  subtitle?: string
  area: "Data" | "Procesos"
  icon?: string
  tags?: string[]
}

const AREA_ACCENT: Record<string, { border: string; bg: string; dot: string; text: string }> = {
  Data: {
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    dot: "bg-blue-500",
    text: "text-blue-400",
  },
  Procesos: {
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    dot: "bg-violet-500",
    text: "text-violet-400",
  },
}

export function PanelCanvas({ title, subtitle, area, icon = "🗂️", tags = [] }: PanelCanvasProps) {
  const accent = AREA_ACCENT[area]

  return (
    <div className="flex flex-col gap-6">
      {/* Header del panel */}
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {/* Canvas vacío */}
      <div
        className={`
          relative min-h-[calc(100vh-220px)] rounded-2xl border-2 border-dashed
          ${accent.border} ${accent.bg}
          flex flex-col items-center justify-center gap-6
          transition-all duration-300
        `}
      >
        {/* Grid de fondo decorativo */}
        <div
          className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Contenido central */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center px-8 max-w-md">
          <div
            className={`
              w-20 h-20 rounded-2xl border ${accent.border} ${accent.bg}
              flex items-center justify-center text-4xl
              shadow-lg
            `}
          >
            {icon}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Este lienzo está listo para diseñar.
              <br />
              Agrega componentes, tablas, gráficas o métricas para este panel.
            </p>
          </div>

          {/* Tags de contexto */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${accent.border} ${accent.text} bg-white/5`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Indicador de área */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Área {area}
            </span>
          </div>
        </div>

        {/* Esquinas decorativas */}
        <span className={`absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg ${accent.border}`} />
        <span className={`absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg ${accent.border}`} />
        <span className={`absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg ${accent.border}`} />
        <span className={`absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 rounded-br-lg ${accent.border}`} />
      </div>
    </div>
  )
}
