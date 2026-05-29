import ProjectCard from './ProjectCard.jsx'

export default function CompanySection({ company }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Company header */}
        <div className="flex items-start gap-4 mb-4">
          {company.logoUrl && (
            <img
              src={company.logoUrl}
              alt={`${company.name} logo`}
              className="w-12 h-12 rounded-lg object-contain bg-zinc-800 border border-zinc-700 p-1 shrink-0 mt-1"
            />
          )}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
              {company.name}
            </h2>
            {company.description && (
              <p className="mt-1 text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
                {company.description}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-indigo-500/40 via-zinc-700 to-transparent mb-10" />

        {/* Projects grid */}
        {company.projects.length === 0 ? (
          <p className="text-zinc-600 text-sm">No projects yet.</p>
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
