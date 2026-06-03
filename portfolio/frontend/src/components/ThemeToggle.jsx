import { useState } from 'react'
import { useTheme, THEMES } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {/* Theme swatches panel */}
      {open && (
        <div className="flex flex-col gap-1.5 p-2 rounded-2xl shadow-2xl border"
          style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border-2)' }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 w-full"
              style={{
                background: theme === t.id ? 'var(--c-accent-bg)' : 'transparent',
                color: 'var(--c-text)',
              }}
            >
              <span className="w-5 h-5 rounded-full shrink-0 border border-white/10 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)` }} />
              <span className="text-xs font-medium">{t.label}</span>
              {theme === t.id && (
                <svg className="w-3 h-3 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: 'var(--c-accent-2)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Toggle button with spinning ring */}
      <div className="relative w-10 h-10">
        {/* Spinning conic gradient ring */}
        <div
          className="absolute -inset-[3px] rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 30%, var(--c-accent) 55%, var(--c-accent-2) 70%, transparent 100%)`,
            animation: 'spin 3s linear infinite',
          }}
        />
        {/* Outer glow pulse */}
        <div
          className="absolute -inset-[3px] rounded-full opacity-40"
          style={{
            background: `conic-gradient(from 0deg, transparent 30%, var(--c-accent) 55%, var(--c-accent-2) 70%, transparent 100%)`,
            animation: 'spin 3s linear infinite, pulse 2s ease-in-out infinite',
            filter: 'blur(4px)',
          }}
        />
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative z-10 w-10 h-10 rounded-full shadow-xl flex items-center justify-center transition-all duration-150 hover:scale-110"
          style={{ background: 'var(--c-surface)', color: 'var(--c-text-2)' }}
          title="Change theme"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
