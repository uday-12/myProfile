import ProjectCard from './ProjectCard.jsx'
import { formatPeriod } from '../lib/formatDate.js'
import { renderLines } from '../lib/markdown.jsx'

export default function CompanySection({ company }) {
  const period = formatPeriod(company.startDate, company.endDate)

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Company header */}
        <div className="flex items-start gap-4 mb-4">
          {company.logoUrl && (
            <img
              src={company.logoUrl}
              alt={`${company.name} logo`}
              className="w-12 h-12 rounded-lg object-contain p-1 shrink-0 mt-1" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-2)' }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--c-text)' }}>
                {company.name}
              </h2>
              {period && (
                <span className="text-sm shrink-0" style={{ color: 'var(--c-text-3)' }}>{period}</span>
              )}
            </div>
            {company.description && (
              <div className="mt-1 text-sm md:text-base leading-relaxed" style={{ color: 'var(--c-text-2)' }}>
                {renderLines(company.description)}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-10" style={{ background: 'linear-gradient(to right, var(--c-accent), var(--c-border), transparent)' }} />

        {/* Projects grid */}
        {company.projects.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--c-text-3)' }}>No projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {company.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
