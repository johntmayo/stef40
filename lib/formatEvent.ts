/** Format event date, time range, and location for display */
export function formatEventDateTime(event: {
  date?: string
  time?: string
  endTime?: string
  location?: string
}): { dateLine: string; timeLocationLine: string } {
  const parts: string[] = []
  if (event.date) {
    try {
      const d = new Date(event.date + 'T12:00:00')
      if (!isNaN(d.getTime())) {
        parts.push(d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
      } else {
        parts.push(event.date)
      }
    } catch {
      parts.push(event.date)
    }
  }
  const dateLine = parts.join('') || ''

  const timeParts: string[] = []
  if (event.time && event.endTime) {
    timeParts.push(`${event.time} – ${event.endTime}`)
  } else if (event.time) {
    timeParts.push(event.time)
  } else if (event.endTime) {
    timeParts.push(event.endTime)
  }
  if (event.location) {
    timeParts.push(timeParts.length ? ` · ${event.location}` : event.location)
  }
  const timeLocationLine = timeParts.join('')

  return { dateLine, timeLocationLine }
}
