import { useId } from 'react'
import { useInstallPrompt, isIosSafari, isAndroidChrome } from '../hooks/useInstallPrompt'

type Props = { open: boolean; onClose: () => void }

export function InstallModal({ open, onClose }: Props) {
  const titleId = useId()
  const { canInstall, triggerPrompt, isPwa } = useInstallPrompt()

  if (!open) return null
  if (isPwa) {
    // Already installed — close
    onClose()
    return null
  }

  async function handleInstall() {
    const ok = await triggerPrompt()
    if (ok) onClose()
  }

  const ios = isIosSafari()
  const android = isAndroidChrome()

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
          <h2 id={titleId} className="install-modal-title">Instalar Esmorzapp</h2>
          <button type="button" className="install-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {canInstall ? (
          <>
            <p className="install-modal-desc">
              Instala la app en tu móvil para acceder más rápido y sin el navegador.
            </p>
            <button type="button" className="btn btn-primary install-modal-cta" onClick={handleInstall}>
              Instalar app
            </button>
          </>
        ) : ios ? (
          <>
            <p className="install-modal-desc">Sigue estos pasos en Safari:</p>
            <ol className="install-modal-steps">
              <li>Pulsa el icono <strong>Compartir ↑</strong> en la barra inferior</li>
              <li>Selecciona <strong>«Añadir a pantalla de inicio»</strong></li>
              <li>Pulsa <strong>«Añadir»</strong> para confirmar</li>
            </ol>
          </>
        ) : android ? (
          <>
            <p className="install-modal-desc">Sigue estos pasos en Chrome:</p>
            <ol className="install-modal-steps">
              <li>Pulsa el menú <strong>⋮</strong> (tres puntos) arriba a la derecha</li>
              <li>Selecciona <strong>«Instalar app»</strong> o <strong>«Añadir a pantalla de inicio»</strong></li>
              <li>Pulsa <strong>«Instalar»</strong> para confirmar</li>
            </ol>
          </>
        ) : (
          <p className="install-modal-desc">
            Abre Esmorzapp desde tu móvil para instalarla como app nativa.
          </p>
        )}
      </div>
    </div>
  )
}
