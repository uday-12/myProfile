import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [admin, setAdmin] = useState(null)
  // loading = true only while we validate an existing token on mount
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (!stored) return
    api
      .get('/api/auth/me')
      .then((res) => setAdmin(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, []) // only on mount — subsequent changes are driven by login/logout

  const login = async (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    // interceptor already reads from localStorage, so this call is authenticated
    const res = await api.get('/api/auth/me')
    setAdmin(res.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setAdmin(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, admin, login, logout, loading, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
