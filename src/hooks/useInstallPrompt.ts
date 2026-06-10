import { useCallback, useEffect, useRef, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function isRunningAsPwa(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  )
}

export function isIosSafari(): boolean {
  const ua = navigator.userAgent
  return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua)
}

export function isAndroidChrome(): boolean {
  return /Android/.test(navigator.userAgent) && !isIosSafari()
}

export function useInstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  // Resolvers que esperan a que llegue el evento beforeinstallprompt
  const waiters = useRef<Array<(e: BeforeInstallPromptEvent) => void>>([])
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(false)

  const isPwa = isRunningAsPwa()

  useEffect(() => {
    if (isPwa) return
    const handler = (e: Event) => {
      // Suprimimos la mini-barra automática de Chrome para controlar nosotros cuándo aparece.
      e.preventDefault()
      const bipe = e as BeforeInstallPromptEvent
      deferredPrompt.current = bipe
      setCanInstall(true)
      // Notifica a quien estuviera esperando con waitForPrompt
      waiters.current.forEach((resolve) => resolve(bipe))
      waiters.current = []
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [isPwa])

  /**
   * Espera hasta `timeoutMs` ms a que llegue beforeinstallprompt.
   * Si ya está disponible, resuelve de inmediato. Si no llega, devuelve null.
   */
  const waitForPrompt = useCallback((timeoutMs = 4000): Promise<BeforeInstallPromptEvent | null> => {
    if (deferredPrompt.current) return Promise.resolve(deferredPrompt.current)
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        waiters.current = waiters.current.filter((r) => r !== resolve)
        resolve(null)
      }, timeoutMs)
      waiters.current.push((e) => {
        window.clearTimeout(timer)
        resolve(e)
      })
    })
  }, [])

  /**
   * Lanza el prompt nativo. Si el evento aún no ha llegado, espera hasta 4 s.
   * Devuelve true si el usuario acepta instalar, false si cancela o no hay soporte.
   */
  const triggerPrompt = useCallback(async (): Promise<boolean> => {
    const prompt = await waitForPrompt(4000)
    if (!prompt) return false
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    deferredPrompt.current = null
    setCanInstall(false)
    if (outcome === 'accepted') setInstalled(true)
    return outcome === 'accepted'
  }, [waitForPrompt])

  return { canInstall, triggerPrompt, waitForPrompt, isPwa, installed }
}
