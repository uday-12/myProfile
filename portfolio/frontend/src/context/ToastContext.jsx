import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  return (
    <Ctx.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm pointer-events-auto border ${
              type === 'success'
                ? 'bg-zinc-900 border-emerald-500/30 text-emerald-300'
                : 'bg-zinc-900 border-red-500/30 text-red-300'
            }`}
          >
            {type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="text-zinc-200">{message}</span>
            <button
              onClick={() => dismiss(id)}
              className="ml-1 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
