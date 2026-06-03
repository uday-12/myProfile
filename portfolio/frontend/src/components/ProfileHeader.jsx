import { renderLines } from '../lib/markdown.jsx'

const PLATFORM_ICONS = {
  github: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

function SocialLink({ platform, url }) {
  const href = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
  const icon = PLATFORM_ICONS[platform.toLowerCase()] ?? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm capitalize transition-colors duration-200"
      style={{
        color: 'var(--c-text-2)',
        background: 'var(--c-surface-2)',
        border: '1px solid var(--c-border-2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--c-accent-2)'
        e.currentTarget.style.borderColor = 'var(--c-accent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--c-text-2)'
        e.currentTarget.style.borderColor = 'var(--c-border-2)'
      }}
    >
      {icon}
      {platform}
    </a>
  )
}

export default function ProfileHeader({ profile }) {
  const socialEntries = Object.entries(profile.socialLinks || {}).filter(([, v]) => v)

  return (
    <header className="relative overflow-hidden pt-20 pb-16 px-4" style={{ background: 'var(--c-bg)' }}>
      {/* subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <div className="w-[600px] h-[400px] rounded-full blur-3xl" style={{ background: 'var(--c-accent-bg)' }} />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-28 h-28 rounded-full mx-auto mb-6 object-cover ring-4 ring-offset-4"
            style={{ '--tw-ring-color': 'var(--c-border-2)', '--tw-ring-offset-color': 'var(--c-bg)' }}
          />
        ) : (
          <div
            className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center ring-4 ring-offset-4"
            style={{
              background: 'var(--c-surface-2)',
              border: '4px solid var(--c-border-2)',
              '--tw-ring-color': 'var(--c-border-2)',
              '--tw-ring-offset-color': 'var(--c-bg)',
            }}
          >
            <span className="text-4xl font-bold select-none" style={{ color: 'var(--c-text-3)' }}>
              {profile.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight" style={{ color: 'var(--c-text)' }}>
          {profile.name}
        </h1>

        <p className="text-lg md:text-xl font-medium mb-5" style={{ color: 'var(--c-accent-2)' }}>
          {profile.title}
        </p>

        <div className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8" style={{ color: 'var(--c-text-2)' }}>
          {renderLines(profile.bio || '')}
        </div>

        {socialEntries.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {socialEntries.map(([platform, url]) => (
              <SocialLink key={platform} platform={platform} url={url} />
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
