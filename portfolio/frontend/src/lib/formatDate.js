export function formatPeriod(startDate, endDate) {
  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (!startDate) return null
  return `${fmt(startDate)} – ${endDate ? fmt(endDate) : 'Present'}`
}
