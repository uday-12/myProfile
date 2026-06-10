import { useState, useEffect } from 'react'
import api from '../lib/api.js'
import ProfileHeader from '../components/ProfileHeader.jsx'
import CompanySection from '../components/CompanySection.jsx'
import EducationSection from '../components/EducationSection.jsx'
import SkillsSection from '../components/SkillsSection.jsx'
import CertificationsSection from '../components/CertificationsSection.jsx'
import ContactSection from '../components/ContactSection.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Home() {
  const [profile, setProfile] = useState(null)
  const [companies, setCompanies] = useState([])
  const [education, setEducation] = useState([])
  const [skillCategories, setSkillCategories] = useState([])
  const [certifications, setCertifications] = useState([])
  const [contactInfo, setContactInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/profile'),
      api.get('/api/companies'),
      api.get('/api/education'),
      api.get('/api/skills/categories'),
      api.get('/api/certifications'),
      api.get('/api/contact'),
    ])
      .then(([profileRes, companiesRes, educationRes, skillsRes, certsRes, contactRes]) => {
        setProfile(profileRes.data)
        setCompanies(companiesRes.data)
        setEducation(educationRes.data)
        setSkillCategories(skillsRes.data.sort((a, b) => a.order - b.order))
        setCertifications(certsRes.data)
        setContactInfo(contactRes.data)
      })
      .catch(() => setError('Failed to load portfolio data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      {profile && <ProfileHeader profile={profile} />}

      {companies.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-[var(--c-text-3)] text-sm">No projects to display yet.</p>
        </div>
      ) : (
        <main>
          {companies.map((company, i) => (
            <div key={company.id}>
              <CompanySection company={company} />
              {i < companies.length - 1 && (
                <div className="max-w-6xl mx-auto px-4">
                  <div className="h-px bg-[var(--c-border)]" />
                </div>
              )}
            </div>
          ))}
        </main>
      )}

      {education.length > 0 && <EducationSection items={education} />}

      {skillCategories.length > 0 && <SkillsSection categories={skillCategories} />}

      {certifications.length > 0 && <CertificationsSection items={certifications} />}

      <ContactSection info={contactInfo} />

      <footer className="text-center py-8 text-[var(--c-text-3)] text-xs border-t border-[var(--c-border)]">
        {profile?.name} · {new Date().getFullYear()}
      </footer>

      <ThemeToggle />
    </div>
  )
}
