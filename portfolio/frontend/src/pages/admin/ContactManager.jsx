import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

export default function ContactManager() {
  const addToast = useToast()
  const [form, setForm] = useState({ phone: '', email: '', location: '', toEmail: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    api.get('/api/contact')
      .then((res) => {
        if (res.data) setForm({
          phone:    res.data.phone    ?? '',
          email:    res.data.email    ?? '',
          location: res.data.location ?? '',
          toEmail:  res.data.toEmail  ?? '',
        })
      })
      .catch(() => addToast('Failed to load contact info.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/api/contact', {
        phone:    form.phone    || null,
        email:    form.email    || null,
        location: form.location || null,
        toEmail:  form.toEmail  || null,
      })
      addToast('Contact info saved.')
    } catch {
      addToast('Failed to save contact info.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-zinc-600 animate-spin" /></div>
  )

  return (
    <div className="w-full max-w-xl">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Contact Info</h1>
        <p className="text-zinc-500 text-sm mt-1">Shown in the public Contact Us section.</p>
      </div>

      <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Phone / Call</label>
          <input className={inputCls} placeholder="e.g. +91 98765 43210" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Public email</label>
          <input className={inputCls} placeholder="e.g. hello@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
          <p className="text-xs text-zinc-600 mt-1">Shown as your contact email on the public page.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Location</label>
          <input className={inputCls} placeholder="e.g. Hyderabad, India" value={form.location} onChange={(e) => set('location', e.target.value)} />
        </div>

        <div className="pt-2 border-t border-zinc-800">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Receive form messages at
          </label>
          <input className={inputCls} placeholder="your-personal@email.com" value={form.toEmail} onChange={(e) => set('toEmail', e.target.value)} />
          <p className="text-xs text-zinc-600 mt-1">Contact form submissions will be emailed here. Make sure SMTP is configured in your server .env.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl transition-colors font-medium"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
