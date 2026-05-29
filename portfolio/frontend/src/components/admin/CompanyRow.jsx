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
import { GripVertical, ChevronDown, ChevronRight, Pencil, Trash2, Plus, Loader2, X } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import FileUpload from './FileUpload.jsx'
import ProjectRow from './ProjectRow.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

function AddProjectForm({ companyId, onCreated, onCancel }) {
  const addToast = useToast()
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      addToast('Title and description are required.', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await api.post('/api/projects', { ...form, companyId })
      onCreated({ ...res.data, sections: [] })
      addToast('Project created.')
    } catch {
      addToast('Failed to create project.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-2.5">
      <p className="text-xs font-medium text-indigo-400">New project</p>
      <input className={inputCls} placeholder="Title *" value={form.title} onChange={(e) => set('title', e.target.value)} />
      <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Description *" value={form.description} onChange={(e) => set('description', e.target.value)} />
      <input className={inputCls} placeholder="Video URL (optional)" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
      <div className="flex gap-2 pt-1">
        <button onClick={handleCreate} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          {saving ? 'Creating…' : 'Create project'}
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancel</button>
      </div>
    </div>
  )
}

export default function CompanyRow({ company: initial, onDelete }) {
  const addToast = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: initial.name, description: initial.description, logoUrl: initial.logoUrl ?? '' })
  const [projects, setProjects] = useState(() => [...(initial.projects ?? [])].sort((a, b) => a.order - b.order))
  const [saving, setSaving] = useState(false)
  const [addingProject, setAddingProject] = useState(false)
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
    if (!form.name.trim() || !form.description.trim()) {
      addToast('Name and description are required.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.put(`/api/companies/${initial.id}`, form)
      addToast('Company updated.')
      setEditing(false)
    } catch {
      addToast('Failed to update company.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/companies/${initial.id}`)
      onDelete(initial.id)
      addToast('Company deleted.')
    } catch {
      addToast('Failed to delete company.', 'error')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const handleProjectDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const prev = projects
    const next = arrayMove(projects, projects.findIndex((p) => p.id === active.id), projects.findIndex((p) => p.id === over.id))
    setProjects(next)
    try {
      await api.put(`/api/companies/${initial.id}/projects/reorder`, { orderedIds: next.map((p) => p.id) })
    } catch {
      setProjects(prev)
      addToast('Reorder failed.', 'error')
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

          <button onClick={() => { setOpen((o) => !o); if (editing) setEditing(false) }} className="flex items-center gap-2 flex-1 min-w-0 text-left">
            {open ? <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />}
            <span className="font-semibold text-zinc-100 truncate">{form.name}</span>
            <span className="ml-auto shrink-0 text-xs text-zinc-600 pr-2">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          </button>

          <button onClick={(e) => { e.stopPropagation(); setOpen(true); setEditing((v) => !v) }} className="shrink-0 p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors rounded-lg">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirmOpen(true)} className="shrink-0 p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {open && (
          <div className="border-t border-zinc-800 px-4 pb-4 pt-4 space-y-4">
            {/* Edit form */}
            {editing && (
              <div className="space-y-3 p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                <p className="text-xs font-medium text-zinc-400">Edit company</p>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                  <input className={inputCls} value={form.name} onChange={(e) => setField('name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Description *</label>
                  <textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Logo</label>
                  <FileUpload value={form.logoUrl} onChange={(v) => setField('logoUrl', v)} />
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
            )}

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Projects</span>
                {!addingProject && (
                  <button onClick={() => setAddingProject(true)} className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add project
                  </button>
                )}
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {projects.map((p) => (
                      <ProjectRow
                        key={p.id}
                        project={p}
                        companyId={initial.id}
                        onDelete={(id) => setProjects((prev) => prev.filter((x) => x.id !== id))}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {projects.length === 0 && !addingProject && (
                <p className="text-xs text-zinc-700 py-2">No projects yet.</p>
              )}

              {addingProject && (
                <div className="mt-2">
                  <AddProjectForm
                    companyId={initial.id}
                    onCreated={(p) => { setProjects((prev) => [...prev, p]); setAddingProject(false) }}
                    onCancel={() => setAddingProject(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          message={`Delete "${form.name}" and all its projects and sections? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setConfirmOpen(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
