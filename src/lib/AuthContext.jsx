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
        // Si acaba de registrarse, crear perfil si no existe
        if (event === 'SIGNED_IN') {
          await ensureProfile(session.user)
        }
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function ensureProfile(user) {
    // Verificar si ya existe el perfil
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existing) {
      // Crear perfil con el nombre del metadata o email
      const nombre = user.user_metadata?.nombre || user.email.split('@')[0]
      await supabase.from('profiles').insert({
        id: user.id,
        nombre,
        email: user.email,
        es_admin: false,
      })
    }
  }

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(email, password, nombre) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }, // guardamos nombre en metadata
        emailRedirectTo: window.location.origin,
      }
    })
    if (error) throw error

    // Intentar crear perfil inmediatamente si el usuario ya está disponible
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        nombre,
        email,
        es_admin: false,
      }, { onConflict: 'id' })
      if (profileError) console.error('Profile creation error:', profileError)
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
