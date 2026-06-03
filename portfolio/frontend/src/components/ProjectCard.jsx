import { useNavigate } from 'react-router-dom'
import { formatPeriod } from '../lib/formatDate.js'

function getThumbnail(project) {
  const { videoUrl, sections } = project
  if (videoUrl) {
    const yt = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`
  }
  return sections?.find((s) => s.imageUrl)?.imageUrl ?? null
}

export default function ProjectCard({ project }) {
  const navigate = useNavigate()
  const thumbnail = getThumbnail(project)

  return (
    <article
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group cursor-pointer rounded-xl overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 transition-all duration-200"
      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--c-border-2)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--c-border)'}
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden relative" style={{ background: 'var(--c-surface-2)' }}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-surface)]">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--c-text-3)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909" />
            </svg>
          </div>
        )}
        {/* Hover arrow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-end p-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-200"
            style={{ background: 'var(--c-accent)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-base transition-colors duration-150"
            style={{ color: 'var(--c-text)' }}
            onMouseEnter={(e) => e.currentTarget.closest('article').querySelector('h3').style.color = 'var(--c-accent-2)'}
          >
            {project.title}
          </h3>
          {formatPeriod(project.startDate, project.endDate) && (
            <span className="text-xs shrink-0 mt-0.5" style={{ color: 'var(--c-text-3)' }}>
              {formatPeriod(project.startDate, project.endDate)}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--c-text-2)' }}>
          {project.description}
        </p>
      </div>
    </article>
  )
}
