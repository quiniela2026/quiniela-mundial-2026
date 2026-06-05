import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS, FLAGS } from '../lib/partidos'

const GRUPOS_LETRAS = [...new Set(PARTIDOS.map(p => p.grupo))]

function esPartidoBloqueado(partido) {
  const ahora = new Date()
  const kickoff = new Date(`${partido.fecha}T${partido.hora}:00-04:00`)
  return ahora >= kickoff
}

export default function AdminPage() {
  const { profile } = useAuth()
  const [resultados, setResultados] = useState({})
  const [inputs, setInputs] = useState({})
  const [guardando, setGuardando] = useState({})
  const [guardado, setGuardado] = useState({})
  const [grupoActivo, setGrupoActivo] = useState('A')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('resultados').select('*')
      const map = {}
      const inp = {}
      data?.forEach(r => {
        map[r.partido_id] = r
        inp[r.partido_id] = { local: r.goles_local ?? '', visita: r.goles_visita ?? '' }
      })
      setResultados(map)
      setInputs(inp)
      setLoading(false)
    }
    load()
  }, [])

  if (!profile?.es_admin) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
        <div style={{ color: 'var(--text2)' }}>No tienes acceso a esta sección.</div>
      </div>
    )
  }

  const handleChange = (partidoId, campo, valor) => {
    const val = valor === '' ? '' : Math.max(0, Math.min(99, parseInt(valor) || 0))
    setInputs(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], [campo]: val } }))
  }

  const guardar = async (partido) => {
    const inp = inputs[partido.id] || {}
    if (inp.local === '' || inp.visita === '' || inp.local === undefined || inp.visita === undefined) return
    setGuardando(prev => ({ ...prev, [partido.id]: true }))
    const { error } = await supabase.from('resultados').upsert({
      partido_id: partido.id,
      grupo: partido.grupo,
      goles_local: parseInt(inp.local),
      goles_visita: parseInt(inp.visita),
    }, { onConflict: 'partido_id' })
    setGuardando(prev => ({ ...prev, [partido.id]: false }))
    if (!error) {
      setGuardado(prev => ({ ...prev, [partido.id]: true }))
      setTimeout(() => setGuardado(prev => ({ ...prev, [partido.id]: false })), 2000)
    }
  }

  const borrar = async (partidoId) => {
    if (!confirm('¿Borrar este resultado?')) return
    await supabase.from('resultados').delete().eq('partido_id', partidoId)
    setResultados(prev => { const n = { ...prev }; delete n[partidoId]; return n })
    setInputs(prev => { const n = { ...prev }; delete n[partidoId]; return n })
  }

  const partidosGrupo = PARTIDOS.filter(p => p.grupo === grupoActivo)

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">PANEL <span>ADMIN</span></div>
      <div className="alert alert-warn">
        ⚠️ Solo ingresa resultados de partidos que ya terminaron. Esto actualiza los puntos de todos.
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {GRUPOS_LETRAS.map(g => (
          <button
            key={g}
            onClick={() => setGrupoActivo(g)}
            style={{
              background: grupoActivo === g ? 'var(--oro)' : 'var(--bg3)',
              color: grupoActivo === g ? '#000' : 'var(--text2)',
              border: '1px solid ' + (grupoActivo === g ? 'var(--oro)' : 'var(--border)'),
              borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {partidosGrupo.map(partido => {
          const bloqueado = esPartidoBloqueado(partido)
          const inp = inputs[partido.id] || {}
          const tieneResultado = resultados[partido.id]?.goles_local !== undefined &&
                                  resultados[partido.id]?.goles_local !== null

          return (
            <div key={partido.id} className={`partido-card ${tieneResultado ? 'jugado' : ''}`}>
              <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 4 }}>
                <span className="partido-meta">P{partido.id} · {partido.fecha} {partido.hora} · {partido.estadio}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!bloqueado && <span className="badge badge-gray">No iniciado</span>}
                  {bloqueado && !tieneResultado && <span className="badge badge-oro">En juego / sin resultado</span>}
                  {tieneResultado && <span className="badge badge-verde">Resultado cargado</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
                    {FLAGS[partido.local] || '🏳️'} {partido.local}
                  </div>
                  <input
                    type="number" min="0" max="99"
                    value={inp.local ?? ''}
                    onChange={e => handleChange(partido.id, 'local', e.target.value)}
                    placeholder="Goles"
                    style={{ width: 90 }}
                    disabled={!bloqueado}
                  />
                </div>
                <span style={{ color: 'var(--text2)', fontWeight: 700, fontSize: 20 }}>VS</span>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
                    {FLAGS[partido.visita] || '🏳️'} {partido.visita}
                  </div>
                  <input
                    type="number" min="0" max="99"
                    value={inp.visita ?? ''}
                    onChange={e => handleChange(partido.id, 'visita', e.target.value)}
                    placeholder="Goles"
                    style={{ width: 90 }}
                    disabled={!bloqueado}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '10px 18px' }}
                    onClick={() => guardar(partido)}
                    disabled={!bloqueado || guardando[partido.id]}
                  >
                    {guardando[partido.id] ? '...' : guardado[partido.id] ? '✓' : 'Guardar'}
                  </button>
                  {tieneResultado && (
                    <button className="btn-danger" onClick={() => borrar(partido.id)}>
                      Borrar
                    </button>
                  )}
                </div>
              </div>
              {!bloqueado && (
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
                  El partido no ha comenzado — no se puede cargar resultado todavía.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
