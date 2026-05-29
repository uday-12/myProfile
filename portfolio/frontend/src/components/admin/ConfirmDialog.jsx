import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ message, onConfirm, onClose, loading = false, confirmLabel = 'Delete' }) {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-zinc-200 text-sm leading-relaxed pt-1">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors"
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
