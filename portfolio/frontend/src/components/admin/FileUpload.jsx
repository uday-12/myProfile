import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import api from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function FileUpload({ value, onChange, accept = 'image/*', label = 'Upload image' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const addToast = useToast()

  const handleSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/api/upload', fd)
      onChange(res.data.url)
    } catch {
      addToast('Upload failed — check Cloudinary config.', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="preview"
            className="h-20 rounded-lg object-cover border border-zinc-700 bg-zinc-800"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 text-zinc-300 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
      >
        {uploading
          ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
          : <><Upload className="w-3 h-3" /> {value ? 'Change' : label}</>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleSelect}
      />
    </div>
  )
}
