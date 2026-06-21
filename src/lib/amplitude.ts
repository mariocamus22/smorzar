import * as amplitude from '@amplitude/analytics-browser'
import { isRunningAsPwa } from '../hooks/useInstallPrompt'

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY

export function initAmplitude() {
  if (!AMPLITUDE_API_KEY) return
  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: false, // solo eventos manuales definidos en la taxonomía
    autocapture: false,
  })
}

// ─── User Properties ────────────────────────────────────────────────────────

export function setAmplitudeUser(userId: string, props: {
  email?: string
  registration_date?: string
  total_lunches_created?: number
  user_level?: 'beginner' | 'regular' | 'expert'
}) {
  if (!AMPLITUDE_API_KEY) return
  amplitude.setUserId(userId)
  const identify = new amplitude.Identify()
  if (props.email) identify.set('email', props.email)
  if (props.registration_date) identify.set('registration_date', props.registration_date)
  if (props.total_lunches_created !== undefined) identify.set('total_lunches_created', props.total_lunches_created)
  if (props.user_level) identify.set('user_level', props.user_level)
  identify.set('platform', getPlatform())
  identify.set('language', navigator.language.split('-')[0] ?? 'es')
  amplitude.identify(identify)
}

export function clearAmplitudeUser() {
  if (!AMPLITUDE_API_KEY) return
  amplitude.reset()
}

// ─── Eventos ─────────────────────────────────────────────────────────────────

export function trackAppInstalled() {
  if (!AMPLITUDE_API_KEY) return
  amplitude.track('app_installed', {
    platform: getPlatform(),
    os: getOs(),
    language: navigator.language.split('-')[0] ?? 'es',
    app_version: __APP_VERSION__,
    pwa_installed: true,
  })
}

export function trackUserRegistered() {
  if (!AMPLITUDE_API_KEY) return
  amplitude.track('user_registered')
}

export function trackAppOpened() {
  if (!AMPLITUDE_API_KEY) return
  amplitude.track('app_opened')
}

export function trackCreateLunchClicked(sourceScreen: string) {
  if (!AMPLITUDE_API_KEY) return
  amplitude.track('create_lunch_clicked', { source_screen: sourceScreen })
}

export function trackLunchCreated(restaurantName: string) {
  if (!AMPLITUDE_API_KEY) return
  amplitude.track('lunch_created', { restaurant_name: restaurantName })
  // Incrementa el contador de almuerzos en el perfil de usuario
  const identify = new amplitude.Identify()
  identify.add('total_lunches_created', 1)
  amplitude.identify(identify)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPlatform(): string {
  if (isRunningAsPwa()) {
    const ua = navigator.userAgent
    if (/iP(hone|ad|od)/.test(ua)) return 'ios'
    if (/Android/.test(ua)) return 'android'
    return 'web-pwa'
  }
  return 'web'
}

function getOs(): string {
  const ua = navigator.userAgent
  if (/iP(hone|ad|od)/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Windows/.test(ua)) return 'windows'
  if (/Mac/.test(ua)) return 'macos'
  return 'other'
}
