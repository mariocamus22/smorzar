import * as Sentry from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    release: __APP_VERSION__,
    environment: import.meta.env.MODE, // 'production' | 'development'
    // Solo captura errores en producción para no contaminar con ruido de dev
    enabled: import.meta.env.PROD,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    // 10% de trazas de rendimiento — suficiente para detectar lentitud
    tracesSampleRate: 0.1,
    // No enviar datos personales en las URLs
    beforeSend(event) {
      return event
    },
  })
}

/** Asocia al usuario autenticado con los errores que capture Sentry. */
export function setSentryUser(id: string, email?: string) {
  Sentry.setUser({ id, email })
}

/** Limpia el usuario al hacer logout. */
export function clearSentryUser() {
  Sentry.setUser(null)
}
