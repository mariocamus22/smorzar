import { useId, useState } from 'react'
import { isIosSafari, isAndroidChrome, isRunningAsPwa } from '../hooks/useInstallPrompt'

type Props = {
  open: boolean
  onClose: () => void
  /** Lanza el prompt nativo de Chrome — lo controla el padre */
  onInstall: () => void
}

export function InstallModal({ open, onClose, onInstall }: Props) {
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
  const android = isAndroidChrome()

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

        {/* CTA directo — visible en Android/escritorio; no en iOS (Apple no permite la API) */}
        {!ios && (
          <button
            type="button"
            className="btn btn-primary install-modal-cta"
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? 'Abriendo instalador…' : 'Instalar ahora'}
          </button>
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
      </div>
    </div>
  )
}
