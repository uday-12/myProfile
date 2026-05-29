import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api.js'

// ── tiny reusable field primitives ──────────────────────────────────────────

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-1.5">
        {label}
        {required && <span className="text-zinc-700 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, className = '', ...props }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${className}`}
      {...props}
    />
  )
}

function Textarea({ value, onChange, ...props }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
      {...props}
    />
  )
}

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-zinc-200">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-600 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-zinc-800 my-8" />
}

// ── main component ───────────────────────────────────────────────────────────

export default function ProfileEditor() {
  const fileInputRef = useRef(null)

  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [form, setForm] = useState({ name: '', title: '', bio: '', email: '', avatarUrl: '' })
  const [socialLinks, setSocialLinks] = useState([]) // [{ platform, url }]

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    api
      .get('/api/profile')
      .then((res) => {
        const p = res.data
        setForm({
          name: p.name ?? '',
          title: p.title ?? '',
          bio: p.bio ?? '',
          email: p.email ?? '',
          avatarUrl: p.avatarUrl ?? '',
        })
        setSocialLinks(
          Object.entries(p.socialLinks ?? {}).map(([platform, url]) => ({ platform, url }))
        )
      })
      .catch(() => {}) // profile may not exist yet — form starts blank
      .finally(() => setPageLoading(false))
  }, [])

  // ── avatar ────────────────────────────────────────────────────────────────

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // allow re-selecting the same file
    setAvatarUploading(true)
    setSaveError(null)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await api.post('/api/upload', data)
      setField('avatarUrl', res.data.url)
    } catch {
      setSaveError('Avatar upload failed. Check Cloudinary config.')
    } finally {
      setAvatarUploading(false)
    }
  }

  // ── social links ──────────────────────────────────────────────────────────

  const addLink = () => setSocialLinks((l) => [...l, { platform: '', url: '' }])
  const removeLink = (i) => setSocialLinks((l) => l.filter((_, idx) => idx !== i))
  const updateLink = (i, key, value) =>
    setSocialLinks((l) => {
      const next = [...l]
      next[i] = { ...next[i], [key]: value }
      return next
    })

  // ── submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const socialLinksObj = Object.fromEntries(
      socialLinks
        .filter((l) => l.platform.trim() && l.url.trim())
        .map((l) => [l.platform.trim().toLowerCase(), l.url.trim()])
    )

    try {
      await api.put('/api/profile', { ...form, socialLinks: socialLinksObj })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.response?.data?.error ?? 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Profile</h1>
        <p className="text-zinc-500 text-sm mt-1">Your public portfolio identity.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Avatar ── */}
        <SectionHeading title="Avatar" />
        <div className="flex items-center gap-5">
          {/* Preview */}
          <div className="relative shrink-0">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-zinc-500 select-none">
                  {form.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {avatarUploading ? 'Uploading…' : 'Change avatar'}
            </button>
            {form.avatarUrl && (
              <button
                type="button"
                onClick={() => setField('avatarUrl', '')}
                className="px-3.5 py-1.5 text-sm text-zinc-600 hover:text-zinc-400 transition-colors text-left"
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>

        <Divider />

        {/* ── Basic info ── */}
        <SectionHeading title="Basic info" />
        <div className="space-y-5">
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(v) => setField('name', v)}
              placeholder="Your name"
              required
            />
          </Field>
          <Field label="Title" required>
            <Input
              value={form.title}
              onChange={(v) => setField('title', v)}
              placeholder="e.g. Full-Stack Engineer"
              required
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(v) => setField('email', v)}
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field label="Bio">
            <Textarea
              value={form.bio}
              onChange={(v) => setField('bio', v)}
              placeholder="A short bio about yourself…"
              rows={4}
            />
          </Field>
        </div>

        <Divider />

        {/* ── Social links ── */}
        <div className="flex items-center justify-between mb-5">
          <SectionHeading
            title="Social links"
            subtitle="Platform keys become the label shown publicly (e.g. github, linkedin)."
          />
          <button
            type="button"
            onClick={addLink}
            className="shrink-0 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            + Add link
          </button>
        </div>

        {socialLinks.length === 0 ? (
          <p className="text-zinc-600 text-sm mb-6">No social links yet. Click "+ Add link" to add one.</p>
        ) : (
          <div className="space-y-2.5 mb-6">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={link.platform}
                  onChange={(v) => updateLink(i, 'platform', v)}
                  placeholder="github"
                  className="w-32 shrink-0"
                />
                <Input
                  value={link.url}
                  onChange={(v) => updateLink(i, 'url', v)}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Remove"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Submit row ── */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving || avatarUploading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : 'Save changes'}
          </button>

          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved
            </span>
          )}

          {saveError && (
            <span className="text-sm text-red-400">{saveError}</span>
          )}
        </div>
      </form>
    </div>
  )
}
