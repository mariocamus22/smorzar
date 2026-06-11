import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

/**
 * Detecta si estamos en un in-app browser (Gmail, WhatsApp, Instagram…).
 * Estos navegadores embebidos no comparten sesión con Chrome, lo que rompe el PKCE.
 */
function isInAppBrowser(): boolean {
  const ua = navigator.userAgent
  return (
    // Gmail / Google in-app
    /\bGSA\b/.test(ua) ||
    // Facebook / Instagram / WhatsApp WebView
    /\bFBAN\b|\bFBAV\b|\bFBIOS\b|\bInstagram\b|\bWhatsApp\b/.test(ua) ||
    // Generic Android WebView (no Chrome package name)
    (/Android/.test(ua) && /wv\b/.test(ua)) ||
    // iOS WebView (no Safari keyword)
    (/iPhone|iPad|iPod/.test(ua) && !/Safari/.test(ua))
  )
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'inapp' | 'error'>('loading')
  const [currentUrl] = useState(() => window.location.href)

  useEffect(() => {
    // Construimos la URL para "Abrir en Chrome" (Android intent o simplemente la URL actual)
    const inApp = isInAppBrowser()

    async function handleCallback() {
      // Caso 1: implicit flow — hash contiene access_token
      const hash = window.location.hash
      if (hash.includes('access_token')) {
        // Supabase lo detecta solo vía detectSessionInUrl; redirigimos al home
        const { error } = await supabase.auth.getSession()
        if (!error) { navigate('/', { replace: true }); return }
      }

      // Caso 2: PKCE — query contiene code
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        if (inApp) {
          // En in-app browser el code_verifier no está aquí → mostrar opción de abrir en Chrome
          setStatus('inapp')
          return
        }
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { navigate('/', { replace: true }); return }
      }

      // Caso 3: token_hash (email OTP verification)
      const tokenHash = params.get('token_hash')
      const type = params.get('type') as 'signup' | 'recovery' | 'email' | null
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (!error) { navigate('/', { replace: true }); return }
      }

      // Si ya hay sesión activa, redirigir directamente
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { navigate('/', { replace: true }); return }

      if (inApp) {
        setStatus('inapp')
      } else {
        setStatus('error')
      }
    }

    void handleCallback()
  }, [navigate])

  // URL limpia para abrir en Chrome externo
  const openInChromeUrl = (() => {
    // Android: intent URL para forzar Chrome
    if (/Android/.test(navigator.userAgent)) {
      return `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
    }
    return currentUrl
  })()

  if (status === 'loading') {
    return (
      <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="muted">Iniciando sesión…</p>
      </main>
    )
  }

  if (status === 'inapp') {
    return (
      <main className="page auth-callback-page">
        <div className="auth-callback-card">
          <div className="auth-callback-icon" aria-hidden>🔗</div>
          <h1 className="auth-callback-title">Abre el enlace en Chrome</h1>
          <p className="auth-callback-desc">
            Este navegador integrado no puede completar el acceso. Pulsa el botón para abrir el enlace directamente en Chrome.
          </p>
          <a
            href={openInChromeUrl}
            className="btn btn-primary auth-callback-cta"
          >
            Abrir en Chrome
          </a>
          <p className="auth-callback-hint">
            También puedes copiar el enlace y pegarlo manualmente en Chrome.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="page auth-callback-page">
      <div className="auth-callback-card">
        <div className="auth-callback-icon" aria-hidden>⚠️</div>
        <h1 className="auth-callback-title">El enlace ha caducado</h1>
        <p className="auth-callback-desc">
          Este enlace de acceso ya no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión.
        </p>
        <a href="/login" className="btn btn-primary auth-callback-cta">
          Volver al inicio de sesión
        </a>
      </div>
    </main>
  )
}
