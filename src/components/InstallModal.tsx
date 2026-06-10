import { useId } from 'react'
import { useInstallPrompt, isIosSafari, isAndroidChrome } from '../hooks/useInstallPrompt'

type Props = { open: boolean; onClose: () => void }

export function InstallModal({ open, onClose }: Props) {
  const titleId = useId()
  const { canInstall, triggerPrompt, isPwa } = useInstallPrompt()

  if (!open) return null
  if (isPwa) { onClose(); return null }

  async function handleInstall() {
    const ok = await triggerPrompt()
    if (ok) onClose()
  }

  const ios = isIosSafari()
  const android = isAndroidChrome()

  const steps = ios ? (
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
  ) : (
    <p className="install-modal-desc">
      Abre Smorzar desde tu móvil para instalarla como app nativa.
    </p>
  )

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

        {/* Botón de instalación directa si el navegador lo permite */}
        {canInstall && (
          <button
            type="button"
            className="btn btn-primary install-modal-cta"
            onClick={handleInstall}
          >
            Instalar con un clic
          </button>
        )}

        {/* Instrucciones manuales — siempre visibles como alternativa */}
        {(ios || android) && (
          <div className="install-modal-manual">
            {canInstall && (
              <p className="install-modal-manual-label">O sigue estos pasos manualmente:</p>
            )}
            {steps}
          </div>
        )}

        {/* Fallback para navegadores sin soporte PWA */}
        {!canInstall && !ios && !android && (
          <p className="install-modal-desc">
            Abre Smorzar desde tu móvil para instalarla como app nativa.
          </p>
        )}
      </div>
    </div>
  )
}
