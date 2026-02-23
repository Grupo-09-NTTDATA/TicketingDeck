export function formatDistanceToNow(date: Date | string): string {
  const now = new Date()
  const pastDate = new Date(date)
  const diffMs = now.getTime() - pastDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "hace unos segundos"
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`
  if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`

  return pastDate.toLocaleDateString("es-ES")
}
