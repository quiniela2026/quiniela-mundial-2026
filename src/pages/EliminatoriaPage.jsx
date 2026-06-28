import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS_ELIMINATORIA, FLAGS_ELIM, RONDAS_LABEL } from '../lib/eliminatoria/partidosEliminatoria'
import { calcularPuntosEliminatoria, labelPuntosEliminatoria } from '../lib/eliminatoria/puntosEliminatoria'
import Footer from '../components/Footer'

function formatFecha(fecha, hora) {
  const d = new Date(`${fecha}T${hora}:00-04:00`)
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function esPartidoBloqueado(partido, bloqueoGlobal) {
  if (bloqueoGlobal) return true
  const ahora = new Date()
  const kickoff = new Date(`${partido.fecha}T${partido.hora}:00-04:00`)
  return ahora >= kickoff
}

export default function EliminatoriaPage() {
  const { user } = useAuth()
  const [predicciones, setPredicciones] = useState({})
  const [resultados, setResultados] = useState({})
  const [guardando, setGuardando] = useState({})
  const [guardado, setGuardado] = useState({})
  const [loading, setLoading] = useState(true)
  const [bloqueoGlobal, setBloqueoGlobal] = useState(false)
  const timerRef = useRef({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: preds }, { data: resuls }, { data: config }] = await Promise.all([
        supabase.from('predicciones_eliminatoria').select('*').eq('user_id', user.id),
        supabase.from('resultados_eliminatoria').select('*'),
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
    setPredicciones(prev => ({
      ...prev,
      [partidoId]: { ...(prev[partidoId] || {}), [campo]: valor, user_id: user.id, partido_id: partidoId }
    }))
    if (timerRef.current[partidoId]) clearTimeout(timerRef.current[partidoId])
    timerRef.current[partidoId] = setTimeout(() => guardarPrediccion(partidoId), 800)
  }

  const guardarPrediccion = async (partidoId) => {
    if (bloqueoGlobal) return
    const pred = predicciones[partidoId]
    if (!pred) return
    const gl = pred.goles_local_pred
    const gv = pred.goles_visita_pred
    if (gl === '' || gv === '' || gl === undefined || gv === undefined) return

    const esEmpatePred = parseInt(gl) === parseInt(gv)
    // si predijo empate, necesita haber elegido quién avanza
    if (esEmpatePred && !pred.avanza_pred) return

    setGuardando(prev => ({ ...prev, [partidoId]: true }))
    const { error } = await supabase.from('predicciones_eliminatoria').upsert({
      user_id: user.id,
      partido_id: partidoId,
      goles_local_pred: parseInt(gl),
      goles_visita_pred: parseInt(gv),
      avanza_pred: esEmpatePred ? pred.avanza_pred : null,
    }, { onConflict: 'user_id,partido_id' })
    setGuardando(prev => ({ ...prev, [partidoId]: false }))
    if (!error) {
      setGuardado(prev => ({ ...prev, [partidoId]: true }))
      setTimeout(() => setGuardado(prev => ({ ...prev, [partidoId]: false })), 2500)
    }
  }

  const completadas = PARTIDOS_ELIMINATORIA.filter(p => {
    const pred = predicciones[p.id]
    if (!pred || pred.goles_local_pred == null || pred.goles_visita_pred == null) return false
    const empatePred = parseInt(pred.goles_local_pred) === parseInt(pred.goles_visita_pred)
    return !empatePred || !!pred.avanza_pred
  }).length

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}><div className="loader" /></div>

  return (
    <div className="page">
      <div className="alert alert-info mb-16" style={{ textAlign: 'center' }}>
        🏆 ¡Comenzó la fase eliminatoria! Ranking independiente a la fase de grupos.
      </div>

      {bloqueoGlobal && (
        <div className="alert alert-warn mb-16" style={{ textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
          🔒 Las predicciones están cerradas.
        </div>
      )}

      <div className="flex-between mb-16">
        <div className="section-title" style={{ marginBottom: 0 }}>16AVOS <span>DE FINAL</span></div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{completadas}/{PARTIDOS_ELIMINATORIA.length} listos</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PARTIDOS_ELIMINATORIA.map(partido => {
          const bloqueado = esPartidoBloqueado(partido, bloqueoGlobal)
          const pred = predicciones[partido.id] || {}
          const resultado = resultados[partido.id]
          const jugado = resultado?.goles_local !== null && resultado?.goles_local !== undefined
          const puntos = jugado ? calcularPuntosEliminatoria(partido, pred, resultado) : null
          const pLabel = puntos !== null ? labelPuntosEliminatoria(puntos) : null
          const tienePred = pred.goles_local_pred !== undefined && pred.goles_local_pred !== null &&
                            pred.goles_visita_pred !== undefined && pred.goles_visita_pred !== null
          const prediceEmpate = tienePred && parseInt(pred.goles_local_pred) === parseInt(pred.goles_visita_pred)

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
                  <div style={{ fontSize: 26 }}>{FLAGS_ELIM[partido.local] || '🏳️'}</div>
                  <div className="team-name" style={{ marginTop: 4, fontSize: 13 }}>{partido.local}</div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 12px', minWidth: 130 }}>
                  {jugado ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--verde)', minWidth: 32, textAlign: 'center' }}>{resultado.goles_local}</div>
                        <div style={{ color: 'var(--text2)', fontWeight: 700 }}>-</div>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--verde)', minWidth: 32, textAlign: 'center' }}>{resultado.goles_visita}</div>
                      </div>
                      {resultado.goles_local === resultado.goles_visita && resultado.avanza && (
                        <div style={{ fontSize: 11, color: 'var(--oro)', marginTop: 4 }}>Avanza por penales: {resultado.avanza}</div>
                      )}
                      {tienePred && (
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                          tu pred: {pred.goles_local_pred}-{pred.goles_visita_pred}
                          {pred.avanza_pred && ` (${pred.avanza_pred})`}
                        </div>
                      )}
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

                          {prediceEmpate && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontSize: 11, color: 'var(--oro)', marginBottom: 4 }}>¿Quién avanza en penales?</div>
                              <select
                                value={pred.avanza_pred || ''}
                                onChange={e => { handleChange(partido.id, 'avanza_pred', e.target.value); }}
                                onBlur={() => guardarPrediccion(partido.id)}
                                style={{ fontSize: 12, padding: '4px 6px' }}
                              >
                                <option value="">Selecciona…</option>
                                <option value={partido.local}>{partido.local}</option>
                                <option value={partido.visita}>{partido.visita}</option>
                              </select>
                            </div>
                          )}

                          <div style={{ textAlign: 'center', height: 16, marginTop: 4 }}>
                            {guardando[partido.id] && <span style={{ fontSize: 11, color: 'var(--text2)' }}>guardando…</span>}
                            {guardado[partido.id] && <span style={{ fontSize: 11, color: 'var(--verde)' }}>✓ guardado</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 26 }}>{FLAGS_ELIM[partido.visita] || '🏳️'}</div>
                  <div className="team-name" style={{ marginTop: 4, fontSize: 13 }}>{partido.visita}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda de puntos */}
      <div className="card mt-16" style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sistema de puntos — Eliminación directa</div>
        {[
          { pts: '5 pts', label: 'Marcador exacto en 90 min', clase: 'puntos-5' },
          { pts: '3 pts', label: 'Avance correcto + diferencia de gol correcta', clase: 'puntos-4' },
          { pts: '2 pts', label: 'Solo acierta quién avanza (incluye penales)', clase: 'puntos-3' },
          { pts: '1 pt',  label: 'Acierta el empate en 90 min', clase: 'puntos-1' },
        ].map(item => (
          <div key={item.pts} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className={item.clase} style={{ minWidth: 44, textAlign: 'center' }}>{item.pts}</span>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className="alert alert-info mt-24">
        💡 Si predices un marcador empatado, te pedimos elegir quién avanza por penales.
      </div>
      <Footer />
    </div>
  )
}
