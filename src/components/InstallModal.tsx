import { useId, useState } from 'react'
import { isIosSafari, isAndroidChrome, isRunningAsPwa, isInAppBrowser } from '../hooks/useInstallPrompt'

type Props = {
  open: boolean
  onClose: () => void
  /** Lanza el prompt nativo de Chrome — lo controla el padre */
  onInstall: () => void
  /** true si beforeinstallprompt ya ha llegado y el prompt está disponible */
  canInstall?: boolean
}

export function InstallModal({ open, onClose, onInstall, canInstall = false }: Props) {
  const [installing, setInstalling] = useState(false)

  async function handleInstall() {
    setInstalling(true)
    try {
      await onInstall()
    } finally {
      setInstalling(false)
    }
  }
  const titleId = useId()

  if (!open) return null
  if (isRunningAsPwa()) { onClose(); return null }

  const ios = isIosSafari()
  const inApp = isInAppBrowser()
  const android = isAndroidChrome()

  // URL para abrir en Chrome externo desde un in-app browser
  const currentUrl = window.location.href
  const openInChromeUrl = /Android/.test(navigator.userAgent)
    ? `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
    : currentUrl

  const manualSteps = ios ? (
    <ol className="install-modal-steps">
      <li>Pulsa el icono <strong>Compartir ↑</strong> en la barra inferior de Safari</li>
      <li>Selecciona <strong>«Añadir a pantalla de inicio»</strong></li>
      <li>Pulsa <strong>«Añadir»</strong> para confirmar</li>
    </ol>
  ) : android ? (
    <ol className="install-modal-steps">
      <li>Pulsa el menú <strong>⋮</strong> arriba a la derecha en Chrome</li>
      <li>Selecciona <strong>«Instalar app»</strong> o <strong>«Añadir a pantalla de inicio»</strong></li>
      <li>Pulsa <strong>«Instalar»</strong> para confirmar</li>
    </ol>
  ) : null

  return (
    <div className="install-modal-root" role="presentation">
      <div className="install-modal-backdrop" onClick={onClose} />
      <div
        className="install-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="install-modal-head">
          <h2 id={titleId} className="install-modal-title">Instalar Smorzar</h2>
          <button type="button" className="install-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* In-app browser (Outlook, Gmail…): Chrome no puede lanzar el prompt aquí */}
        {inApp && !ios ? (
          <div className="install-modal-inapp">
            <p className="install-modal-inapp-desc">
              Este navegador integrado no puede instalar apps.<br />
              Abre Smorzar en <strong>Chrome</strong> para instalarla.
            </p>
            <a
              href={openInChromeUrl}
              className="btn btn-primary install-modal-cta"
            >
              Abrir en Chrome →
            </a>
          </div>
        ) : (
          <>
            {/* CTA directo — visible en Android/escritorio; no en iOS */}
            {!ios && (
              <button
                type="button"
                className="btn btn-primary install-modal-cta"
                onClick={handleInstall}
                disabled={installing || !canInstall}
              >
                {installing ? 'Abriendo instalador…' : 'Instalar ahora'}
              </button>
            )}

            {/* Si el prompt aún no está disponible, mostrar aviso */}
            {!ios && !canInstall && !installing && (
              <p className="install-modal-hint">
                Si el botón no responde, usa las instrucciones de abajo.
              </p>
            )}

            {/* Instrucciones manuales */}
            {manualSteps && (
              <div className="install-modal-manual">
                <p className="install-modal-manual-label">
                  {ios ? 'Sigue estos pasos:' : '¿No funciona el botón? Prueba manualmente:'}
                </p>
                {manualSteps}
              </div>
            )}

            {/* Fallback escritorio sin soporte PWA */}
            {!ios && !android && (
              <p className="install-modal-desc">
                Abre Smorzar desde tu móvil para instalarla como app nativa.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
