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
import CertificationRow from '../../components/admin/CertificationRow.jsx'
import FileUpload from '../../components/admin/FileUpload.jsx'

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
const toISO = (m) => (m ? `${m}-01T00:00:00.000Z` : null)

function AddCertForm({ onCreated, onCancel }) {
  const addToast = useToast()
  const [form, setForm] = useState({
    name: '', issuer: '', issueDate: '', expiryDate: '',
    credentialId: '', credentialUrl: '', logoUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleCreate = async () => {
    if (!form.name.trim() || !form.issuer.trim()) {
      addToast('Name and issuer are required.', 'error'); return
    }
    setSaving(true)
    try {
      const res = await api.post('/api/certifications', {
        ...form,
        issueDate:     toISO(form.issueDate),
        expiryDate:    toISO(form.expiryDate),
        credentialId:  form.credentialId  || null,
        credentialUrl: form.credentialUrl || null,
        logoUrl:       form.logoUrl       || null,
      })
      onCreated(res.data)
      addToast('Certification added.')
    } catch {
      addToast('Failed to add certification.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
      <p className="text-sm font-medium text-indigo-400">New certification</p>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Name *</label>
        <input className={inputCls} placeholder="e.g. AWS Solutions Architect" value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Issuing organisation *</label>
        <input className={inputCls} placeholder="e.g. Amazon Web Services" value={form.issuer} onChange={(e) => set('issuer', e.target.value)} />
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
        <button onClick={handleCreate} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Adding…' : 'Add certification'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancel</button>
      </div>
    </div>
  )
}

export default function CertificationsManager() {
  const addToast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    api.get('/api/certifications')
      .then((res) => setItems(res.data.sort((a, b) => a.order - b.order)))
      .catch(() => addToast('Failed to load certifications.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const prev = items
    const next = arrayMove(
      items,
      items.findIndex((i) => i.id === active.id),
      items.findIndex((i) => i.id === over.id),
    )
    setItems(next)
    try {
      await api.put('/api/certifications/reorder', { orderedIds: next.map((i) => i.id) })
    } catch {
      setItems(prev)
      addToast('Reorder failed.', 'error')
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Licenses & Certifications</h1>
          <p className="text-zinc-500 text-sm mt-1">Drag to reorder. Click a row to expand and edit.</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" /> Add certification
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-zinc-600 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {adding && (
            <AddCertForm
              onCreated={(item) => { setItems((prev) => [...prev, item]); setAdding(false) }}
              onCancel={() => setAdding(false)}
            />
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((item) => (
                  <CertificationRow
                    key={item.id}
                    cert={item}
                    onDelete={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {items.length === 0 && !adding && (
            <div className="border border-dashed border-zinc-800 rounded-2xl py-14 text-center">
              <p className="text-zinc-600 text-sm">No certifications yet.</p>
              <button onClick={() => setAdding(true)} className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                + Add your first certification
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
