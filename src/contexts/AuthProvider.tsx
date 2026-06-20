import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchProfile, markPwaInstalled, updateAppVersion, upsertProfileDisplayName } from '../lib/almuerzosApi'
import { isRunningAsPwa } from '../hooks/useInstallPrompt'
import { setEffectiveUserIdForReads } from '../lib/effectiveUserStore'
import { hasSupabaseConfig } from '../lib/env'
import { supabase } from '../lib/supabaseClient'
import { isSupportAdminUser } from '../lib/supportAdmin'
import type { UserProfile } from '../types/almuerzo'
import { AuthContext, type AuthState } from './auth-context'

const IMPERSONATE_STORAGE_KEY = 'esmorzar_impersonate_v1'
const AUTH_INIT_TIMEOUT_MS = 12_000

const AUTH_INIT_ERROR =
  'No hay conexión con el servidor o la configuración de Supabase no es válida. Comprueba tu red e inténtalo de nuevo.'

type Impersonation = { id: string; email: string }

function readStoredImpersonation(): Impersonation | null {
  try {
    const raw = sessionStorage.getItem(IMPERSONATE_STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as { id?: unknown; email?: unknown }
    if (typeof o.id === 'string' && typeof o.email === 'string' && o.id && o.email) {
      return { id: o.id, email: o.email }
    }
  } catch {
    /* ignore */
  }
  return null
}

function impersonationForSession(session: Session | null): Impersonation | null {
  const u = session?.user
  if (!u || !isSupportAdminUser(u)) {
    try {
      sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    return null
  }
  return readStoredImpersonation()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthState['session']>(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [impersonation, setImpersonationState] = useState<Impersonation | null>(null)

  const user = session?.user ?? null
  const isSupportAdmin = isSupportAdminUser(user)
  const effectiveUserId =
    user && isSupportAdmin && impersonation ? impersonation.id : (user?.id ?? null)

  useLayoutEffect(() => {
    setEffectiveUserIdForReads(effectiveUserId)
  }, [effectiveUserId])

  const setImpersonation = useCallback((target: Impersonation | null) => {
    setImpersonationState(target)
    try {
      if (target) {
        sessionStorage.setItem(IMPERSONATE_STORAGE_KEY, JSON.stringify(target))
      } else {
        sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const uid = effectiveUserId
    if (!uid) {
      setProfile(null)
      return
    }
    setProfileLoading(true)
    try {
      const p = await fetchProfile(uid)
      setProfile(p)
    } finally {
      setProfileLoading(false)
    }
  }, [effectiveUserId])

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setLoading(false)
      setInitError('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en la configuración del despliegue.')
      return
    }

    let mounted = true
    let resolved = false

    const finishInit = (s: Session | null) => {
      if (!mounted || resolved) return
      resolved = true
      setInitError(null)
      setImpersonationState(impersonationForSession(s))
      setSession(s)
      setLoading(false)
    }

    const timeoutId = window.setTimeout(() => {
      if (!mounted || resolved) return
      resolved = true
      setLoading(false)
      setInitError(AUTH_INIT_ERROR)
    }, AUTH_INIT_TIMEOUT_MS)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return
      if (!resolved) {
        finishInit(s)
      } else {
        setSession(s)
        setImpersonationState(impersonationForSession(s))
        setInitError(null)
      }
    })

    void supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => finishInit(s))
      .catch(() => {
        if (!mounted || resolved) return
        resolved = true
        setLoading(false)
        setInitError(AUTH_INIT_ERROR)
      })

    return () => {
      mounted = false
      window.clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!effectiveUserId) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    let cancelled = false

    void (async () => {
      setProfileLoading(true)
      try {
        let p = await fetchProfile(effectiveUserId)
        // Si el perfil no tiene nombre pero el usuario introdujo uno al registrarse,
        // lo guardamos ahora (viene en user_metadata.full_name via signUp options.data).
        const metaName = (session?.user?.user_metadata?.full_name as string | undefined)?.trim()
        if (metaName && (!p?.display_name || !p.display_name.trim())) {
          await upsertProfileDisplayName(effectiveUserId, metaName)
          p = await fetchProfile(effectiveUserId)
        }
        // Registra la versión del app que tiene cargada el usuario en cada sesión
        void updateAppVersion(effectiveUserId)
        if (!cancelled) setProfile(p)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()

    const channel = supabase
      .channel(`profile-realtime-${effectiveUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${effectiveUserId}`,
        },
        () => {
          void fetchProfile(effectiveUserId).then((p) => {
            if (!cancelled) setProfile(p)
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [effectiveUserId])

  // Detecta instalación PWA y la registra en profiles (solo una vez por usuario).
  // Espera a que el perfil esté cargado (profileLoading=false) para no escribir
  // antes de saber si ya tenía pwa_installed_at.
  useEffect(() => {
    if (!effectiveUserId || profileLoading || profile?.pwa_installed_at) return

    if (isRunningAsPwa()) {
      void markPwaInstalled(effectiveUserId)
      return
    }

    function onInstalled() {
      void markPwaInstalled(effectiveUserId!)
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [effectiveUserId, profileLoading, profile?.pwa_installed_at])

  const isImpersonating = Boolean(isSupportAdmin && impersonation && user && impersonation.id !== user.id)

  const greetingHint = useMemo(() => {
    if (!isImpersonating || !impersonation) return null
    const dn = profile?.display_name?.trim()
    if (dn) return dn
    const local = impersonation.email.split('@')[0]?.trim()
    return local || 'usuario'
  }, [isImpersonating, impersonation, profile?.display_name])

  const value = useMemo<AuthState>(
    () => ({
      session,
      user,
      loading,
      initError,
      profile,
      profileLoading,
      refreshProfile,
      isSupportAdmin,
      isImpersonating,
      impersonatedUserId: isImpersonating ? impersonation?.id ?? null : null,
      impersonatedEmail: isImpersonating ? impersonation?.email ?? null : null,
      effectiveUserId,
      setImpersonation,
      greetingHint,
      signOut: async () => {
        try {
          sessionStorage.removeItem(IMPERSONATE_STORAGE_KEY)
        } catch {
          /* ignore */
        }
        setImpersonationState(null)
        await supabase.auth.signOut()
        setProfile(null)
      },
    }),
    [
      session,
      user,
      loading,
      initError,
      profile,
      profileLoading,
      refreshProfile,
      isSupportAdmin,
      isImpersonating,
      impersonation,
      effectiveUserId,
      setImpersonation,
      greetingHint,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
