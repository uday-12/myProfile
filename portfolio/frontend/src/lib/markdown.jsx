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

// Renders a multi-line description with bullet points (lines starting with "- "),
// **bold**, and *italic* formatting into React elements.
export function renderLines(text) {
  if (!text) return null
  const lines = text.split('\n')
  const result = []
  let bulletItems = []
  let key = 0

  const flushBullets = () => {
    if (bulletItems.length === 0) return
    result.push(
      <ul key={key++} className="list-disc pl-5 space-y-1">
        {bulletItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
      </ul>
    )
    bulletItems = []
  }

  lines.forEach((line, i) => {
    if (line.startsWith('- ')) {
      bulletItems.push(line.slice(2))
    } else {
      flushBullets()
      result.push(
        <span key={key++}>
          {parseInline(line)}
          {i < lines.length - 1 && <br />}
        </span>
      )
    }
  })
  flushBullets()
  return result
}
