export function formatDateRange(dates: Date[]): string {
  if (dates.length === 0) return ''
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
  const uniqueDays = Array.from(new Set(sorted.map((d) => d.toDateString()))).map((s) => new Date(s))
  const sameMonthYear = uniqueDays.every(
    (d) => d.getMonth() === uniqueDays[0].getMonth() && d.getFullYear() === uniqueDays[0].getFullYear()
  )
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  if (sameMonthYear) {
    const monthYear = capitalize(new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(uniqueDays[0]))
    const parts = uniqueDays.map((d) => {
      const weekday = capitalize(new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d))
      return `${weekday} ${d.getDate()}`
    })
    return `${parts.join(' & ')} ${monthYear}`
  }

  return uniqueDays
    .map((d) => capitalize(new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)))
    .join(' & ')
}

export function formatCeremonyDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const datePart = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
  const timePart = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
  const capitalized = datePart.charAt(0).toUpperCase() + datePart.slice(1)
  return `${capitalized} à ${timePart}`
}
