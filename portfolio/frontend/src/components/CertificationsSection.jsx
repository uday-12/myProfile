import { ExternalLink } from 'lucide-react'

const fmtMonth = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null

function CertCard({ cert, isLast }) {
  const issued  = fmtMonth(cert.issueDate)
  const expires = fmtMonth(cert.expiryDate)

  return (
    <div
      className="flex gap-4 py-6"
      style={isLast ? {} : { borderBottom: '1px solid var(--c-border)' }}
    >
      {/* Logo / placeholder */}
      <div className="shrink-0 mt-0.5">
        {cert.logoUrl ? (
          <img
            src={cert.logoUrl}
            alt={cert.issuer}
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
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>{cert.name}</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-2)' }}>{cert.issuer}</p>
          </div>
          {issued && (
            <span className="text-xs shrink-0 mt-0.5" style={{ color: 'var(--c-text-3)' }}>
              Issued {issued}{expires ? ` · Expires ${expires}` : ''}
            </span>
          )}
        </div>

        {cert.credentialId && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--c-text-3)' }}>
            Credential ID {cert.credentialId}
          </p>
        )}

        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ border: '1px solid var(--c-border-2)', color: 'var(--c-text-2)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-text-2)'}
          >
            Show credential <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

export default function CertificationsSection({ items }) {
  if (!items || items.length === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--c-text)' }}>
          Licenses & Certifications
        </h2>
        <div className="h-px mb-10" style={{ background: 'linear-gradient(to right, var(--c-accent), var(--c-border), transparent)' }} />

        <div>
          {items.map((cert, i) => (
            <CertCard key={cert.id} cert={cert} isLast={i === items.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
