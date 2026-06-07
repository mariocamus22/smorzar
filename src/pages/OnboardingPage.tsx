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

type OnboardingScreen1Props = {
  onNext: () => void
}

export function OnboardingScreen1({ onNext }: OnboardingScreen1Props) {
  return (
    <main className="page onboarding-page" aria-label="Pantalla de bienvenida 1 de 3">
      {/* Top bar */}
      <div className="onboarding-topbar">
        <div className="onboarding-brand">
          <span className="onboarding-brand-logo">
            <IconCroissant />
          </span>
          Esmorzapp
        </div>
        <div className="onboarding-progress" aria-label="Paso 1 de 3">
          <span className="onboarding-dot onboarding-dot--active" />
          <span className="onboarding-dot" />
          <span className="onboarding-dot" />
        </div>
      </div>

      {/* Headline */}
      <h1 className="onboarding-headline">
        Nunca olvides un buen&nbsp;almuerzo
      </h1>
      <p className="onboarding-subhead">
        Guarda cada esmorzar con fotos, valoración y todos los detalles para recordarlo siempre.
      </p>

      {/* Hero — mock almuerzo card */}
      <div className="onboarding-hero" aria-hidden>
        <div className="onboarding-preview-card">
          {/* Photo area */}
          <div className="onboarding-preview-photo">
            <span className="onboarding-preview-photo-emoji">🥖</span>
            <span className="onboarding-preview-photo-badge">3 fotos</span>
          </div>

          {/* Card body */}
          <div className="onboarding-preview-body">
            {/* Bar + price */}
            <div className="onboarding-preview-top-row">
              <div>
                <div className="onboarding-preview-bar">Bar Pepita</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem', color: 'var(--color-fg-muted)', fontSize: 'var(--text-xs)' }}>
                  <IconLocationPin />
                  <span>Russafa, València</span>
                </div>
              </div>
              <span className="onboarding-preview-price">8,50&nbsp;€</span>
            </div>

            {/* Stars */}
            <div className="onboarding-preview-stars" aria-label="Valoración: 4 de 5 estrellas">
              ★★★★☆
            </div>

            {/* Bocadillo */}
            <div className="onboarding-preview-boc-row">
              <span className="onboarding-preview-boc-label">Bocadillo:</span>
              <span className="onboarding-preview-boc-name">Llonganissa i pebrot</span>
            </div>

            {/* Extras chips */}
            <div className="onboarding-preview-chips">
              <span className="detail-static-chip">Cremaet</span>
              <span className="detail-static-chip">Cacaus</span>
              <span className="detail-static-chip">Olives</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="onboarding-footer">
        <button type="button" className="onboarding-cta" onClick={onNext}>
          Siguiente
        </button>
        <span className="onboarding-step-label">1 de 3</span>
      </div>
    </main>
  )
}
