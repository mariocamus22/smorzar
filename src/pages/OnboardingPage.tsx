import { useNavigate } from 'react-router-dom'
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
  return (
    <main className="page onboarding-page" aria-label={`Pantalla de bienvenida ${step} de 2`}>
      <div className="onboarding-topbar">
        <div className="onboarding-brand">
          <span className="onboarding-brand-logo">
            <IconCroissant />
          </span>
          Esmorzapp
        </div>
        <div className="onboarding-progress" aria-label={`Paso ${step} de 2`}>
          <span className={`onboarding-dot${step === 1 ? ' onboarding-dot--active' : ''}`} />
          <span className={`onboarding-dot${step === 2 ? ' onboarding-dot--active' : ''}`} />
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
        Guarda cada esmorzar con fotos, valoración y todos los detalles para recordarlo siempre.
      </p>

      {/* Hero — formulario a medio rellenar */}
      <div className="onboarding-hero onboarding-hero--form" aria-hidden>
        <div className="onboarding-form-card">

          {/* Cabecera del bar */}
          <div className="onboarding-form-header">
            <p className="onboarding-form-date">Hoy, 7 de junio</p>
            <h2 className="onboarding-form-bar">Bar Pepita</h2>
            <div className="onboarding-preview-loc">
              <IconLocationPin />
              <span>Russafa, València</span>
            </div>
          </div>

          {/* Bocadillo */}
          <div className="onboarding-form-section">
            <span className="detail-static-label detail-static-label--accent">Bocadillo</span>
            <div className="onboarding-form-input">
              <span className="onboarding-form-input-text">Llonganissa i pebrot</span>
              <span className="onboarding-form-cursor" />
            </div>
          </div>

          {/* Gasto */}
          <div className="onboarding-form-section">
            <span className="detail-static-label detail-static-label--accent">Gasto</span>
            <div className="onboarding-form-chips-grid">
              <span className="form-gasto-chip form-option is-selected">
                <span className="form-gasto-chip-emoji">☕</span>
                <span className="form-gasto-chip-label">Cremaet</span>
              </span>
              <span className="form-gasto-chip form-option is-selected">
                <span className="form-gasto-chip-emoji">🥜</span>
                <span className="form-gasto-chip-label">Cacaus</span>
              </span>
              <span className="form-gasto-chip form-option">
                <span className="form-gasto-chip-emoji">🫒</span>
                <span className="form-gasto-chip-label">Olives</span>
              </span>
              <span className="form-gasto-chip form-option">
                <span className="form-gasto-chip-emoji">🍺</span>
                <span className="form-gasto-chip-label">Cervesa</span>
              </span>
            </div>
          </div>

          {/* Bebida */}
          <div className="onboarding-form-section">
            <span className="detail-static-label detail-static-label--accent">Bebida</span>
            <div className="onboarding-form-drink-row">
              <span className="onboarding-form-drink form-option is-selected">🍺 Cervesa</span>
              <span className="onboarding-form-drink form-option">💧 Agua</span>
            </div>
          </div>

          {/* Nota — parcial, se recorta */}
          <div className="onboarding-form-section">
            <span className="detail-static-label detail-static-label--accent">Nota personal</span>
            <div className="onboarding-form-textarea">
              El pan estaba crujiente y el cremaet perfecto. Repetiría sin dudar…
            </div>
          </div>

        </div>
        <div className="onboarding-form-fade" />
      </div>

      <div className="onboarding-footer">
        <button
          type="button"
          className="onboarding-cta"
          onClick={() => navigate('/onboarding/2')}
        >
          Siguiente
        </button>
        <span className="onboarding-step-label">1 de 2</span>
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
        <button type="button" className="onboarding-cta" onClick={handleNext}>
          Crear mi cuenta
        </button>
        <span className="onboarding-step-label">2 de 2</span>
      </div>
    </OnboardingShell>
  )
}
