/**
 * Convierte errores de Supabase/red en mensajes claros en español.
 */
export function formatSupabaseError(err: unknown): string {
  if (err == null) return 'Error desconocido.'

  const e = err as { message?: string; code?: string; status?: number }
  const msg = (e.message ?? '').toLowerCase()
  const code = e.code ?? ''

  if (code === 'PGRST301' || msg.includes('jwt') || msg.includes('session')) {
    return 'Sesión caducada o no válida. Vuelve a iniciar sesión.'
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'No hay conexión o el servidor no responde. Comprueba tu red e inténtalo de nuevo.'
  }
  if (msg.includes('error sending') || msg.includes('sending magic link') || msg.includes('sending confirmation') || msg.includes('email not sent')) {
    return 'No hemos podido enviar el correo. Espera unos segundos e inténtalo de nuevo. Si el problema persiste, prueba con otra dirección de email.'
  }
  if (code === '42501' || msg.includes('permission denied') || msg.includes('row-level security')) {
    return 'No tienes permiso para esta acción. Inicia sesión de nuevo.'
  }
  if (e.status === 401 || e.status === 403) {
    return 'Acceso no autorizado. Inicia sesión de nuevo.'
  }
  // Descartar mensajes vacíos o que sean JSON crudo como "{}" o "[]"
  const cleaned = e.message?.trim() ?? ''
  if (cleaned && cleaned !== '{}' && cleaned !== '[]' && cleaned.length < 200) {
    return cleaned
  }
  return 'Ha ocurrido un error. Inténtalo de nuevo en unos segundos.'
}
