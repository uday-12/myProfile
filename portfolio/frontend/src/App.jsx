import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Login from './pages/admin/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import ProfileEditor from './pages/admin/ProfileEditor.jsx'
import ContentManager from './pages/admin/ContentManager.jsx'
import EducationManager from './pages/admin/EducationManager.jsx'
import SkillsManager from './pages/admin/SkillsManager.jsx'
import CertificationsManager from './pages/admin/CertificationsManager.jsx'
import ContactManager from './pages/admin/ContactManager.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin dashboard (protected, nested) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="education" element={<EducationManager />} />
            <Route path="skills" element={<SkillsManager />} />
            <Route path="certifications" element={<CertificationsManager />} />
            <Route path="contact" element={<ContactManager />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
