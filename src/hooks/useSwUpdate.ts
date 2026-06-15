import { useState, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Detecta si hay una nueva versión del service worker esperando.
 * Cuando el usuario confirma, aplica la actualización y recarga la página.
 */
export function useSwUpdate() {
  const [updating, setUpdating] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Comprueba actualizaciones cada hora en segundo plano
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000)
      }
    },
  })

  const applyUpdate = useCallback(async () => {
    setUpdating(true)
    await updateServiceWorker(true)
  }, [updateServiceWorker])

  return { needRefresh, updating, applyUpdate }
}
