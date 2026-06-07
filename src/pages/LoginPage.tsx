import { type FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { formatSupabaseError } from '../lib/errors'
import { autoLoginSharedPassword, isAutoLoginEmail } from '../lib/autoLogin'
import { hasSupabaseConfig, passwordLoginEnabled } from '../lib/env'
import { supabase } from '../lib/supabaseClient'
import { MAIN_CONTENT_ID } from '../components/SkipToMainContent'

export function LoginPage() {
  const { session, loading, initError } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const allowPassword = passwordLoginEnabled()
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!hasSupabaseConfig()) {
    return (
      <main id={MAIN_CONTENT_ID} className="page">
        <p className="banner banner-warn">Falta el archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.</p>
        <Link to="/">Volver</Link>
      </main>
    )
  }

  if (loading) {
    return (
      <main id={MAIN_CONTENT_ID} className="page">
        <p className="muted">Cargando…</p>
      </main>
    )
  }

  if (initError && !session) {
    return (
      <main id={MAIN_CONTENT_ID} className="page">
        <p className="banner banner-error" role="alert">{initError}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </main>
    )
  }

  if (session) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    const trimmed = email.trim()
    if (!trimmed) { setErr('Escribe tu correo electrónico.'); return }

    setSubmitting(true)
    try {
      const emailNorm = trimmed.toLowerCase()
      const shared = autoLoginSharedPassword()
      const useAutoLogin = isAutoLoginEmail(trimmed) && shared != null

      if (isAutoLoginEmail(trimmed) && !shared) {
        setErr('Este correo usa acceso directo: añade VITE_AUTO_LOGIN_SHARED_PASSWORD al .env.')
        return
      }

      const res = useAutoLogin
        ? await supabase.auth.signInWithPassword({ email: emailNorm, password: shared })
        : allowPassword && password.trim()
          ? await supabase.auth.signInWithPassword({ email: trimmed, password: password.trim() })
          : await supabase.auth.signInWithOtp({ email: trimmed, options: { emailRedirectTo: `${window.location.origin}/` } })

      if (res.error) {
        setErr(formatSupabaseError(res.error) || 'Algo ha ido mal. Inténtalo de nuevo.')
        return
      }
      if (useAutoLogin || (allowPassword && password.trim())) return
      setSent(true)
    } catch (e) {
      setErr(formatSupabaseError(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <main id={MAIN_CONTENT_ID} className="login-page">
        <div className="login-sent" role="status">
          <div className="login-sent-icon" aria-hidden>📬</div>
          <h2 className="login-sent-title">Revisa tu correo</h2>
          <p className="login-sent-desc">
            Hemos enviado un enlace de acceso a <strong>{email}</strong>.<br />
            Pulsa sobre él y entrarás directamente, sin contraseña.
          </p>
          <p className="login-sent-hint">¿No lo ves? Mira también en la carpeta de spam.</p>
        </div>
      </main>
    )
  }

  return (
    <main id={MAIN_CONTENT_ID} className="login-page">
      <div className="login-hero">
        <h1 className="login-title">Accede a Esmorzapp</h1>
        <p className="login-subtitle">
          Escribe tu nombre y correo. Te enviaremos un enlace directo al email —
          sin contraseñas, sin pasos extra. Solo pulsa el enlace y ya estás dentro.
        </p>
      </div>

      <form className="login-form" onSubmit={onSubmit} noValidate>
        {err && <p className="banner banner-error" role="alert">{err}</p>}

        <label className="field">
          <span>Tu nombre</span>
          <input
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="¿Cómo te llaman?"
          />
        </label>

        <label className="field">
          <span>Tu correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
          />
        </label>

        {/* Campo contraseña solo visible en entornos QA */}
        {allowPassword && !(isAutoLoginEmail(email) && autoLoginSharedPassword()) && (
          <label className="field">
            <span>Contraseña (solo QA)</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vacío = enlace por correo"
            />
          </label>
        )}

        <button type="submit" className="btn btn-primary login-cta" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Recibir enlace de acceso'}
        </button>

        <p className="login-disclaimer">
          Si no tienes cuenta, la crearemos automáticamente con tu correo.
        </p>
      </form>
    </main>
  )
}
