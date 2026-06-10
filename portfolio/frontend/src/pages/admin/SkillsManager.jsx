import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Loader2, Pencil, Check, X } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'

const inputCls = 'bg-zinc-800/60 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'

// ── Inline editable label ─────────────────────────────────────────────────────
function EditableLabel({ value, onSave, className }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  const start = () => { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 0) }
  const cancel = () => setEditing(false)
  const save = () => { if (draft.trim() && draft.trim() !== value) onSave(draft.trim()); setEditing(false) }
  const onKey = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }

  if (editing) {
    return (
      <span className="flex items-center gap-1">
        <input
          ref={inputRef}
          className={`${inputCls} py-1 px-2 text-xs w-32`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
        />
        <button onClick={save} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={cancel} className="p-0.5 text-zinc-500 hover:text-zinc-300"><X className="w-3.5 h-3.5" /></button>
      </span>
    )
  }
  return (
    <span className={`${className} flex items-center gap-1.5 group`}>
      {value}
      <button onClick={start} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil className="w-3 h-3" />
      </button>
    </span>
  )
}

// ── Skill row ─────────────────────────────────────────────────────────────────
function SkillRow({ skill, onUpdate, onDelete }) {
  const addToast = useToast()
  const [proficiency, setProficiency] = useState(skill.proficiency)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const debounceRef = useRef(null)

  const handleSlider = (val) => {
    setProficiency(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        const res = await api.put(`/api/skills/${skill.id}`, { name: skill.name, proficiency: val })
        onUpdate(res.data)
      } catch {
        addToast('Failed to update skill.', 'error')
      } finally {
        setSaving(false)
      }
    }, 400)
  }

  const handleRename = async (name) => {
    try {
      const res = await api.put(`/api/skills/${skill.id}`, { name, proficiency })
      onUpdate(res.data)
    } catch {
      addToast('Failed to rename skill.', 'error')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/skills/${skill.id}`)
      onDelete(skill.id)
    } catch {
      addToast('Failed to delete skill.', 'error')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const color = proficiency >= 80 ? '#6366f1' : proficiency >= 60 ? '#8b5cf6' : proficiency >= 40 ? '#a78bfa' : '#c4b5fd'

  return (
    <div className="group flex items-center gap-3 py-2.5">
      {/* Name */}
      <EditableLabel
        value={skill.name}
        onSave={handleRename}
        className="w-36 shrink-0 text-sm text-zinc-200"
      />

      {/* Bar + slider stacked */}
      <div className="flex-1 relative">
        {/* Background track */}
        <div className="h-2 rounded-full w-full" style={{ background: 'var(--c-surface-2, #27272a)' }} />
        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-2 rounded-full transition-all duration-300"
          style={{ width: `${proficiency}%`, background: color }}
        />
        {/* Range input overlaid */}
        <input
          type="range"
          min={0}
          max={100}
          value={proficiency}
          onChange={(e) => handleSlider(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
      </div>

      {/* Percentage */}
      <span className="w-9 shrink-0 text-right text-xs font-mono text-zinc-400 flex items-center gap-1">
        {proficiency}%
        {saving && <Loader2 className="w-2.5 h-2.5 animate-spin text-zinc-600" />}
      </span>

      {/* Delete */}
      <button
        onClick={() => setConfirmOpen(true)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-600 hover:text-red-400"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {confirmOpen && (
        <ConfirmDialog
          message={`Delete skill "${skill.name}"?`}
          onConfirm={handleDelete}
          onClose={() => setConfirmOpen(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}

// ── Add skill form ────────────────────────────────────────────────────────────
function AddSkillForm({ categoryId, onCreated, onCancel }) {
  const addToast = useToast()
  const [name, setName] = useState('')
  const [proficiency, setProficiency] = useState(50)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleCreate = async () => {
    if (!name.trim()) { addToast('Skill name is required.', 'error'); return }
    setSaving(true)
    try {
      const res = await api.post('/api/skills', { name: name.trim(), proficiency, categoryId })
      onCreated(res.data)
    } catch {
      addToast('Failed to add skill.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const color = proficiency >= 80 ? '#6366f1' : proficiency >= 60 ? '#8b5cf6' : proficiency >= 40 ? '#a78bfa' : '#c4b5fd'

  return (
    <div className="flex items-center gap-3 py-2.5 border-t border-zinc-800 mt-1">
      <input
        ref={inputRef}
        className={`${inputCls} w-36 shrink-0 py-1.5`}
        placeholder="Skill name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onCancel() }}
      />
      <div className="flex-1 relative">
        <div className="h-2 rounded-full w-full" style={{ background: 'var(--c-surface-2, #27272a)' }} />
        <div className="absolute top-0 left-0 h-2 rounded-full transition-all duration-300" style={{ width: `${proficiency}%`, background: color }} />
        <input
          type="range" min={0} max={100} value={proficiency}
          onChange={(e) => setProficiency(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-mono text-zinc-400">{proficiency}%</span>
      <div className="shrink-0 flex items-center gap-1">
        <button onClick={handleCreate} disabled={saving} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Add
        </button>
        <button onClick={onCancel} className="p-1.5 text-zinc-600 hover:text-zinc-300"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )
}

// ── Category panel ────────────────────────────────────────────────────────────
function CategoryPanel({ category, onRename, onDelete, onSkillsChange }) {
  const addToast = useToast()
  const [skills, setSkills] = useState(() => [...category.skills].sort((a, b) => a.order - b.order))
  const [adding, setAdding] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/skills/categories/${category.id}`)
      onDelete(category.id)
    } catch {
      addToast('Failed to delete category.', 'error')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const updateSkill = (updated) => {
    const next = skills.map((s) => s.id === updated.id ? updated : s)
    setSkills(next)
    onSkillsChange(category.id, next)
  }

  const removeSkill = (id) => {
    const next = skills.filter((s) => s.id !== id)
    setSkills(next)
    onSkillsChange(category.id, next)
  }

  const addSkill = (skill) => {
    const next = [...skills, skill]
    setSkills(next)
    setAdding(false)
    onSkillsChange(category.id, next)
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      {/* Category header */}
      <div className="flex items-center justify-between mb-4">
        <EditableLabel
          value={category.name}
          onSave={async (name) => {
            try {
              await api.put(`/api/skills/categories/${category.id}`, { name })
              onRename(category.id, name)
            } catch {
              addToast('Failed to rename category.', 'error')
            }
          }}
          className="text-sm font-semibold text-zinc-100"
        />
        <div className="flex items-center gap-1">
          {!adding && (
            <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-500/10">
              <Plus className="w-3.5 h-3.5" /> Add skill
            </button>
          )}
          <button onClick={() => setConfirmOpen(true)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded-lg">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800 mb-3" />

      {/* Skills */}
      <div className="divide-y divide-zinc-800/60">
        {skills.length === 0 && !adding && (
          <p className="text-xs text-zinc-600 py-2">No skills yet. Click "Add skill" to start.</p>
        )}
        {skills.map((skill) => (
          <SkillRow key={skill.id} skill={skill} onUpdate={updateSkill} onDelete={removeSkill} />
        ))}
        {adding && (
          <AddSkillForm categoryId={category.id} onCreated={addSkill} onCancel={() => setAdding(false)} />
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          message={`Delete category "${category.name}" and all its skills?`}
          onConfirm={handleDelete}
          onClose={() => setConfirmOpen(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SkillsManager() {
  const addToast = useToast()
  const [categories, setCategories] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [savingCat, setSavingCat] = useState(false)
  const newCatRef = useRef(null)

  useEffect(() => {
    api.get('/api/skills/categories')
      .then((res) => {
        const sorted = res.data.sort((a, b) => a.order - b.order)
        setCategories(sorted)
        if (sorted.length > 0) setActiveId(sorted[0].id)
      })
      .catch(() => addToast('Failed to load skills.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (addingCategory) setTimeout(() => newCatRef.current?.focus(), 0)
  }, [addingCategory])

  const handleAddCategory = async () => {
    if (!newCatName.trim()) { addToast('Category name is required.', 'error'); return }
    setSavingCat(true)
    try {
      const res = await api.post('/api/skills/categories', { name: newCatName.trim() })
      setCategories((prev) => [...prev, res.data])
      setActiveId(res.data.id)
      setNewCatName('')
      setAddingCategory(false)
    } catch {
      addToast('Failed to create category.', 'error')
    } finally {
      setSavingCat(false)
    }
  }

  const active = categories.find((c) => c.id === activeId)

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Overall Skills</h1>
          <p className="text-zinc-500 text-sm mt-1">Organise skills by category. Drag the slider to rate each skill.</p>
        </div>
        {!addingCategory && (
          <button
            onClick={() => setAddingCategory(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" /> Add category
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-zinc-600 animate-spin" /></div>
      ) : (
        <>
          {/* Tab bar */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveId(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeId === cat.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'
                }`}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-60">
                  {cat.skills?.length ?? 0}
                </span>
              </button>
            ))}

            {/* Inline new-category input */}
            {addingCategory && (
              <span className="flex items-center gap-1">
                <input
                  ref={newCatRef}
                  className={`${inputCls} py-1.5 px-3 text-sm w-36`}
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') { setAddingCategory(false); setNewCatName('') } }}
                />
                <button onClick={handleAddCategory} disabled={savingCat} className="p-1.5 text-emerald-400 hover:text-emerald-300 disabled:opacity-60">
                  {savingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => { setAddingCategory(false); setNewCatName('') }} className="p-1.5 text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>

          {/* Active category panel */}
          {categories.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl py-14 text-center">
              <p className="text-zinc-600 text-sm">No skill categories yet.</p>
              <button onClick={() => setAddingCategory(true)} className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                + Add your first category
              </button>
            </div>
          ) : active ? (
            <CategoryPanel
              key={active.id}
              category={active}
              onRename={(id, name) =>
                setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name } : c))
              }
              onDelete={(id) => {
                const next = categories.filter((c) => c.id !== id)
                setCategories(next)
                setActiveId(next[0]?.id ?? null)
              }}
              onSkillsChange={(id, skills) =>
                setCategories((prev) => prev.map((c) => c.id === id ? { ...c, skills } : c))
              }
            />
          ) : null}
        </>
      )}
    </div>
  )
}
