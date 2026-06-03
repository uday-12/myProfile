import { useState, useRef } from 'react'
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

  const textareaRef = useRef(null)
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const wrapSelection = (syntax) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = form.description.slice(start, end)
    const wrapped = `${syntax}${selected || 'text'}${syntax}`
    const next = form.description.slice(0, start) + wrapped + form.description.slice(end)
    setField('description', next)
    // restore cursor inside the syntax markers
    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + syntax.length + (selected || 'text').length + syntax.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  const insertBullet = () => {
    const el = textareaRef.current
    if (!el) return
    const pos = el.selectionStart
    const val = form.description
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1
    const next = val.slice(0, lineStart) + '- ' + val.slice(lineStart)
    setField('description', next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(pos + 2, pos + 2)
    })
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      addToast('Title is required.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.put(`/api/sections/${initial.id}`, {
        ...form,
        imageUrl: form.imageUrl || null,
      })
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
              <label className="block text-xs font-medium text-zinc-500 mb-1">Title *</label>
              <input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Section title" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-500">Description</label>
                <div className="flex items-center gap-1">
                  {/* Formatting buttons */}
                  <button type="button" onClick={() => wrapSelection('**')}
                    className="px-1.5 py-0.5 text-xs font-bold text-zinc-400 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                    title="Bold — wrap with **text**">B</button>
                  <button type="button" onClick={() => wrapSelection('*')}
                    className="px-1.5 py-0.5 text-xs italic text-zinc-400 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                    title="Italic — wrap with *text*">I</button>
                  <button type="button" onClick={insertBullet}
                    className="px-1.5 py-0.5 text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                    title="Bullet point — adds '- ' at line start">•</button>
                  {/* Info tooltip */}
                  <div className="relative group ml-1">
                    <button type="button" className="w-4 h-4 rounded-full bg-zinc-700 text-zinc-400 text-[10px] flex items-center justify-center hover:bg-zinc-600 transition-colors">
                      i
                    </button>
                    <div className="absolute right-0 top-5 z-20 hidden group-hover:block w-56 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-400 shadow-xl">
                      <p className="font-semibold text-zinc-300 mb-1.5">Formatting syntax</p>
                      <p><code className="text-indigo-400">**text**</code> → <strong className="text-zinc-200">bold</strong></p>
                      <p className="mt-1"><code className="text-indigo-400">*text*</code> → <em>italic</em></p>
                      <p className="mt-1"><code className="text-indigo-400">- text</code> → <span className="text-zinc-200">• bullet point</span></p>
                      <p className="mt-2 text-zinc-600">Place cursor on a line and click • to add a bullet, or type "- " manually.</p>
                    </div>
                  </div>
                </div>
              </div>
              <textarea ref={textareaRef} className={`${inputCls} resize-y`} rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Section description (optional)…" />
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
