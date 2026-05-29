import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import FileUpload from './FileUpload.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

export default function SectionRow({ section: initial, onDelete }) {
  const addToast = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: initial.title, description: initial.description, imageUrl: initial.imageUrl ?? '' })
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: initial.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      addToast('Title and description are required.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.put(`/api/sections/${initial.id}`, form)
      addToast('Section saved.')
      setOpen(false)
    } catch {
      addToast('Failed to save section.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/sections/${initial.id}`)
      onDelete(initial.id)
      addToast('Section deleted.')
    } catch {
      addToast('Failed to delete section.', 'error')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`rounded-lg border transition-colors ${open ? 'bg-zinc-800/70 border-zinc-700' : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700'}`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button {...attributes} {...listeners} className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none shrink-0">
            <GripVertical className="w-4 h-4" />
          </button>
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
            {open ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
            <span className="text-sm text-zinc-300 truncate">{form.title || <span className="text-zinc-600 italic">Untitled section</span>}</span>
          </button>
          <button onClick={() => setConfirmOpen(true)} className="shrink-0 p-1 text-zinc-600 hover:text-red-400 transition-colors rounded">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expanded form */}
        {open && (
          <div className="px-3 pb-3 space-y-3 border-t border-zinc-700/50 pt-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Title</label>
              <input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Section title" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
              <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Section description…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Image</label>
              <FileUpload value={form.imageUrl} onChange={(v) => setField('imageUrl', v)} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          message={`Delete section "${form.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setConfirmOpen(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
