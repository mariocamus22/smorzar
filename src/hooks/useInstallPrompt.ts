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
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(false)

  const isPwa = isRunningAsPwa()

  useEffect(() => {
    if (isPwa) return
    const handler = (e: Event) => {
      // NO llamamos e.preventDefault() → Chrome muestra el prompt nativo automáticamente.
      // Guardamos igualmente la referencia por si el usuario pulsa el botón "Instalar" del banner.
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [isPwa])

  const triggerPrompt = useCallback(async (): Promise<boolean> => {
    const prompt = deferredPrompt.current
    if (!prompt) return false
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    deferredPrompt.current = null
    setCanInstall(false)
    if (outcome === 'accepted') setInstalled(true)
    return outcome === 'accepted'
  }, [])

  return { canInstall, triggerPrompt, isPwa, installed }
}
