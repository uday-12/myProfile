// Renders **bold** and *italic* inline markdown into React elements.
export function parseInline(text) {
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g
  const parts = []
  let last = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[1]) {
      parts.push(<strong key={key++} className="font-semibold text-zinc-100">{match[2]}</strong>)
    } else {
      parts.push(<em key={key++}>{match[4]}</em>)
    }
    last = regex.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
