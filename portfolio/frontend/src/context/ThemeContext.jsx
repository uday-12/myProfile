import { createContext, useContext, useEffect, useState } from 'react'

export const THEMES = [
  { id: 'dark',   label: 'Dark',   bg: '#09090b', accent: '#6366f1' },
  { id: 'light',  label: 'Light',  bg: '#fafafa', accent: '#4f46e5' },
  { id: 'ocean',  label: 'Ocean',  bg: '#020617', accent: '#0ea5e9' },
  { id: 'sunset', label: 'Sunset', bg: '#09000f', accent: '#a855f7' },
]

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('portfolio-theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  // Apply on first mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
