import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminImpersonationBar } from './components/AdminImpersonationBar'
import { SkipToMainContent } from './components/SkipToMainContent'
import { RequireAuth } from './components/RequireAuth'
import { ScrollToTopOnRoute } from './components/ScrollToTopOnRoute'
import { AuthProvider } from './contexts/AuthProvider'
import { HomeList } from './pages/HomeList'
import { AlmuerzoForm } from './pages/AlmuerzoForm'
import { AlmuerzoDetail } from './pages/AlmuerzoDetail'
import { LoginPage } from './pages/LoginPage'
import { SetPasswordPage } from './pages/SetPasswordPage'
import { OnboardingScreen1, OnboardingScreen2 } from './pages/OnboardingPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import './styles/entry.css'

/**
 * Raíz de la app: rutas públicas (onboarding, login) y rutas protegidas (CRUD almuerzos).
 *
 * Flujo de primera visita:
 *   /onboarding/1 → /onboarding/2 → /login → (email + contraseña) → /
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTopOnRoute />
        <AdminImpersonationBar />
        <div className="app-shell">
          <SkipToMainContent />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/onboarding/1" element={<OnboardingScreen1 />} />
            <Route path="/onboarding/2" element={<OnboardingScreen2 />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            {/* Rutas protegidas */}
            <Route element={<RequireAuth />}>
<Route path="/" element={<HomeList />} />
              <Route path="/nuevo" element={<AlmuerzoForm mode="create" />} />
              <Route path="/almuerzo/:id" element={<AlmuerzoDetail />} />
              <Route path="/almuerzo/:id/editar" element={<AlmuerzoForm mode="edit" />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
