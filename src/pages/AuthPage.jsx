import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [modo, setModo] = useState('login') // 'login' | 'register'
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

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
        await signUp(email, password, nombre.trim())
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
