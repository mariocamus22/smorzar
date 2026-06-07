import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { installDone, onboardingDone } from '../lib/onboardingFlags'
import { MAIN_CONTENT_ID } from './SkipToMainContent'

/**
 * Guarda de rutas autenticadas. Gestiona también las redirecciones del flujo
 * de incorporación (onboarding → login → instalar → app).
 */
export function RequireAuth() {
  const { session, loading, initError } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main id={MAIN_CONTENT_ID} className="page">
        <div className="loading-block" role="status" aria-busy="true">
          <span className="spinner" aria-hidden />
          <span className="muted">Cargando sesión…</span>
        </div>
      </main>
    )
  }

  if (initError && !session) {
    return (
      <main id={MAIN_CONTENT_ID} className="page">
        <p className="banner banner-error" role="alert">
          {initError}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </main>
    )
  }

  if (!session) {
    // Sin sesión: si no ha visto el onboarding, mostrarlo antes del login
    return onboardingDone()
      ? <Navigate to="/login" replace />
      : <Navigate to="/onboarding/1" replace />
  }

  // Con sesión: mostrar pantalla de instalación la primera vez (excepto si ya estamos en ella)
  if (!installDone() && location.pathname !== '/instalar') {
    return <Navigate to="/instalar" replace />
  }

  return <Outlet />
}
