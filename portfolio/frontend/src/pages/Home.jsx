import { useState, useEffect } from 'react'
import api from '../lib/api.js'
import ProfileHeader from '../components/ProfileHeader.jsx'
import CompanySection from '../components/CompanySection.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Home() {
  const [profile, setProfile] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.get('/api/profile'), api.get('/api/companies')])
      .then(([profileRes, companiesRes]) => {
        setProfile(profileRes.data)
        setCompanies(companiesRes.data)
      })
      .catch(() => setError('Failed to load portfolio data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="min-h-screen bg-zinc-950">
      {profile && <ProfileHeader profile={profile} />}

      {companies.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-zinc-600 text-sm">No projects to display yet.</p>
        </div>
      ) : (
        <main>
          {companies.map((company, i) => (
            <div key={company.id}>
              <CompanySection company={company} />
              {i < companies.length - 1 && (
                <div className="max-w-6xl mx-auto px-4">
                  <div className="h-px bg-zinc-800/80" />
                </div>
              )}
            </div>
          ))}
        </main>
      )}

      <footer className="text-center py-8 text-zinc-700 text-xs border-t border-zinc-900">
        {profile?.name} · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
