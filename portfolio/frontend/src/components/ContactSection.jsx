import { useState } from 'react'
import api from '../lib/api.js'

function PhoneIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

function ContactItem({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--c-accent)', color: '#fff' }}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-base" style={{ color: 'var(--c-text)' }}>{label}</p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-2)' }}>{value}</p>
      </div>
    </div>
  )
}

export default function ContactSection({ info }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errMsg, setErrMsg] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const hasAnyInfo = info?.phone || info?.email || info?.location

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
    setStatus('sending')
    setErrMsg('')
    try {
      await api.post('/api/contact/send', form)
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrMsg(err.response?.data?.error || 'Something went wrong. Please try again.')
    }
  }

  const inputCls = [
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors',
    'placeholder-[var(--c-text-3)]',
    'bg-[var(--c-surface-2)] border border-[var(--c-border-2)]',
    'text-[var(--c-text)]',
    'focus:border-[var(--c-accent)] focus:ring-1 focus:ring-[var(--c-accent)]',
  ].join(' ')

  return (
    <section className="py-20 px-4" style={{ background: 'var(--c-surface)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--c-text)' }}>
          Contact Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left — contact details */}
          <div className="space-y-8">
            {hasAnyInfo ? (
              <>
                <ContactItem icon={<PhoneIcon />}    label="Call"     value={info.phone} />
                <ContactItem icon={<EmailIcon />}    label="Email"    value={info.email} />
                <ContactItem icon={<LocationIcon />} label="Location" value={info.location} />
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--c-text-3)' }}>Contact details not configured yet.</p>
            )}
          </div>

          {/* Right — form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className={inputCls}
              placeholder="Name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
            <input
              type="email"
              className={inputCls}
              placeholder="Email address"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
            <textarea
              className={`${inputCls} resize-none`}
              rows={5}
              placeholder="Message"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              required
            />

            {status === 'success' && (
              <p className="text-sm font-medium text-emerald-400">Message sent! I'll get back to you soon.</p>
            )}
            {status === 'error' && (
              <p className="text-sm font-medium text-red-400">{errMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-widest uppercase transition-opacity disabled:opacity-60"
              style={{ background: 'var(--c-accent)', color: '#fff' }}
            >
              {status === 'sending' ? 'Sending…' : 'Send Now'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
