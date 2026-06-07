import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { markInstallDone } from '../lib/onboardingFlags'
import { MAIN_CONTENT_ID } from '../components/SkipToMainContent'

/* BeforeInstallPromptEvent no está en los tipos estándar de TypeScript */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function IconCroissant() {
  return (
    <svg width={44} height={44} viewBox="0 0 24 24" aria-hidden>
      <g fill="currentColor" transform="translate(12 12) rotate(-22)">
        <ellipse cx="-5.2" cy="0" rx="3.6" ry="5.2" />
        <ellipse cx="0" cy="0" rx="4.2" ry="5.6" />
        <ellipse cx="5.2" cy="0" rx="3.6" ry="5.2" />
      </g>
    </svg>
  )
}

function IconShare() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zM21 19a3 3 0 11-6 0 3 3 0 016 0z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Detecta si ya está instalada como PWA */
function isRunningAsPwa(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  )
}

/* Detecta Safari en iOS (donde no hay beforeinstallprompt) */
function isIosSafari(): boolean {
  const ua = navigator.userAgent
  return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua)
}

function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

export function InstallPage() {
  const navigate = useNavigate()
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [searchHint, setSearchHint] = useState(false)

  useEffect(() => {
    if (isRunningAsPwa()) {
      // Ya está instalada — marcar y pasar directo a la home
      markInstallDone()
      navigate('/', { replace: true })
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    const appInstalled = () => {
      setSearchHint(true)
      markInstallDone()
    }
    window.addEventListener('appinstalled', appInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', appInstalled)
    }
  }, [navigate])

  function handleInstall() {
    if (deferredPrompt.current) {
      void deferredPrompt.current.prompt()
      void deferredPrompt.current.userChoice.then((choice) => {
        deferredPrompt.current = null
        markInstallDone()
        if (choice.outcome === 'accepted') {
          setSearchHint(true)
        } else {
          navigate('/', { replace: true })
        }
      })
    }
  }

  function handleManualInstalled() {
    markInstallDone()
    setSearchHint(true)
  }

  function handleGoApp() {
    navigate('/', { replace: true })
  }

  const iosMode = isIosSafari()
  const androidMode = isAndroid() && !iosMode

  /* ── Pantalla "busca tu app" ── */
  if (searchHint) {
    return (
      <main id={MAIN_CONTENT_ID} className="page onboarding-page install-page">
        <div className="install-icon-wrap">
          <div className="install-icon">
            <IconCroissant />
          </div>
          <span className="install-icon-label">Esmorzapp</span>
        </div>
        <h1 className="onboarding-headline install-headline">¡Ya casi está!</h1>
        <p className="onboarding-subhead">
          {androidMode
            ? 'Desliza hacia arriba desde tu pantalla de inicio para ver el cajón de apps, o búscala por nombre. Esmorzapp aparece como cualquier otra aplicación.'
            : 'Búscala entre las aplicaciones de tu móvil y ábrela desde ahí para usarla sin el navegador.'}
        </p>
        <div className="install-search-hint" aria-hidden>
          <span className="install-search-hint-icon">{androidMode ? '👆' : '📱'}</span>
          {androidMode && (
            <p className="install-search-hint-label">Desliza hacia arriba para ver tus apps</p>
          )}
        </div>
        <div className="onboarding-footer install-footer">
          <button type="button" className="onboarding-cta" onClick={handleGoApp}>
            Entrar en la app
          </button>
        </div>
      </main>
    )
  }

  /* Pasos manuales según plataforma */
  const manualSteps = iosMode ? (
    <div className="install-steps">
      <div className="install-step">
        <span className="install-step-icon"><IconShare /></span>
        <div className="install-step-text">
          <span className="install-step-title">Pulsa el botón Compartir</span>
          <span className="install-step-desc">El icono <strong>↑</strong> en la barra inferior de Safari</span>
        </div>
      </div>
      <div className="install-step">
        <span className="install-step-icon"><IconPlus /></span>
        <div className="install-step-text">
          <span className="install-step-title">Elige «Añadir a pantalla de inicio»</span>
          <span className="install-step-desc">Desplázate en el menú hasta encontrar la opción</span>
        </div>
      </div>
      <div className="install-step">
        <span className="install-step-icon install-step-icon--check"><IconCheck /></span>
        <div className="install-step-text">
          <span className="install-step-title">Confirma pulsando «Añadir»</span>
          <span className="install-step-desc">Aparecerá el icono de Esmorzapp en tu pantalla de inicio</span>
        </div>
      </div>
    </div>
  ) : androidMode ? (
    <div className="install-steps">
      <div className="install-step">
        <span className="install-step-icon"><IconShare /></span>
        <div className="install-step-text">
          <span className="install-step-title">Pulsa el menú ⋮ del navegador</span>
          <span className="install-step-desc">Los tres puntos en la esquina superior derecha de Chrome</span>
        </div>
      </div>
      <div className="install-step">
        <span className="install-step-icon"><IconPlus /></span>
        <div className="install-step-text">
          <span className="install-step-title">Selecciona «Instalar app» o «Añadir a pantalla de inicio»</span>
          <span className="install-step-desc">Puede aparecer también como «Añadir a inicio»</span>
        </div>
      </div>
      <div className="install-step">
        <span className="install-step-icon install-step-icon--check"><IconCheck /></span>
        <div className="install-step-text">
          <span className="install-step-title">Confirma pulsando «Instalar»</span>
          <span className="install-step-desc">La app aparecerá en tu cajón de aplicaciones</span>
        </div>
      </div>
    </div>
  ) : null

  return (
    <main id={MAIN_CONTENT_ID} className="page onboarding-page install-page">
      {/* App icon */}
      <div className="install-icon-wrap">
        <div className="install-icon">
          <IconCroissant />
        </div>
        <span className="install-icon-label">Esmorzapp</span>
      </div>

      <h1 className="onboarding-headline install-headline">
        Añade Esmorzapp a tu móvil
      </h1>
      <p className="onboarding-subhead">
        Accede como una app nativa, sin barras del navegador y con acceso rápido desde tu pantalla de inicio.
      </p>

      {manualSteps}

      <div className="onboarding-footer install-footer">
        {canInstall ? (
          <button type="button" className="onboarding-cta" onClick={handleInstall}>
            Instalar app
          </button>
        ) : (iosMode || androidMode) ? (
          <button type="button" className="onboarding-cta" onClick={handleManualInstalled}>
            Ya la he instalado
          </button>
        ) : (
          <p className="install-unavail">
            Abre Esmorzapp desde tu móvil para poder instalarla.
          </p>
        )}
      </div>
    </main>
  )
}
