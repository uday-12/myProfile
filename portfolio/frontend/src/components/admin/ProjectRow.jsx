import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { GripVertical, ChevronDown, ChevronRight, Pencil, Trash2, Plus, Loader2, X, Check } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import FileUpload from './FileUpload.jsx'
import SectionRow from './SectionRow.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

function AddSectionForm({ projectId, onCreated, onCancel }) {
  const addToast = useToast()
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      addToast('Title and description are required.', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await api.post(`/api/projects/${projectId}/sections`, form)
      onCreated(res.data)
      addToast('Section added.')
    } catch {
      addToast('Failed to add section.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-2.5">
      <p className="text-xs font-medium text-indigo-400">New section</p>
      <input className={inputCls} placeholder="Title *" value={form.title} onChange={(e) => set('title', e.target.value)} />
      <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Description *" value={form.description} onChange={(e) => set('description', e.target.value)} />
      <FileUpload value={form.imageUrl} onChange={(v) => set('imageUrl', v)} label="Upload image (optional)" />
      <div className="flex gap-2 pt-1">
        <button onClick={handleCreate} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          {saving ? 'Adding…' : 'Add section'}
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancel</button>
      </div>
    </div>
  )
}

export default function ProjectRow({ project: initial, companyId, onDelete }) {
  const addToast = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: initial.title, description: initial.description, videoUrl: initial.videoUrl ?? '' })
  const [sections, setSections] = useState(() => [...(initial.sections ?? [])].sort((a, b) => a.order - b.order))
  const [saving, setSaving] = useState(false)
  const [addingSection, setAddingSection] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: initial.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      addToast('Title and description are required.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.put(`/api/projects/${initial.id}`, form)
      addToast('Project updated.')
      setEditing(false)
    } catch {
      addToast('Failed to update project.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/projects/${initial.id}`)
      onDelete(initial.id)
      addToast('Project deleted.')
    } catch {
      addToast('Failed to delete project.', 'error')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const handleSectionDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const prev = sections
    const next = arrayMove(sections, sections.findIndex((s) => s.id === active.id), sections.findIndex((s) => s.id === over.id))
    setSections(next)
    try {
      await api.put(`/api/projects/${initial.id}/sections/reorder`, { orderedIds: next.map((s) => s.id) })
    } catch {
      setSections(prev)
      addToast('Reorder failed.', 'error')
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`rounded-xl border transition-colors ${open ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-800/20 border-zinc-800 hover:border-zinc-700/80'}`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3">
          <button {...attributes} {...listeners} className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none shrink-0">
            <GripVertical className="w-4 h-4" />
          </button>
          <button onClick={() => { setOpen((o) => !o); if (editing) setEditing(false) }} className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
            {open ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
            <span className="text-sm font-medium text-zinc-200 truncate">{form.title}</span>
            <span className="ml-auto shrink-0 text-xs text-zinc-600 pr-2">{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setOpen(true); setEditing((v) => !v) }} className="shrink-0 p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors rounded">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setConfirmOpen(true)} className="shrink-0 p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {open && (
          <div className="border-t border-zinc-700/50 px-3 pb-3 pt-3 space-y-4">
            {/* Edit form */}
            {editing && (
              <div className="space-y-2.5 p-3 bg-zinc-900/60 rounded-lg border border-zinc-700/50">
                <p className="text-xs font-medium text-zinc-400 mb-2">Edit project</p>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Title *</label>
                  <input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Description *</label>
                  <textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Video URL</label>
                  <input className={inputCls} value={form.videoUrl} onChange={(e) => setField('videoUrl', e.target.value)} placeholder="YouTube / Vimeo / direct URL" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
                    {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 rounded-lg transition-colors">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-500">Sections</span>
                {!addingSection && (
                  <button onClick={() => setAddingSection(true)} className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Plus className="w-3 h-3" /> Add section
                  </button>
                )}
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {sections.map((s) => (
                      <SectionRow
                        key={s.id}
                        section={s}
                        onDelete={(id) => setSections((prev) => prev.filter((x) => x.id !== id))}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {sections.length === 0 && !addingSection && (
                <p className="text-xs text-zinc-700 py-2">No sections yet.</p>
              )}

              {addingSection && (
                <div className="mt-2">
                  <AddSectionForm
                    projectId={initial.id}
                    onCreated={(s) => { setSections((prev) => [...prev, s]); setAddingSection(false) }}
                    onCancel={() => setAddingSection(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          message={`Delete project "${form.title}" and all its sections? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setConfirmOpen(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
