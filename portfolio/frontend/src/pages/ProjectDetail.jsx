import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api.js'
import { formatPeriod } from '../lib/formatDate.js'
import { renderLines } from '../lib/markdown.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'
import ProjectMeta from '../components/ProjectMeta.jsx'
import SectionBlock from '../components/SectionBlock.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/api/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch((err) => {
        setError(err.response?.status === 404 ? 'Project not found.' : 'Failed to load project.')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-[var(--c-text-3)] hover:text-[var(--c-accent-2)] transition-colors duration-150 mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to portfolio
        </button>

        {/* Title + description */}
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--c-text)] tracking-tight">
            {project.title}
          </h1>
          {formatPeriod(project.startDate, project.endDate) && (
            <span className="text-sm shrink-0" style={{ color: 'var(--c-text-3)' }}>
              {formatPeriod(project.startDate, project.endDate)}
            </span>
          )}
        </div>
        <div className="text-[var(--c-text-2)] leading-relaxed mb-10 text-base md:text-lg">
          {renderLines(project.description)}
        </div>

        {/* Video */}
        {project.videoUrl && (
          <div className="mb-8">
            <VideoPlayer url={project.videoUrl} />
          </div>
        )}

        {/* Meta (skills, role, etc.) */}
        {project.metadata?.length > 0 && (
          <div className="mb-14">
            <ProjectMeta metadata={project.metadata} />
          </div>
        )}

        {/* Sections */}
        {project.sections.length > 0 && (
          <div className="space-y-14">
            {project.sections.map((section, i) => (
              <SectionBlock key={section.id} section={section} index={i} />
            ))}
          </div>
        )}
      </div>

      <footer className="text-center py-8 text-[var(--c-text-3)] text-xs border-t border-[var(--c-border)] mt-16">
        <button
          onClick={() => navigate('/')}
          className="text-[var(--c-text-3)] hover:text-[var(--c-accent-2)] transition-colors duration-150"
        >
          ← Back to portfolio
        </button>
      </footer>

      <ThemeToggle />
    </div>
  )
}
