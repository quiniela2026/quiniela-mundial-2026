import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS, FLAGS } from '../lib/partidos'

const GRUPOS_LETRAS = [...new Set(PARTIDOS.map(p => p.grupo))]

function esPartidoBloqueado(partido) {
  const ahora = new Date()
  const kickoff = new Date(`${partido.fecha}T${partido.hora}:00-04:00`)
  return ahora >= kickoff
}

function formatFecha(fecha, hora) {
  const d = new Date(`${fecha}T${hora}:00-04:00`)
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function calcularPuntos(pred, resultado) {
  if (!resultado || resultado.goles_local === null || resultado.goles_local === undefined) return null
  if (pred?.goles_local_pred === undefined || pred?.goles_local_pred === null ||
      pred?.goles_visita_pred === undefined || pred?.goles_visita_pred === null) return null
  const predGa = parseInt(pred.goles_local_pred)
  const predGb = parseInt(pred.goles_visita_pred)
  const realGa = resultado.goles_local
  const realGb = resultado.goles_visita
  if (isNaN(predGa) || isNaN(predGb)) return null
  if (predGa === realGa && predGb === realGb) return 3
  const predResult = predGa > predGb ? 'L' : predGa < predGb ? 'V' : 'E'
  const realResult = realGa > realGb ? 'L' : realGa < realGb ? 'V' : 'E'
  if (predResult === realResult) return 1
  return 0
}

export default function FixturePage() {
  const { user } = useAuth()
  const [predicciones, setPredicciones] = useState({})
  const [resultados, setResultados] = useState({})
  const [guardando, setGuardando] = useState({})
  const [guardado, setGuardado] = useState({})
  const [error, setError] = useState({})
  const [grupoActivo, setGrupoActivo] = useState('A')
  const [loading, setLoading] = useState(true)
  const timerRef = useRef({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: preds, error: predErr }, { data: resuls }] = await Promise.all([
        supabase.from('predicciones').select('*').eq('user_id', user.id),
        supabase.from('resultados').select('*'),
      ])
      if (predErr) console.error('Error cargando predicciones:', predErr)
      const predMap = {}
      preds?.forEach(p => { predMap[p.partido_id] = p })
      const resMap = {}
      resuls?.forEach(r => { resMap[r.partido_id] = r })
      setPredicciones(predMap)
      setResultados(resMap)
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
    // Auto-guardar con debounce de 800ms
    if (timerRef.current[partidoId]) clearTimeout(timerRef.current[partidoId])
    timerRef.current[partidoId] = setTimeout(() => {
      guardarPrediccion(partidoId)
    }, 800)
  }

  const guardarPrediccion = async (partidoId) => {
    const pred = predicciones[partidoId]
    if (!pred) return
    if (pred.goles_local_pred === '' || pred.goles_visita_pred === '' ||
        pred.goles_local_pred === undefined || pred.goles_visita_pred === undefined) return

    setGuardando(prev => ({ ...prev, [partidoId]: true }))
    setError(prev => ({ ...prev, [partidoId]: null }))

    const { error: upsertError } = await supabase
      .from('predicciones')
      .upsert({
        user_id: user.id,
        partido_id: partidoId,
        goles_local_pred: parseInt(pred.goles_local_pred),
        goles_visita_pred: parseInt(pred.goles_visita_pred),
      }, { onConflict: 'user_id,partido_id' })

    setGuardando(prev => ({ ...prev, [partidoId]: false }))

    if (upsertError) {
      console.error('Error guardando:', upsertError)
      setError(prev => ({ ...prev, [partidoId]: 'Error al guardar' }))
    } else {
      setGuardado(prev => ({ ...prev, [partidoId]: true }))
      setTimeout(() => setGuardado(prev => ({ ...prev, [partidoId]: false })), 2500)
    }
  }

  const partidosGrupo = PARTIDOS.filter(p => p.grupo === grupoActivo)

  // Contar predicciones completadas en este grupo
  const completadasGrupo = partidosGrupo.filter(p => {
    const pred = predicciones[p.id]
    return pred?.goles_local_pred !== undefined && pred?.goles_local_pred !== null &&
           pred?.goles_visita_pred !== undefined && pred?.goles_visita_pred !== null
  }).length

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div className="loader" />
      <div style={{ color: 'var(--text2)', marginTop: 12, fontSize: 14 }}>Cargando predicciones...</div>
    </div>
  )

  return (
    <div className="page">
      <div className="flex-between mb-16">
        <div className="section-title" style={{ marginBottom: 0 }}>GRUPO <span>{grupoActivo}</span></div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          {completadasGrupo}/{partidosGrupo.length} listos
        </div>
      </div>

      {/* Tabs de grupos */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {GRUPOS_LETRAS.map(g => {
          const pts = PARTIDOS.filter(p => p.grupo === g)
          const completadas = pts.filter(p => {
            const pred = predicciones[p.id]
            return pred?.goles_local_pred !== undefined && pred?.goles_local_pred !== null
          }).length
          const completo = completadas === pts.length
          return (
            <button
              key={g}
              onClick={() => setGrupoActivo(g)}
              style={{
                background: grupoActivo === g ? 'var(--verde)' : completo ? 'rgba(0,200,83,0.1)' : 'var(--bg3)',
                color: grupoActivo === g ? '#000' : completo ? 'var(--verde)' : 'var(--text2)',
                border: '1px solid ' + (grupoActivo === g ? 'var(--verde)' : completo ? 'rgba(0,200,83,0.3)' : 'var(--border)'),
                borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.15s', position: 'relative'
              }}
            >
              {g}
              {completo && grupoActivo !== g && (
                <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 10 }}>✓</span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {partidosGrupo.map(partido => {
          const bloqueado = esPartidoBloqueado(partido)
          const pred = predicciones[partido.id] || {}
          const resultado = resultados[partido.id]
          const puntos = calcularPuntos(pred, resultado)
          const tienePred = pred.goles_local_pred !== undefined && pred.goles_local_pred !== null &&
                            pred.goles_visita_pred !== undefined && pred.goles_visita_pred !== null

          return (
            <div
              key={partido.id}
              className={`partido-card ${resultado?.goles_local !== null && resultado?.goles_local !== undefined ? 'jugado' : bloqueado ? 'en-curso' : 'pendiente'}`}
            >
              {/* Meta */}
              <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 4 }}>
                <span className="partido-meta">
                  {formatFecha(partido.fecha, partido.hora)} · {partido.estadio}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {bloqueado && resultado?.goles_local === undefined && <span className="badge badge-oro">En juego</span>}
                  {resultado?.goles_local !== undefined && resultado?.goles_local !== null && (
                    <span className="badge badge-verde">Jugado</span>
                  )}
                  {puntos === 3 && <span className="puntos-exacto">+3 exacto ⭐</span>}
                  {puntos === 1 && <span className="puntos-resultado">+1 resultado</span>}
                  {puntos === 0 && resultado?.goles_local !== null && resultado?.goles_local !== undefined && (
                    <span className="puntos-cero">+0</span>
                  )}
                </div>
              </div>

              {/* Equipos + inputs */}
              <div className="partido-teams">
                {/* Local */}
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 26 }}>{FLAGS[partido.local] || '🏳️'}</div>
                  <div className="team-name" style={{ marginTop: 4, fontSize: 13 }}>{partido.local}</div>
                </div>

                {/* Centro */}
                <div style={{ textAlign: 'center', padding: '0 12px', minWidth: 120 }}>
                  {resultado?.goles_local !== null && resultado?.goles_local !== undefined ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--verde)', minWidth: 32, textAlign: 'center' }}>
                          {resultado.goles_local}
                        </div>
                        <div style={{ color: 'var(--text2)', fontWeight: 700 }}>-</div>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--verde)', minWidth: 32, textAlign: 'center' }}>
                          {resultado.goles_visita}
                        </div>
                      </div>
                      {tienePred && (
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                          tu pred: {pred.goles_local_pred}-{pred.goles_visita_pred}
                        </div>
                      )}
                    </>
                  ) : bloqueado ? (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>cerrado</div>
                      {tienePred && (
                        <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', color: 'var(--oro)' }}>
                          {pred.goles_local_pred} - {pred.goles_visita_pred}
                        </div>
                      )}
                      {!tienePred && (
                        <div style={{ fontSize: 12, color: 'var(--rojo)' }}>sin pred</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="score-input" style={{ justifyContent: 'center' }}>
                        <input
                          type="number" min="0" max="99"
                          value={pred.goles_local_pred ?? ''}
                          onChange={e => handleChange(partido.id, 'goles_local_pred', e.target.value)}
                          onBlur={() => guardarPrediccion(partido.id)}
                          style={{ width: 50 }}
                          placeholder="?"
                        />
                        <span className="score-sep">-</span>
                        <input
                          type="number" min="0" max="99"
                          value={pred.goles_visita_pred ?? ''}
                          onChange={e => handleChange(partido.id, 'goles_visita_pred', e.target.value)}
                          onBlur={() => guardarPrediccion(partido.id)}
                          style={{ width: 50 }}
                          placeholder="?"
                        />
                      </div>
                      <div style={{ textAlign: 'center', height: 16, marginTop: 4 }}>
                        {guardando[partido.id] && <span style={{ fontSize: 11, color: 'var(--text2)' }}>guardando…</span>}
                        {guardado[partido.id] && <span style={{ fontSize: 11, color: 'var(--verde)' }}>✓ guardado</span>}
                        {error[partido.id] && <span style={{ fontSize: 11, color: '#ff5252' }}>{error[partido.id]}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Visita */}
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
        💡 Las predicciones se guardan automáticamente. Los grupos con ✓ están completos.
      </div>
    </div>
  )
}
