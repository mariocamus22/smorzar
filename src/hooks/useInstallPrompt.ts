import { useEffect, useCallback, useState } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ─── Detección de entorno ────────────────────────────────────────────────────

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

/** Navegadores in-app que nunca disparan beforeinstallprompt. */
export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent
  return (
    /Outlook-Android|Outlook-iOS|com\.microsoft\.outlook|ms-outlook/i.test(ua) ||
    /\bGSA\b/.test(ua) ||
    /\bFBAN\b|\bFBAV\b|\bFBIOS\b|\bInstagram\b|\bWhatsApp\b/.test(ua) ||
    (/Android/.test(ua) && /wv\b/.test(ua)) ||
    (/iPhone|iPad|iPod/.test(ua) && !/Safari/.test(ua))
  )
}

/** URL de intent para abrir la URL actual en Chrome en Android. */
export function chromeIntentUrl(url = window.location.href): string {
  return /Android/.test(navigator.userAgent)
    ? `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
    : url
}

// ─── Singleton a nivel de módulo ─────────────────────────────────────────────
//
// Se registra ANTES de que React monte, capturando el evento incluso si llega
// durante el parsing del HTML o justo al cargar el script.
//
let _prompt: BeforeInstallPromptEvent | null = null
let _installed = false
const _listeners: Set<() => void> = new Set()

function _notify() {
  _listeners.forEach(fn => fn())
}

function _handleBeforeInstall(e: Event) {
  e.preventDefault() // suprime la mini-barra automática de Chrome
  _prompt = e as BeforeInstallPromptEvent
  _notify()
}

function _handleInstalled() {
  _prompt = null
  _installed = true
  _notify()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', _handleBeforeInstall)
  window.addEventListener('appinstalled', _handleInstalled)
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useInstallPrompt() {
  const isPwa = isRunningAsPwa()

  // Sincroniza el estado React con el singleton
  const [canInstall, setCanInstall] = useState(() => !isPwa && _prompt !== null)
  const [installed, setInstalled] = useState(() => _installed)

  useEffect(() => {
    if (isPwa) return
    function sync() {
      setCanInstall(_prompt !== null)
      setInstalled(_installed)
    }
    _listeners.add(sync)
    // Sincronización inicial por si el evento llegó antes de montar
    sync()
    return () => { _listeners.delete(sync) }
  }, [isPwa])

  /**
   * Lanza el prompt nativo inmediatamente.
   * Devuelve true si el usuario acepta, false si cancela o no hay prompt.
   */
  const triggerPrompt = useCallback(async (): Promise<boolean> => {
    if (!_prompt) return false
    const p = _prompt
    try {
      await p.prompt()
      const { outcome } = await p.userChoice
      if (outcome === 'accepted') {
        _prompt = null
        _installed = true
        _notify()
        return true
      }
    } catch {
      // El prompt ya fue usado o el navegador lo rechazó
    }
    return false
  }, [])

  return { canInstall, triggerPrompt, isPwa, installed }
}
