import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS, FLAGS } from '../lib/partidos'
import { calcularPuntos, labelPuntos } from '../lib/puntos'
import Footer from '../components/Footer'

const GRUPOS_LETRAS = [...new Set(PARTIDOS.map(p => p.grupo))]

function esPartidoBloqueado(partido, bloqueoGlobal) {
  if (bloqueoGlobal) return true
  const ahora = new Date()
  const kickoff = new Date(`${partido.fecha}T${partido.hora}:00-04:00`)
  return ahora >= kickoff
}

function formatFecha(fecha, hora) {
  const d = new Date(`${fecha}T${hora}:00-04:00`)
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function FixturePage() {
  const { user } = useAuth()
  const [predicciones, setPredicciones] = useState({})
  const [resultados, setResultados] = useState({})
  const [guardando, setGuardando] = useState({})
  const [guardado, setGuardado] = useState({})
  const [errorGuard, setErrorGuard] = useState({})
  const [grupoActivo, setGrupoActivo] = useState('A')
  const [loading, setLoading] = useState(true)
  const [bloqueoGlobal, setBloqueoGlobal] = useState(false)
  const timerRef = useRef({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: preds }, { data: resuls }, { data: config }] = await Promise.all([
        supabase.from('predicciones').select('*').eq('user_id', user.id),
        supabase.from('resultados').select('*'),
        supabase.from('configuracion').select('valor').eq('clave', 'predicciones_bloqueadas').single(),
      ])
      const predMap = {}
      preds?.forEach(p => { predMap[p.partido_id] = p })
      const resMap = {}
      resuls?.forEach(r => { resMap[r.partido_id] = r })
      setPredicciones(predMap)
      setResultados(resMap)
      setBloqueoGlobal(config?.valor === 'true')
      setLoading(false)
    }
    load()
  }, [user.id])

  const handleChange = (partidoId, campo, valor) => {
    const val = valor === '' ? '' : Math.max(0, Math.min(99, parseInt(valor) || 0))
    setPredicciones(prev => ({
      ...prev,
      [partidoId]: { ...(prev[partidoId] || {}), [campo]: val, user_id: user.id, partido_id: partidoId }
    }))
    if (timerRef.current[partidoId]) clearTimeout(timerRef.current[partidoId])
    timerRef.current[partidoId] = setTimeout(() => guardarPrediccion(partidoId), 800)
  }

  const guardarPrediccion = async (partidoId) => {
    if (bloqueoGlobal) return
    const pred = predicciones[partidoId]
    if (!pred) return
    if (pred.goles_local_pred === '' || pred.goles_visita_pred === '' ||
        pred.goles_local_pred === undefined || pred.goles_visita_pred === undefined) return
    setGuardando(prev => ({ ...prev, [partidoId]: true }))
    setErrorGuard(prev => ({ ...prev, [partidoId]: null }))
    const { error } = await supabase.from('predicciones').upsert({
      user_id: user.id,
      partido_id: partidoId,
      goles_local_pred: parseInt(pred.goles_local_pred),
      goles_visita_pred: parseInt(pred.goles_visita_pred),
    }, { onConflict: 'user_id,partido_id' })
    setGuardando(prev => ({ ...prev, [partidoId]: false }))
    if (error) {
      setErrorGuard(prev => ({ ...prev, [partidoId]: 'Error al guardar' }))
    } else {
      setGuardado(prev => ({ ...prev, [partidoId]: true }))
      setTimeout(() => setGuardado(prev => ({ ...prev, [partidoId]: false })), 2500)
    }
  }

  const partidosGrupo = PARTIDOS.filter(p => p.grupo === grupoActivo)
  const completadasGrupo = partidosGrupo.filter(p => {
    const pred = predicciones[p.id]
    return pred?.goles_local_pred !== undefined && pred?.goles_local_pred !== null &&
           pred?.goles_visita_pred !== undefined && pred?.goles_visita_pred !== null
  }).length

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}><div className="loader" /></div>

  return (
    <div className="page">
      {bloqueoGlobal && (
        <div className="alert alert-warn mb-16" style={{ textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
          🔒 Las predicciones están cerradas. ¡El Mundial ya comenzó! ⚽
        </div>
      )}

      <div className="flex-between mb-16">
        <div className="section-title" style={{ marginBottom: 0 }}>GRUPO <span>{grupoActivo}</span></div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{completadasGrupo}/{partidosGrupo.length} listos</div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {GRUPOS_LETRAS.map(g => {
          const pts = PARTIDOS.filter(p => p.grupo === g)
          const comp = pts.filter(p => {
            const pred = predicciones[p.id]
            return pred?.goles_local_pred !== undefined && pred?.goles_local_pred !== null
          }).length
          const completo = comp === pts.length
          return (
            <button key={g} onClick={() => setGrupoActivo(g)} style={{
              background: grupoActivo === g ? 'var(--verde)' : completo ? 'rgba(0,200,83,0.1)' : 'var(--bg3)',
              color: grupoActivo === g ? '#000' : completo ? 'var(--verde)' : 'var(--text2)',
              border: '1px solid ' + (grupoActivo === g ? 'var(--verde)' : completo ? 'rgba(0,200,83,0.3)' : 'var(--border)'),
              borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s', position: 'relative'
            }}>
              {g}{completo && grupoActivo !== g && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 10 }}>✓</span>}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {partidosGrupo.map(partido => {
          const bloqueado = esPartidoBloqueado(partido, bloqueoGlobal)
          const pred = predicciones[partido.id] || {}
          const resultado = resultados[partido.id]
          const jugado = resultado?.goles_local !== null && resultado?.goles_local !== undefined
          const puntos = calcularPuntos(pred, resultado)
          const pLabel = puntos !== null ? labelPuntos(puntos) : null
          const tienePred = pred.goles_local_pred !== undefined && pred.goles_local_pred !== null &&
                            pred.goles_visita_pred !== undefined && pred.goles_visita_pred !== null

          return (
            <div key={partido.id} className={`partido-card ${jugado ? 'jugado' : bloqueado ? 'en-curso' : 'pendiente'}`}>
              <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 4 }}>
                <span className="partido-meta">{formatFecha(partido.fecha, partido.hora)} · {partido.estadio}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {bloqueado && !jugado && <span className="badge badge-oro">🔒 Cerrado</span>}
                  {jugado && <span className="badge badge-verde">Jugado</span>}
                  {pLabel && <span className={pLabel.clase}>{pLabel.texto}</span>}
                </div>
              </div>

              <div className="partido-teams">
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 26 }}>{FLAGS[partido.local] || '🏳️'}</div>
                  <div className="team-name" style={{ marginTop: 4, fontSize: 13 }}>{partido.local}</div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 12px', minWidth: 120 }}>
                  {jugado ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--verde)', minWidth: 32, textAlign: 'center' }}>{resultado.goles_local}</div>
                        <div style={{ color: 'var(--text2)', fontWeight: 700 }}>-</div>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--verde)', minWidth: 32, textAlign: 'center' }}>{resultado.goles_visita}</div>
                      </div>
                      {tienePred && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>tu pred: {pred.goles_local_pred}-{pred.goles_visita_pred}</div>}
                    </>
                  ) : (
                    <div>
                      {tienePred ? (
                        <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: bloqueado ? 'var(--oro)' : 'var(--verde)' }}>
                          {pred.goles_local_pred} - {pred.goles_visita_pred}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: bloqueado ? '#ff5252' : 'var(--text2)' }}>
                          {bloqueado ? '❌ sin pred' : 'sin predicción'}
                        </div>
                      )}
                      {!bloqueado && (
                        <div>
                          <div className="score-input" style={{ justifyContent: 'center', marginTop: 4 }}>
                            <input type="number" min="0" max="99" value={pred.goles_local_pred ?? ''} onChange={e => handleChange(partido.id, 'goles_local_pred', e.target.value)} onBlur={() => guardarPrediccion(partido.id)} style={{ width: 50 }} placeholder="?" />
                            <span className="score-sep">-</span>
                            <input type="number" min="0" max="99" value={pred.goles_visita_pred ?? ''} onChange={e => handleChange(partido.id, 'goles_visita_pred', e.target.value)} onBlur={() => guardarPrediccion(partido.id)} style={{ width: 50 }} placeholder="?" />
                          </div>
                          <div style={{ textAlign: 'center', height: 16, marginTop: 4 }}>
                            {guardando[partido.id] && <span style={{ fontSize: 11, color: 'var(--text2)' }}>guardando…</span>}
                            {guardado[partido.id] && <span style={{ fontSize: 11, color: 'var(--verde)' }}>✓ guardado</span>}
                            {errorGuard[partido.id] && <span style={{ fontSize: 11, color: '#ff5252' }}>{errorGuard[partido.id]}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 26 }}>{FLAGS[partido.visita] || '🏳️'}</div>
                  <div className="team-name" style={{ marginTop: 4, fontSize: 13 }}>{partido.visita}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="alert alert-info mt-24">
        {bloqueoGlobal ? '🔒 Predicciones cerradas. Ya inició el Mundial.' : '💡 Las predicciones se guardan automáticamente.'}
      </div>
      <Footer />
    </div>
  )
}
