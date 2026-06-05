import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [modo, setModo] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function verificarCodigo(codigoIngresado) {
    const { data, error } = await supabase
      .from('configuracion')
      .select('valor')
      .eq('clave', 'codigo_acceso')
      .single()
    if (error || !data) return false
    return data.valor.toUpperCase() === codigoIngresado.toUpperCase().trim()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      if (modo === 'login') {
        await signIn(email, password)
      } else {
        if (!nombre.trim()) { setError('Ingresa tu nombre'); setLoading(false); return }
        if (!codigo.trim()) { setError('Ingresa el código de acceso'); setLoading(false); return }
        // Verificar código — para registro no hay sesión aún, usar anon
        const { data: configData } = await supabase
          .from('configuracion')
          .select('valor')
          .eq('clave', 'codigo_acceso')
          .single()
        
        const codigoValido = configData?.valor?.toUpperCase() === codigo.toUpperCase().trim()
        if (!codigoValido) {
          setError('Código de acceso incorrecto. Contacta al organizador.')
          setLoading(false)
          return
        }
        await signUp(email, password, nombre.trim(), codigo.toUpperCase().trim())
        setSuccess('¡Cuenta creada! Ya puedes ingresar.')
        setModo('login')
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials': 'Correo o contraseña incorrectos',
        'User already registered': 'Este correo ya está registrado',
        'Email not confirmed': 'Confirma tu correo antes de entrar',
      }
      setError(msgs[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">QUINIELA <span>2026</span></div>
        <div className="auth-sub">Mundial FIFA · Fase de Grupos</div>

        <form onSubmit={handleSubmit}>
          {modo === 'register' && (
            <div className="form-group">
              <label className="form-label">Tu nombre</label>
              <input
                type="text" placeholder="Ej: Carlos Pérez"
                value={nombre} onChange={e => setNombre(e.target.value)} required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email" placeholder="tucorreo@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password" placeholder="Mínimo 6 caracteres"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          {modo === 'register' && (
            <div className="form-group">
              <label className="form-label">Código de acceso</label>
              <input
                type="text"
                placeholder="Ingresa el código que te dieron"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                required
                style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
              />
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                Solicita el código al organizador de la quiniela
              </div>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <button type="submit" className="btn-primary mt-16" disabled={loading}>
            {loading ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
          {modo === 'login' ? (
            <>¿No tienes cuenta? <button className="nav-link" style={{ display: 'inline', padding: '0 4px' }} onClick={() => { setModo('register'); setError(''); setSuccess('') }}>Regístrate</button></>
          ) : (
            <>¿Ya tienes cuenta? <button className="nav-link" style={{ display: 'inline', padding: '0 4px' }} onClick={() => { setModo('login'); setError(''); setSuccess('') }}>Inicia sesión</button></>
          )}
        </div>
      </div>
    </div>
  )
}
