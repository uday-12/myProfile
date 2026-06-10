import { formatPeriod } from '../lib/formatDate.js'

function SkillBadge({ skill }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-2)', border: '1px solid var(--c-border-2)' }}
    >
      {skill}
    </span>
  )
}

function EducationCard({ item, isLast }) {
  const period = formatPeriod(item.startDate, item.endDate)
  const subtitle = [item.degree, item.fieldOfStudy].filter(Boolean).join(', ')
  const skills = Array.isArray(item.skills) ? item.skills : []

  return (
    <div
      className="flex gap-4 py-6"
      style={isLast ? {} : { borderBottom: '1px solid var(--c-border)' }}
    >
      {/* Logo / placeholder */}
      <div className="shrink-0 mt-0.5">
        {item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt={item.school}
            className="w-12 h-12 rounded-lg object-contain p-1"
            style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-2)' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-2)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--c-text-3)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>{item.school}</h3>
            {subtitle && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-2)' }}>{subtitle}</p>
            )}
          </div>
          {period && (
            <span className="text-xs shrink-0 mt-0.5" style={{ color: 'var(--c-text-3)' }}>{period}</span>
          )}
        </div>
        {item.grade && (
          <p className="text-sm mt-2" style={{ color: 'var(--c-text-2)' }}>Grade: {item.grade}</p>
        )}
        {item.activities && (
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-2)' }}>
            Activities and societies: {item.activities}
          </p>
        )}
        {item.description && (
          <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--c-text-2)' }}>
            {item.description}
          </p>
        )}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skills.map((s) => (
              <SkillBadge key={s} skill={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EducationSection({ items }) {
  if (!items || items.length === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--c-text)' }}>
          Education
        </h2>
        <div className="h-px mb-10" style={{ background: 'linear-gradient(to right, var(--c-accent), var(--c-border), transparent)' }} />

        <div>
          {items.map((item, i) => (
            <EducationCard key={item.id} item={item} isLast={i === items.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
