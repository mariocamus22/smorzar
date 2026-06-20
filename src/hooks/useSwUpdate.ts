import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Aplica actualizaciones del service worker de forma transparente:
 * cuando hay una versión nueva, espera a que el usuario mande la app
 * a segundo plano (visibilitychange → hidden) y recarga en ese momento.
 * El usuario no tiene que hacer nada — la próxima vez que abra la app
 * ya tiene la versión nueva.
 */
export function useSwUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Comprueba actualizaciones cada 30 minutos en segundo plano
      if (r) setInterval(() => r.update(), 30 * 60 * 1000)
    },
  })

  useEffect(() => {
    if (!needRefresh) return

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        void updateServiceWorker(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [needRefresh, updateServiceWorker])
}
