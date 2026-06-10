import { useState, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Loader2, X, ChevronDown, ChevronRight } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import FileUpload from './FileUpload.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

const toMonth = (d) => (d ? new Date(d).toISOString().slice(0, 7) : '')
const toISO = (m) => (m ? `${m}-01T00:00:00.000Z` : null)

export default function EducationRow({ education: initial, onDelete }) {
  const addToast = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    school: initial.school,
    degree: initial.degree ?? '',
    fieldOfStudy: initial.fieldOfStudy ?? '',
    startDate: toMonth(initial.startDate),
    endDate: toMonth(initial.endDate),
    grade: initial.grade ?? '',
    activities: initial.activities ?? '',
    description: initial.description ?? '',
    skills: Array.isArray(initial.skills) ? initial.skills.join(', ') : '',
    logoUrl: initial.logoUrl ?? '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: initial.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const descRef = useRef(null)

  const subtitle = [form.degree, form.fieldOfStudy].filter(Boolean).join(', ')

  const handleSave = async () => {
    if (!form.school.trim()) {
      addToast('School name is required.', 'error')
      return
    }
    setSaving(true)
    try {
      const skillsArr = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await api.put(`/api/education/${initial.id}`, {
        ...form,
        skills: skillsArr,
        logoUrl: form.logoUrl || null,
        startDate: toISO(form.startDate),
        endDate: toISO(form.endDate),
        grade: form.grade || null,
        activities: form.activities || null,
        description: form.description || null,
        degree: form.degree || null,
        fieldOfStudy: form.fieldOfStudy || null,
      })
      addToast('Education updated.')
      setEditing(false)
    } catch {
      addToast('Failed to update education.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/education/${initial.id}`)
      onDelete(initial.id)
      addToast('Education deleted.')
    } catch {
      addToast('Failed to delete education.', 'error')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`rounded-2xl border transition-colors ${open ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'}`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3.5">
          <button {...attributes} {...listeners} className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none shrink-0">
            <GripVertical className="w-4 h-4" />
          </button>

          {form.logoUrl && (
            <img src={form.logoUrl} alt="" className="w-7 h-7 rounded-md object-contain bg-zinc-800 border border-zinc-700 p-0.5 shrink-0" />
          )}

          <button
            onClick={() => { setOpen((o) => !o); if (editing) setEditing(false) }}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            {open ? <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />}
            <div className="min-w-0">
              <span className="font-semibold text-zinc-100 truncate block">{form.school}</span>
              {subtitle && <span className="text-xs text-zinc-500 truncate block">{subtitle}</span>}
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

        {/* Expanded edit form */}
        {open && editing && (
          <div className="border-t border-zinc-800 px-4 pb-4 pt-4">
            <div className="space-y-3 p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
              <p className="text-xs font-medium text-zinc-400">Edit education</p>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">School *</label>
                <input className={inputCls} value={form.school} onChange={(e) => set('school', e.target.value)} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">Degree</label>
                  <input className={inputCls} placeholder="e.g. Bachelor's degree" value={form.degree} onChange={(e) => set('degree', e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">Field of study</label>
                  <input className={inputCls} placeholder="e.g. Computer Science" value={form.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">Start date</label>
                  <input type="month" className={inputCls} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">End date <span className="text-zinc-600">(blank = Present)</span></label>
                  <input type="month" className={inputCls} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Grade</label>
                <input className={inputCls} placeholder="e.g. 78 or 3.8 GPA" value={form.grade} onChange={(e) => set('grade', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Activities & societies</label>
                <input className={inputCls} placeholder="e.g. Badminton, Cricket, Reading Books" value={form.activities} onChange={(e) => set('activities', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Description</label>
                <textarea
                  ref={descRef}
                  className={`${inputCls} resize-y`}
                  rows={3}
                  placeholder="Additional details about your studies…"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Skills <span className="text-zinc-600">(comma-separated)</span></label>
                <input className={inputCls} placeholder="e.g. Java, Python, DBMS" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
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

        {/* Expanded read-only view */}
        {open && !editing && (
          <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-1 text-sm text-zinc-400">
            {subtitle && <p className="text-zinc-300">{subtitle}</p>}
            {(form.startDate || form.endDate) && (
              <p className="text-xs text-zinc-500">
                {form.startDate || '?'} – {form.endDate || 'Present'}
              </p>
            )}
            {form.grade && <p>Grade: {form.grade}</p>}
            {form.activities && <p>Activities: {form.activities}</p>}
            {form.description && <p className="text-zinc-400">{form.description}</p>}
            {form.skills && <p className="text-xs text-indigo-400">{form.skills}</p>}
          </div>
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          message={`Delete "${form.school}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setConfirmOpen(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
