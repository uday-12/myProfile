export default function ProjectMeta({ metadata }) {
  if (!metadata || metadata.length === 0) return null

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
      {metadata.map((item, i) => (
        <div key={i} className="flex gap-4 px-5 py-3" style={{ borderBottom: i < metadata.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
          <span className="text-xs font-semibold uppercase tracking-wider w-28 shrink-0 pt-0.5" style={{ color: 'var(--c-text-2)' }}>
            {item.label}
          </span>
          <span className="text-sm leading-relaxed" style={{ color: 'var(--c-text)' }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}
