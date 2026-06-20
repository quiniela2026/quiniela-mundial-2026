import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS, FLAGS } from '../lib/partidos'
import { calcularPuntos } from '../lib/puntos'

const GRUPOS_LETRAS = [...new Set(PARTIDOS.map(p => p.grupo))]

function CodigoPanel() {
  const [codigo, setCodigo] = useState('')
  const [actual, setActual] = useState('')
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    supabase.from('configuracion').select('valor').eq('clave', 'codigo_acceso').single()
      .then(({ data }) => { if (data) { setActual(data.valor); setCodigo(data.valor) } })
  }, [])

  async function guardar() {
    if (!codigo.trim()) return
    const nuevo = codigo.toUpperCase().trim()
    await supabase.from('configuracion').update({ valor: nuevo }).eq('clave', 'codigo_acceso')
    setActual(nuevo)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div className="card" style={{ marginBottom: 12, borderColor: 'rgba(255,214,0,0.3)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--oro)' }}>🔑 Código de acceso</div>
      <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: 'var(--verde)', marginBottom: 8, letterSpacing: '0.15em' }}>{actual || '---'}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} style={{ flex: 1, letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }} placeholder="Nuevo código" />
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={guardar}>{guardado ? '✓' : 'Cambiar'}</button>
      </div>
    </div>
  )
}

