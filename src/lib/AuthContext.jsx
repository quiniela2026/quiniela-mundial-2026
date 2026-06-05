import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        if (event === 'SIGNED_IN') await ensureProfile(session.user)
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function ensureProfile(user) {
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    if (!existing) {
      const nombre = user.user_metadata?.nombre || user.email.split('@')[0]
      const codigo = user.user_metadata?.codigo_acceso || ''
      await supabase.from('profiles').insert({ id: user.id, nombre, email: user.email, es_admin: false, codigo_usado: codigo })
    }
  }

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(email, password, nombre, codigoAcceso) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { nombre, codigo_acceso: codigoAcceso },
        emailRedirectTo: window.location.origin,
      }
    })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, nombre, email, es_admin: false, codigo_usado: codigoAcceso
      }, { onConflict: 'id' })
    }
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
