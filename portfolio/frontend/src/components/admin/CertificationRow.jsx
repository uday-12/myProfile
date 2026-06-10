import { useState, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Loader2, X, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import FileUpload from './FileUpload.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

const toMonth = (d) => (d ? new Date(d).toISOString().slice(0, 7) : '')
const toISO   = (m) => (m ? `${m}-01T00:00:00.000Z` : null)

const fmtMonth = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  : null

export default function CertificationRow({ cert: initial, onDelete }) {
  const addToast = useToast()
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting]       = useState(false)

  const [form, setForm] = useState({
    name:          initial.name,
    issuer:        initial.issuer,
    issueDate:     toMonth(initial.issueDate),
    expiryDate:    toMonth(initial.expiryDate),
    credentialId:  initial.credentialId  ?? '',
    credentialUrl: initial.credentialUrl ?? '',
    logoUrl:       initial.logoUrl       ?? '',
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: initial.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const handleSave = async () => {
    if (!form.name.trim() || !form.issuer.trim()) {
      addToast('Name and issuer are required.', 'error'); return
    }
    setSaving(true)
    try {
      await api.put(`/api/certifications/${initial.id}`, {
        ...form,
        issueDate:     toISO(form.issueDate),
        expiryDate:    toISO(form.expiryDate),
        credentialId:  form.credentialId  || null,
        credentialUrl: form.credentialUrl || null,
        logoUrl:       form.logoUrl       || null,
      })
      addToast('Certification updated.')
      setEditing(false)
    } catch {
      addToast('Failed to update certification.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/certifications/${initial.id}`)
      onDelete(initial.id)
      addToast('Certification deleted.')
    } catch {
      addToast('Failed to delete certification.', 'error')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const issued  = fmtMonth(initial.issueDate)
  const expires = fmtMonth(initial.expiryDate)

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`rounded-2xl border transition-colors ${open ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'}`}>
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-3.5">
          <button {...attributes} {...listeners} className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none shrink-0">
            <GripVertical className="w-4 h-4" />
          </button>

          {form.logoUrl && (
            <img src={form.logoUrl} alt="" className="w-8 h-8 rounded-md object-contain bg-zinc-800 border border-zinc-700 p-0.5 shrink-0" />
          )}

          <button
            onClick={() => { setOpen((o) => !o); if (editing) setEditing(false) }}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            {open ? <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />}
            <div className="min-w-0">
              <span className="font-semibold text-zinc-100 truncate block">{form.name}</span>
              <span className="text-xs text-zinc-500 truncate block">
                {form.issuer}{issued ? ` · Issued ${issued}` : ''}
              </span>
            </div>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true); setEditing((v) => !v) }}
            className="shrink-0 p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirmOpen(true)} className="shrink-0 p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded: read-only preview */}
        {open && !editing && (
          <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-1 text-sm text-zinc-400">
            {issued && <p className="text-xs text-zinc-500">Issued {issued}{expires ? ` · Expires ${expires}` : ''}</p>}
            {form.credentialId && <p>Credential ID: <span className="text-zinc-300 font-mono text-xs">{form.credentialId}</span></p>}
            {form.credentialUrl && (
              <a href={form.credentialUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Show credential
              </a>
            )}
          </div>
        )}

        {/* Expanded: edit form */}
        {open && editing && (
          <div className="border-t border-zinc-800 px-4 pb-4 pt-4">
            <div className="space-y-3 p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
              <p className="text-xs font-medium text-zinc-400">Edit certification</p>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Issuing organisation *</label>
                <input className={inputCls} placeholder="e.g. Coursera, AWS" value={form.issuer} onChange={(e) => set('issuer', e.target.value)} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">Issue date</label>
                  <input type="month" className={inputCls} value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">Expiry date <span className="text-zinc-600">(blank = no expiry)</span></label>
                  <input type="month" className={inputCls} value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Credential ID</label>
                <input className={inputCls} placeholder="e.g. LBALJ1655116229649" value={form.credentialId} onChange={(e) => set('credentialId', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Credential URL</label>
                <input className={inputCls} placeholder="https://…" value={form.credentialUrl} onChange={(e) => set('credentialUrl', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Logo</label>
                <FileUpload value={form.logoUrl} onChange={(v) => set('logoUrl', v)} />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 px-3.5 py-2 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 rounded-lg transition-colors">
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          message={`Delete "${form.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setConfirmOpen(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
