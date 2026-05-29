import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api.js'
import VideoPlayer from '../components/VideoPlayer.jsx'
import SectionBlock from '../components/SectionBlock.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

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
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-400 transition-colors duration-150 mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to portfolio
        </button>

        {/* Title + description */}
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-3 tracking-tight">
          {project.title}
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-10 text-base md:text-lg max-w-3xl">
          {project.description}
        </p>

        {/* Video */}
        {project.videoUrl && (
          <div className="mb-14">
            <VideoPlayer url={project.videoUrl} />
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

      <footer className="text-center py-8 text-zinc-700 text-xs border-t border-zinc-900 mt-16">
        <button
          onClick={() => navigate('/')}
          className="text-zinc-600 hover:text-indigo-400 transition-colors duration-150"
        >
          ← Back to portfolio
        </button>
      </footer>
    </div>
  )
}
