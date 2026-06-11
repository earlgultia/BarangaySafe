import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { ensureResidentProfile, getRouteForRole, type UserRole } from '../lib/auth'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  getRedirectPath: () => string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      const { data } = await supabase.auth.getSession()
      const currentSession = data?.session ?? null
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user?.id) {
        const profileRole = (await ensureResidentProfile(currentSession.user.id, currentSession.user.email)) ?? 'resident'
        if (!mounted) return
        setRole(profileRole)
      }

      setLoading(false)
    }

    initializeAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, updatedSession) => {
        const sessionValue = updatedSession ?? null
        setSession(sessionValue)
        setUser(sessionValue?.user ?? null)

        if (sessionValue?.user?.id) {
          const profileRole = (await ensureResidentProfile(sessionValue.user.id, sessionValue.user.email)) ?? 'resident'
          setRole(profileRole)
        } else {
          setRole(null)
        }

        setLoading(false)
      },
    )

    return () => {
      authListener?.subscription?.unsubscribe()
      mounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      role,
      loading,
      signOut: async () => {
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setRole(null)
      },
      getRedirectPath: () => getRouteForRole(role),
    }),
    [user, session, role, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
