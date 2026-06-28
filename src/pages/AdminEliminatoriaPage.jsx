import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS_ELIMINATORIA, FLAGS_ELIM } from '../lib/eliminatoria/partidosEliminatoria'
import { calcularPuntosEliminatoria } from '../lib/eliminatoria/puntosEliminatoria'

function DashboardEliminatoria() {
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: resultados }, { data: predicciones }, { data: profiles }] = await Promise.all([
        supabase.from('resultados_eliminatoria').select('*').not('goles_local', 'is', null),
        supabase.from('predicciones_eliminatoria').select('*'),
        supabase.from('profiles').select('id, nombre'),
      ])
      const resMap = {}
      resultados?.forEach(r => { resMap[r.partido_id] = r })

      const puntosMap = {}
      predicciones?.forEach(pred => {
        const res = resMap[pred.partido_id]
        const partido = PARTIDOS_ELIMINATORIA.find(p => p.id === pred.partido_id)
        if (!res || !partido) return
        const pts = calcularPuntosEliminatoria(partido, pred, res)
        if (pts === null) return
        if (!puntosMap[pred.user_id]) puntosMap[pred.user_id] = 0
        puntosMap[pred.user_id] += pts
      })

      const ranking = (profiles || [])
        .map(p => ({ nombre: p.nombre, puntos: puntosMap[p.id] || 0 }))
        .sort((a, b) => b.puntos - a.puntos)

      setData({
        jugados: resultados?.length || 0,
        pendientes: PARTIDOS_ELIMINATORIA.length - (resultados?.length || 0),
        top3: ranking.filter(r => r.puntos > 0).slice(0, 3),
      })
    }
    load()
  }, [])

  if (!data) return <div className="loader" style={{ margin: '20px auto' }} />

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        🏆 Dashboard Eliminatoria
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--verde)' }}>{data.jugados}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Partidos jugados</div>
        </div>
        <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text2)' }}>{data.pendientes}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Por jugar</div>
        </div>
      </div>
      {data.top3.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>TOP 3 ELIMINATORIA</div>
          {data.top3.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 16 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{p.nombre}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: i === 0 ? 'var(--oro)' : 'var(--verde)' }}>{p.puntos}</span>
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminEliminatoriaPage() {
  const { profile } = useAuth()
  const [resultados, setResultados] = useState({})
  const [inputs, setInputs] = useState({})
  const [guardando, setGuardando] = useState({})
  const [guardado, setGuardado] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('resultados_eliminatoria').select('*')
      const map = {}, inp = {}
      data?.forEach(r => {
        map[r.partido_id] = r
        inp[r.partido_id] = { local: r.goles_local ?? '', visita: r.goles_visita ?? '', avanza: r.avanza ?? '' }
      })
      setResultados(map)
      setInputs(inp)
      setLoading(false)
    }
    load()
  }, [])

  if (!profile?.es_admin) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
      <div style={{ color: 'var(--text2)' }}>No tienes acceso.</div>
    </div>
  )

  const handleChange = (partidoId, campo, valor) => {
    if (campo === 'avanza') {
      setInputs(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], avanza: valor } }))
      return
    }
    const val = valor === '' ? '' : Math.max(0, Math.min(99, parseInt(valor) || 0))
    setInputs(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], [campo]: val } }))
  }

  const guardar = async (partido) => {
    const inp = inputs[partido.id] || {}
    if (inp.local === '' || inp.visita === '' || inp.local === undefined || inp.visita === undefined) return
    const esEmpate = parseInt(inp.local) === parseInt(inp.visita)
    if (esEmpate && !inp.avanza) {
      alert('Este partido terminó empatado en 90 minutos. Selecciona qué equipo avanzó por penales.')
      return
    }
    setGuardando(prev => ({ ...prev, [partido.id]: true }))
    const { error } = await supabase.from('resultados_eliminatoria').upsert({
      partido_id: partido.id,
      goles_local: parseInt(inp.local),
      goles_visita: parseInt(inp.visita),
      avanza: esEmpate ? inp.avanza : null,
    }, { onConflict: 'partido_id' })
    setGuardando(prev => ({ ...prev, [partido.id]: false }))
    if (!error) {
      setGuardado(prev => ({ ...prev, [partido.id]: true }))
      setResultados(prev => ({ ...prev, [partido.id]: { goles_local: parseInt(inp.local), goles_visita: parseInt(inp.visita), avanza: esEmpate ? inp.avanza : null } }))
      setTimeout(() => setGuardado(prev => ({ ...prev, [partido.id]: false })), 3000)
    }
  }

  const borrar = async (partidoId) => {
    if (!confirm('¿Borrar este resultado?')) return
    await supabase.from('resultados_eliminatoria').delete().eq('partido_id', partidoId)
    setResultados(prev => { const n = { ...prev }; delete n[partidoId]; return n })
    setInputs(prev => { const n = { ...prev }; delete n[partidoId]; return n })
  }

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">ADMIN <span>ELIMINATORIA</span></div>

      <DashboardEliminatoria />

      <div className="alert alert-warn mb-16">
        ⚠️ Solo ingresa resultados de partidos que ya terminaron en la realidad. Si el partido fue a penales, marca quién avanzó.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PARTIDOS_ELIMINATORIA.map(partido => {
          const inp = inputs[partido.id] || {}
          const tieneResultado = resultados[partido.id]?.goles_local !== undefined && resultados[partido.id]?.goles_local !== null
          const esEmpateInput = inp.local !== '' && inp.visita !== '' && inp.local !== undefined && inp.visita !== undefined && parseInt(inp.local) === parseInt(inp.visita)

          return (
            <div key={partido.id} className={`partido-card ${tieneResultado ? 'jugado' : ''}`}>
              <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 4 }}>
                <span className="partido-meta">P{partido.id} · {partido.fecha} · {partido.estadio}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!tieneResultado && <span className="badge badge-oro">Pendiente</span>}
                  {tieneResultado && <span className="badge badge-verde">✓ Cargado</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{FLAGS_ELIM[partido.local] || '🏳️'} {partido.local}</div>
                  <input type="number" min="0" max="99" value={inp.local ?? ''} onChange={e => handleChange(partido.id, 'local', e.target.value)} placeholder="Goles" style={{ width: 90 }} />
                </div>
                <span style={{ color: 'var(--text2)', fontWeight: 700, fontSize: 20 }}>VS</span>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{FLAGS_ELIM[partido.visita] || '🏳️'} {partido.visita}</div>
                  <input type="number" min="0" max="99" value={inp.visita ?? ''} onChange={e => handleChange(partido.id, 'visita', e.target.value)} placeholder="Goles" style={{ width: 90 }} />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn-primary" style={{ width: 'auto', padding: '10px 18px' }} onClick={() => guardar(partido)} disabled={guardando[partido.id]}>
                    {guardando[partido.id] ? '...' : guardado[partido.id] ? '✓' : 'Guardar'}
                  </button>
                  {tieneResultado && <button className="btn-danger" onClick={() => borrar(partido.id)}>Borrar</button>}
                </div>
              </div>

              {esEmpateInput && (
                <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,214,0,0.08)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--oro)', marginBottom: 6 }}>⚽ Empate en 90 min — ¿quién avanzó por penales?</div>
                  <select value={inp.avanza || ''} onChange={e => handleChange(partido.id, 'avanza', e.target.value)} style={{ fontSize: 13 }}>
                    <option value="">Selecciona…</option>
                    <option value={partido.local}>{partido.local}</option>
                    <option value={partido.visita}>{partido.visita}</option>
                  </select>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
