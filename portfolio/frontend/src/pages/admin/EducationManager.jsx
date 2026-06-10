import { useState, useEffect } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { Plus, Loader2 } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import EducationRow from '../../components/admin/EducationRow.jsx'
import FileUpload from '../../components/admin/FileUpload.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

const toISO = (m) => (m ? `${m}-01T00:00:00.000Z` : null)

function AddEducationForm({ onCreated, onCancel }) {
  const addToast = useToast()
  const [form, setForm] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
    activities: '',
    description: '',
    skills: '',
    logoUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleCreate = async () => {
    if (!form.school.trim()) {
      addToast('School name is required.', 'error')
      return
    }
    setSaving(true)
    try {
      const skillsArr = form.skills.split(',').map((s) => s.trim()).filter(Boolean)
      const res = await api.post('/api/education', {
        ...form,
        skills: skillsArr,
        startDate: toISO(form.startDate),
        endDate: toISO(form.endDate),
        grade: form.grade || null,
        activities: form.activities || null,
        description: form.description || null,
        degree: form.degree || null,
        fieldOfStudy: form.fieldOfStudy || null,
        logoUrl: form.logoUrl || null,
      })
      onCreated(res.data)
      addToast('Education entry created.')
    } catch {
      addToast('Failed to create education entry.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
      <p className="text-sm font-medium text-indigo-400">New education entry</p>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">School *</label>
        <input className={inputCls} placeholder="Institution name" value={form.school} onChange={(e) => set('school', e.target.value)} />
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
        <textarea className={`${inputCls} resize-y`} rows={3} placeholder="Additional details…" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Skills <span className="text-zinc-600">(comma-separated)</span></label>
        <input className={inputCls} placeholder="e.g. Java, Python, DBMS" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">College logo</label>
        <FileUpload value={form.logoUrl} onChange={(v) => set('logoUrl', v)} />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleCreate} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Creating…' : 'Create entry'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancel</button>
      </div>
    </div>
  )
}

export default function EducationManager() {
  const addToast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    api.get('/api/education')
      .then((res) => setItems(res.data.sort((a, b) => a.order - b.order)))
      .catch(() => addToast('Failed to load education.', 'error'))
      .finally(() => setLoading(false))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const prev = items
    const next = arrayMove(items, items.findIndex((i) => i.id === active.id), items.findIndex((i) => i.id === over.id))
    setItems(next)
    try {
      await api.put('/api/education/reorder', { orderedIds: next.map((i) => i.id) })
    } catch {
      setItems(prev)
      addToast('Reorder failed.', 'error')
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Education</h1>
          <p className="text-zinc-500 text-sm mt-1">Drag rows to reorder. Click a row to expand.</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add education
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {adding && (
            <AddEducationForm
              onCreated={(item) => { setItems((prev) => [...prev, item]); setAdding(false) }}
              onCancel={() => setAdding(false)}
            />
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((item) => (
                  <EducationRow
                    key={item.id}
                    education={item}
                    onDelete={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {items.length === 0 && !adding && (
            <div className="border border-dashed border-zinc-800 rounded-2xl py-14 text-center">
              <p className="text-zinc-600 text-sm">No education entries yet.</p>
              <button onClick={() => setAdding(true)} className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                + Add your first entry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
