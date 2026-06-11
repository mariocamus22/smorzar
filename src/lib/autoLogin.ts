/**
 * Auto-login con contraseña: SOLO disponible en entornos de desarrollo local (import.meta.env.DEV).
 * En producción (build) estas funciones siempre devuelven false/undefined, sin importar las
 * variables de entorno, para evitar que la lógica de acceso directo llegue al bundle público.
 */

const AUTO_LOGIN_EMAILS = import.meta.env.DEV
  ? new Set(['mariocamus22@gmail.com', 'marioesmorzar@gmail.com', 'mariocamus@hotmail.com'])
  : new Set<string>()

export function isAutoLoginEmail(email: string): boolean {
  if (!import.meta.env.DEV) return false
  return AUTO_LOGIN_EMAILS.has(email.trim().toLowerCase())
}

/** Contraseña compartida: solo en dev y solo desde variables de entorno (nunca en el repo). */
export function autoLoginSharedPassword(): string | undefined {
  if (!import.meta.env.DEV) return undefined
  const p = import.meta.env.VITE_AUTO_LOGIN_SHARED_PASSWORD
  return typeof p === 'string' && p.length > 0 ? p : undefined
}