function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: resultados }, { data: predicciones }, { data: profiles }] = await Promise.all([
        supabase.from('resultados').select('*').not('goles_local', 'is', null),
        supabase.from('predicciones').select('*'),
        supabase.from('profiles').select('id, nombre'),
      ])
      const resMap = {}
      resultados?.forEach(r => { resMap[r.partido_id] = r })

      // Puntos por usuario
      const puntosMap = {}
      let totalExactos = 0
      predicciones?.forEach(pred => {
        const res = resMap[pred.partido_id]
        if (!res) return
        const pts = calcularPuntos(pred, res)
        if (pts === null) return
        if (!puntosMap[pred.user_id]) puntosMap[pred.user_id] = 0
        puntosMap[pred.user_id] += pts
        if (pts === 5) totalExactos++
      })

      const ranking = (profiles || [])
        .map(p => ({ nombre: p.nombre, puntos: puntosMap[p.id] || 0 }))
        .sort((a, b) => b.puntos - a.puntos)

      setData({
        jugados: resultados?.length || 0,
        pendientes: PARTIDOS.length - (resultados?.length || 0),
        participantes: profiles?.length || 0,
        totalExactos,
        lider: ranking[0] || null,
        top3: ranking.slice(0, 3),
      })
    }
    load()
  }, [])

  if (!data) return <div className="loader" style={{ margin: '20px auto' }} />

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        📊 Dashboard en vivo
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Partidos jugados', value: data.jugados, color: 'var(--verde)' },
          { label: 'Por jugar', value: data.pendientes, color: 'var(--text2)' },
          { label: 'Participantes', value: data.participantes, color: 'var(--oro)' },
          { label: 'Marcadores exactos', value: data.totalExactos, color: '#ff6b6b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {data.top3.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>TOP 3 ACTUAL</div>
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

export default function AdminPage() {
  const { profile } = useAuth()
  const [resultados, setResultados] = useState({})
  const [inputs, setInputs] = useState({})
  const [guardando, setGuardando] = useState({})
  const [guardado, setGuardado] = useState({})
  const [whatsappMsg, setWhatsappMsg] = useState(null)
  const [grupoActivo, setGrupoActivo] = useState('A')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('resultados').select('*')
      const map = {}, inp = {}
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

  if (!profile?.es_admin) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
      <div style={{ color: 'var(--text2)' }}>No tienes acceso.</div>
    </div>
  )

  const handleChange = (partidoId, campo, valor) => {
    const val = valor === '' ? '' : Math.max(0, Math.min(99, parseInt(valor) || 0))
    setInputs(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], [campo]: val } }))
  }

  const generarWhatsApp = async (partido, golesLocal, golesVisita) => {
    // Obtener ranking actualizado
    const [{ data: predicciones }, { data: resultados }, { data: profiles }] = await Promise.all([
      supabase.from('predicciones').select('*'),
      supabase.from('resultados').select('*').not('goles_local', 'is', null),
      supabase.from('profiles').select('id, nombre'),
    ])
    const resMap = {}
    resultados?.forEach(r => { resMap[r.partido_id] = r })
    const puntosMap = {}
    predicciones?.forEach(pred => {
      const res = resMap[pred.partido_id]
      if (!res) return
      const pts = calcularPuntos(pred, res)
      if (pts === null) return
      if (!puntosMap[pred.user_id]) puntosMap[pred.user_id] = 0
      puntosMap[pred.user_id] += pts
    })
    const top5 = (profiles || [])
      .map(p => ({ nombre: p.nombre, puntos: puntosMap[p.id] || 0 }))
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 5)

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
    const rankingText = top5.map((p, i) => `${medals[i]} ${p.nombre}: *${p.puntos} pts*`).join('\n')

    const msg = `⚽ *Resultado — Grupo ${partido.grupo}*\n\n🏴 *${partido.local}* ${golesLocal} - ${golesVisita} *${partido.visita}* 🏴\n\n📊 *Top 5 Ranking*\n${rankingText}\n\n🏆 Quiniela Mundial 2026\nhttps://quiniela-mundial-2026-murex.vercel.app/`
    setWhatsappMsg(msg)
  }

  const guardar = async (partido) => {
    const inp = inputs[partido.id] || {}
    if (inp.local === '' || inp.visita === '' || inp.local === undefined || inp.visita === undefined) return
    setGuardando(prev => ({ ...prev, [partido.id]: true }))
    const { error } = await supabase.from('resultados').upsert({
      partido_id: partido.id, grupo: partido.grupo,
      goles_local: parseInt(inp.local), goles_visita: parseInt(inp.visita),
    }, { onConflict: 'partido_id' })
    setGuardando(prev => ({ ...prev, [partido.id]: false }))
    if (!error) {
      setGuardado(prev => ({ ...prev, [partido.id]: true }))
      setResultados(prev => ({ ...prev, [partido.id]: { goles_local: parseInt(inp.local), goles_visita: parseInt(inp.visita) } }))
      await generarWhatsApp(partido, parseInt(inp.local), parseInt(inp.visita))
      setTimeout(() => setGuardado(prev => ({ ...prev, [partido.id]: false })), 3000)
    }
  }

  const borrar = async (partidoId) => {
    if (!confirm('¿Borrar este resultado?')) return
    await supabase.from('resultados').delete().eq('partido_id', partidoId)
    setResultados(prev => { const n = { ...prev }; delete n[partidoId]; return n })
    setInputs(prev => { const n = { ...prev }; delete n[partidoId]; return n })
    setWhatsappMsg(null)
  }

  const partidosGrupo = PARTIDOS.filter(p => p.grupo === grupoActivo)

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">PANEL <span>ADMIN</span></div>

      <Dashboard />
      <CodigoPanel />

      {/* Mensaje WhatsApp generado */}
      {whatsappMsg && (
        <div className="card" style={{ marginBottom: 12, borderColor: 'rgba(37,211,102,0.4)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#25d366', marginBottom: 8 }}>
            📱 Mensaje listo para WhatsApp
          </div>
          <pre style={{
            fontSize: 12, color: 'var(--text)', background: 'var(--bg3)',
            borderRadius: 8, padding: 12, whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 10
          }}>{whatsappMsg}</pre>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, background: '#25d366', color: '#fff', borderRadius: 8, padding: '10px', fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
              Abrir en WhatsApp
            </a>
            <button onClick={() => { navigator.clipboard.writeText(whatsappMsg) }}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Copiar
            </button>
            <button onClick={() => setWhatsappMsg(null)}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 8, padding: '10px 12px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="alert alert-warn" style={{ marginBottom: 12 }}>
        ⚠️ Solo ingresa resultados de partidos que ya terminaron en la realidad.
      </div>

      {/* Tabs grupos */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {GRUPOS_LETRAS.map(g => (
          <button key={g} onClick={() => setGrupoActivo(g)} style={{
            background: grupoActivo === g ? 'var(--oro)' : 'var(--bg3)',
            color: grupoActivo === g ? '#000' : 'var(--text2)',
            border: '1px solid ' + (grupoActivo === g ? 'var(--oro)' : 'var(--border)'),
            borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
          }}>{g}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {partidosGrupo.map(partido => {
          const inp = inputs[partido.id] || {}
          const tieneResultado = resultados[partido.id]?.goles_local !== undefined && resultados[partido.id]?.goles_local !== null

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
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{FLAGS[partido.local] || '🏳️'} {partido.local}</div>
                  <input type="number" min="0" max="99" value={inp.local ?? ''} onChange={e => handleChange(partido.id, 'local', e.target.value)} placeholder="Goles" style={{ width: 90 }} />
                </div>
                <span style={{ color: 'var(--text2)', fontWeight: 700, fontSize: 20 }}>VS</span>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{FLAGS[partido.visita] || '🏳️'} {partido.visita}</div>
                  <input type="number" min="0" max="99" value={inp.visita ?? ''} onChange={e => handleChange(partido.id, 'visita', e.target.value)} placeholder="Goles" style={{ width: 90 }} />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn-primary" style={{ width: 'auto', padding: '10px 18px' }} onClick={() => guardar(partido)} disabled={guardando[partido.id]}>
                    {guardando[partido.id] ? '...' : guardado[partido.id] ? '✓' : 'Guardar'}
                  </button>
                  {tieneResultado && <button className="btn-danger" onClick={() => borrar(partido.id)}>Borrar</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
