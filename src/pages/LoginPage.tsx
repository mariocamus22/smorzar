import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { formatSupabaseError } from '../lib/errors'
import { autoLoginSharedPassword, isAutoLoginEmail } from '../lib/autoLogin'
import { hasSupabaseConfig } from '../lib/env'
import { supabase } from '../lib/supabaseClient'
import { MAIN_CONTENT_ID } from '../components/SkipToMainContent'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const { session, loading, initError } = useAuth()
  const [mode, setMode] = useState<Mode>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!hasSupabaseConfig()) {
    return (
      <main id={MAIN_CONTENT_ID} className="page">
        <p className="banner banner-warn">Falta el archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.</p>
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

  function switchMode(m: Mode) {
    setMode(m)
    setErr(null)
    setPassword('')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    const emailTrimmed = email.trim().toLowerCase()
    if (!emailTrimmed) { setErr('Escribe tu correo electrónico.'); return }
    if (!password) { setErr('Escribe tu contraseña.'); return }
    if (mode === 'signup' && !name.trim()) { setErr('Escribe tu nombre.'); return }
    if (mode === 'signup' && password.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres.'); return }

    setSubmitting(true)
    try {
      // Auto-login para dev: usa contraseña compartida configurada en .env
      const shared = autoLoginSharedPassword()
      if (isAutoLoginEmail(emailTrimmed) && shared != null) {
        const { error } = await supabase.auth.signInWithPassword({ email: emailTrimmed, password: shared })
        if (error) setErr(formatSupabaseError(error))
        return
      }

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: emailTrimmed, password })
        if (error) {
          const msg = error.message?.toLowerCase() ?? ''
          if (msg.includes('invalid login credentials') || msg.includes('invalid credentials') || msg.includes('email not confirmed')) {
            setErr('Correo o contraseña incorrectos.')
          } else {
            setErr(formatSupabaseError(error))
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: emailTrimmed,
          password,
          options: { data: { full_name: name.trim() } },
        })
        if (error) {
          const msg = error.message?.toLowerCase() ?? ''
          if (msg.includes('already registered') || msg.includes('user already registered')) {
            setErr('Ya existe una cuenta con ese correo.')
            switchMode('login')
          } else {
            setErr(formatSupabaseError(error))
          }
          return
        }
        // Si no hay sesión, Supabase requiere confirmar email — indicárselo al usuario
        if (!data.session) {
          setErr('Revisa tu correo y confirma tu cuenta para poder entrar.')
        }
        // Si hay sesión, AuthProvider la detecta y Navigate redirige al home
      }
    } catch (e) {
      setErr(formatSupabaseError(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id={MAIN_CONTENT_ID} className="login-page">
      <div className="login-hero">
        <h1 className="login-title">
          {mode === 'login' ? 'Accede a Smorzar' : 'Crea tu cuenta'}
        </h1>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Entra con tu correo y contraseña.'
            : 'Regístrate para empezar a registrar tus almuerzos.'}
        </p>
      </div>

      <form className="login-form" onSubmit={onSubmit} noValidate>
        {err && <p className="banner banner-error" role="alert">{err}</p>}

        {mode === 'signup' && (
          <label className="field">
            <span>Tu nombre</span>
            <input
              type="text"
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="José Luis"
            />
          </label>
        )}

        <label className="field">
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="joseluis@gmail.com"
            required
          />
        </label>

        <label className="field">
          <span>Contraseña</span>
          <div className="login-password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </label>

        <button type="submit" className="btn btn-primary login-cta" disabled={submitting}>
          {submitting
            ? (mode === 'login' ? 'Entrando…' : 'Creando cuenta…')
            : (mode === 'login' ? 'Entrar' : 'Crear cuenta')}
        </button>

        <p className="login-mode-switch">
          {mode === 'login' ? (
            <>¿No tienes cuenta?{' '}
              <button type="button" className="login-mode-btn" onClick={() => switchMode('signup')}>
                Regístrate
              </button>
            </>
          ) : (
            <>¿Ya tienes cuenta?{' '}
              <button type="button" className="login-mode-btn" onClick={() => switchMode('login')}>
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </form>
    </main>
  )
}
