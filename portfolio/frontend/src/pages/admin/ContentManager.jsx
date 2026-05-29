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
import CompanyRow from '../../components/admin/CompanyRow.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

function AddCompanyForm({ onCreated, onCancel }) {
  const addToast = useToast()
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleCreate = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      addToast('Name and description are required.', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await api.post('/api/companies', form)
      onCreated({ ...res.data, projects: [] })
      addToast('Company created.')
    } catch {
      addToast('Failed to create company.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
      <p className="text-sm font-medium text-indigo-400">New company</p>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Name *</label>
        <input className={inputCls} placeholder="Company name" value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Description *</label>
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="What did you do here?" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleCreate} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Creating…' : 'Create company'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancel</button>
      </div>
    </div>
  )
}

export default function ContentManager() {
  const addToast = useToast()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingCompany, setAddingCompany] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    api.get('/api/companies')
      .then((res) => setCompanies(res.data.sort((a, b) => a.order - b.order)))
      .catch(() => addToast('Failed to load companies.', 'error'))
      .finally(() => setLoading(false))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompanyDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const prev = companies
    const next = arrayMove(companies, companies.findIndex((c) => c.id === active.id), companies.findIndex((c) => c.id === over.id))
    setCompanies(next)
    try {
      await api.put('/api/companies/reorder', { orderedIds: next.map((c) => c.id) })
    } catch {
      setCompanies(prev)
      addToast('Reorder failed.', 'error')
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Companies & Projects</h1>
          <p className="text-zinc-500 text-sm mt-1">Drag rows to reorder. Click a row to expand.</p>
        </div>
        {!addingCompany && (
          <button
            onClick={() => setAddingCompany(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add company
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {addingCompany && (
            <AddCompanyForm
              onCreated={(c) => { setCompanies((prev) => [...prev, c]); setAddingCompany(false) }}
              onCancel={() => setAddingCompany(false)}
            />
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCompanyDragEnd}>
            <SortableContext items={companies.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {companies.map((c) => (
                  <CompanyRow
                    key={c.id}
                    company={c}
                    onDelete={(id) => setCompanies((prev) => prev.filter((x) => x.id !== id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {companies.length === 0 && !addingCompany && (
            <div className="border border-dashed border-zinc-800 rounded-2xl py-14 text-center">
              <p className="text-zinc-600 text-sm">No companies yet.</p>
              <button onClick={() => setAddingCompany(true)} className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                + Add your first company
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
