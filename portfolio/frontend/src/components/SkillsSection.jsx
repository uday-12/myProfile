import { useState } from 'react'

function SkillBar({ skill }) {
  const p = skill.proficiency
  const color =
    p >= 80 ? 'var(--c-accent)' :
    p >= 60 ? '#8b5cf6' :
    p >= 40 ? '#a78bfa' : '#c4b5fd'

  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-sm" style={{ color: 'var(--c-text-2)' }}>
        {skill.name}
      </span>
      <div className="flex-1 relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-surface-2)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${p}%`, background: color }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-mono" style={{ color: 'var(--c-text-3)' }}>
        {p}%
      </span>
    </div>
  )
}

export default function SkillsSection({ categories }) {
  const [activeId, setActiveId] = useState(() => categories[0]?.id ?? null)
  if (!categories || categories.length === 0) return null

  const active = categories.find((c) => c.id === activeId) ?? categories[0]
  const skills = [...(active?.skills ?? [])].sort((a, b) => a.order - b.order)

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--c-text)' }}>
          Skills
        </h2>
        <div className="h-px mb-8" style={{ background: 'linear-gradient(to right, var(--c-accent), var(--c-border), transparent)' }} />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveId(cat.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={
                cat.id === activeId
                  ? { background: 'var(--c-accent)', color: '#fff' }
                  : { background: 'var(--c-surface-2)', color: 'var(--c-text-2)', border: '1px solid var(--c-border-2)' }
              }
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Skill bars */}
        {skills.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--c-text-3)' }}>No skills listed.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
            {skills.map((skill) => (
              <SkillBar key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
