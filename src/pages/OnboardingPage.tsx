import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { markOnboardingDone } from '../lib/onboardingFlags'

/* ─── Shared icons ─────────────────────────────────────────────── */

function IconCroissant() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" aria-hidden>
      <g fill="currentColor" transform="translate(12 12) rotate(-22)">
        <ellipse cx="-5.2" cy="0" rx="3.6" ry="5.2" />
        <ellipse cx="0" cy="0" rx="4.2" ry="5.6" />
        <ellipse cx="5.2" cy="0" rx="3.6" ry="5.2" />
      </g>
    </svg>
  )
}

function IconLocationPin() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c0 0 7-4.55 7-10a7 7 0 10-14 0c0 5.45 7 10 7 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconHistoryCalendar() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconEsmorzarSmall() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="14" rx="9" ry="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 14c0-3 4-6 9-6s9 3 9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Shared layout ─────────────────────────────────────────────── */

type OnboardingShellProps = {
  step: 1 | 2
  children: React.ReactNode
}

function OnboardingShell({ step, children }: OnboardingShellProps) {
  const navigate = useNavigate()
  const touchStartX = useRef<number | null>(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    setDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    // Amortigua el gesto si no hay pantalla en esa dirección
    const canNext = step === 1 && delta < 0
    const canPrev = step === 2 && delta > 0
    setDragX((canNext || canPrev) ? delta : delta * 0.12)
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    setDragging(false)

    if (delta < -60 && step === 1) {
      setDragX(-window.innerWidth)
      setTimeout(() => { setDragX(0); navigate('/onboarding/2') }, 220)
    } else if (delta > 60 && step === 2) {
      setDragX(window.innerWidth)
      setTimeout(() => { setDragX(0); navigate('/onboarding/1') }, 220)
    } else {
      setDragX(0)
    }
  }

  return (
    <main
      className="page onboarding-page"
      aria-label={`Pantalla de bienvenida ${step} de 2`}
      style={{
        transform: `translateX(${dragX}px)`,
        transition: dragging ? 'none' : 'transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="onboarding-topbar">
        <div className="onboarding-brand">
          <span className="onboarding-brand-logo">
            <IconCroissant />
          </span>
          Esmorzapp
        </div>
      </div>
      {children}
    </main>
  )
}

/* ─── Screen 1: value proposition ──────────────────────────────── */

export function OnboardingScreen1() {
  const navigate = useNavigate()

  return (
    <OnboardingShell step={1}>
      <h1 className="onboarding-headline">
        Nunca olvides un buen&nbsp;almuerzo
      </h1>
      <p className="onboarding-subhead">
        Guarda cada almuerzo con fotos, valoración y todos los detalles para recordarlo siempre.
      </p>

      {/* Hero — mockup del formulario real */}
      <div className="onboarding-hero onboarding-hero--form" aria-hidden>
        <div className="ob-mockup">
          {/* Cabecera del formulario */}
          <div className="ob-mockup-header">
            <span className="ob-mockup-date">Hoy</span>
            <span className="ob-mockup-bar">La Mesedora Algemesí</span>
            <span className="ob-mockup-addr">
              <IconLocationPin /> Algemesí, Valencia
            </span>
          </div>

          {/* Tabs */}
          <div className="ob-mockup-tabs">
            <span className="ob-mockup-tab ob-mockup-tab--active">🥖 Bocadillo y Gasto</span>
            <span className="ob-mockup-tab">🥤 Bebida</span>
            <span className="ob-mockup-tab">☕ Café</span>
          </div>

          {/* Bocadillo */}
          <div className="ob-mockup-section">
            <span className="ob-mockup-label">Bocadillo</span>
            <div className="ob-mockup-input">
              <span className="ob-mockup-input-placeholder">Ej: Chivito, carne de caballo…</span>
            </div>
          </div>

          {/* Gasto */}
          <div className="ob-mockup-section">
            <span className="ob-mockup-label">Gasto <span className="ob-mockup-optional">(opcional)</span></span>
            <div className="ob-mockup-chips">
              <span className="ob-mockup-chip ob-mockup-chip--selected">🥜 Cacahuetes</span>
              <span className="ob-mockup-chip">🫒 Olivas</span>
              <span className="ob-mockup-chip">🟡 Altramuces</span>
              <span className="ob-mockup-chip">🥗 Ensalada</span>
            </div>
          </div>

          {/* Fade inferior */}
          <div className="ob-mockup-fade" />
        </div>
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-progress" aria-label="Paso 1 de 2">
          <span className="onboarding-dot onboarding-dot--active" />
          <span className="onboarding-dot" />
        </div>
        <button
          type="button"
          className="onboarding-cta"
          onClick={() => navigate('/onboarding/2')}
        >
          Siguiente
        </button>
      </div>
    </OnboardingShell>
  )
}

/* ─── Screen 2: personal diary ──────────────────────────────────── */

const MOCK_ENTRIES = [
  {
    emoji: '🥖',
    bar: 'Bar Pepita',
    loc: 'Russafa, València',
    date: '3 de junio de 2025',
    boc: 'Llonganissa i pebrot',
  },
  {
    emoji: '🥪',
    bar: 'Bodega La Pascuala',
    loc: 'El Carmen, València',
    date: '28 de mayo de 2025',
    boc: 'Calamars a la romana',
  },
  {
    emoji: '🍞',
    bar: 'Bar Pilar',
    loc: 'Ciutat Vella, València',
    date: '21 de mayo de 2025',
    boc: 'Tonyina amb tomaca',
  },
]

export function OnboardingScreen2() {
  const navigate = useNavigate()

  function handleNext() {
    markOnboardingDone()
    navigate('/login')
  }

  return (
    <OnboardingShell step={2}>
      <h1 className="onboarding-headline">
        Tu diario personal de almuerzos
      </h1>
      <p className="onboarding-subhead">
        Recuerda cada bar, lo que pediste y si mereció la pena.
      </p>

      {/* Hero — mini history list */}
      <div className="onboarding-hero onboarding-hero--diary" aria-hidden>
        <ul className="onboarding-diary-list">
          {MOCK_ENTRIES.map((entry, i) => (
            <li key={i} className="onboarding-diary-card">
              <div className="onboarding-diary-avatar">
                <span className="onboarding-diary-avatar-emoji">{entry.emoji}</span>
              </div>
              <div className="onboarding-diary-text">
                <span className="onboarding-diary-bar">{entry.bar}</span>
                <span className="onboarding-diary-loc">
                  <IconLocationPin />
                  {entry.loc}
                </span>
                <div className="onboarding-diary-meta">
                  <IconHistoryCalendar />
                  <span>{entry.date}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="onboarding-diary-boc-row">
          <IconEsmorzarSmall />
          <span className="onboarding-diary-boc-label">Bocadillo:</span>
          <span className="onboarding-diary-boc-name">{MOCK_ENTRIES[0].boc}</span>
        </div>
        <div className="onboarding-diary-fade" aria-hidden />
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-progress" aria-label="Paso 2 de 2">
          <span className="onboarding-dot" />
          <span className="onboarding-dot onboarding-dot--active" />
        </div>
        <button type="button" className="onboarding-cta" onClick={handleNext}>
          Crear mi cuenta
        </button>
      </div>
    </OnboardingShell>
  )
}
