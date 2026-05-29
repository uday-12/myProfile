import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
