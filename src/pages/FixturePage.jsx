import { useEffect, useState, useCallback } from 'react'
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
  if (!resultado || resultado.goles_local === null) return null
  const predGa = parseInt(pred.goles_local_pred)
  const predGb = parseInt(pred.goles_visita_pred)
  const realGa = resultado.goles_local
  const realGb = resultado.goles_visita
  if (predGa === realGa && predGb === realGb) return 3 // exacto
  const predResult = predGa > predGb ? 'L' : predGa < predGb ? 'V' : 'E'
  const realResult = realGa > realGb ? 'L' : realGa < realGb ? 'V' : 'E'
  if (predResult === realResult) return 1 // resultado correcto
  return 0
}

export default function FixturePage() {
  const { user } = useAuth()
  const [predicciones, setPredicciones] = useState({}) // partidoId -> {goles_local_pred, goles_visita_pred}
  const [resultados, setResultados] = useState({}) // partidoId -> {goles_local, goles_visita}
  const [guardando, setGuardando] = useState({})
  const [guardado, setGuardado] = useState({})
  const [grupoActivo, setGrupoActivo] = useState('A')
  const [loading, setLoading] = useState(true)

  // Cargar predicciones del usuario y resultados reales
  useEffect(() => {
    async function load() {
      const [{ data: preds }, { data: resuls }] = await Promise.all([
        supabase.from('predicciones').select('*').eq('user_id', user.id),
        supabase.from('resultados').select('*'),
      ])
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
      [partidoId]: { ...prev[partidoId], [campo]: val }
    }))
  }

  const guardarPrediccion = useCallback(async (partidoId) => {
    const pred = predicciones[partidoId]
    if (pred?.goles_local_pred === '' || pred?.goles_visita_pred === '' ||
        pred?.goles_local_pred === undefined || pred?.goles_visita_pred === undefined) return

    setGuardando(prev => ({ ...prev, [partidoId]: true }))
    const { error } = await supabase.from('predicciones').upsert({
      user_id: user.id,
      partido_id: partidoId,
      goles_local_pred: parseInt(pred.goles_local_pred),
      goles_visita_pred: parseInt(pred.goles_visita_pred),
    }, { onConflict: 'user_id,partido_id' })

    setGuardando(prev => ({ ...prev, [partidoId]: false }))
    if (!error) {
      setGuardado(prev => ({ ...prev, [partidoId]: true }))
      setTimeout(() => setGuardado(prev => ({ ...prev, [partidoId]: false })), 2000)
    }
  }, [predicciones, user.id])

  const partidosGrupo = PARTIDOS.filter(p => p.grupo === grupoActivo)

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">FIXTURE <span>{grupoActivo}</span></div>

      {/* Tabs de grupos */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {GRUPOS_LETRAS.map(g => (
          <button
            key={g}
            onClick={() => setGrupoActivo(g)}
            style={{
              background: grupoActivo === g ? 'var(--verde)' : 'var(--bg3)',
              color: grupoActivo === g ? '#000' : 'var(--text2)',
              border: '1px solid ' + (grupoActivo === g ? 'var(--verde)' : 'var(--border)'),
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
          const pred = predicciones[partido.id] || {}
          const resultado = resultados[partido.id]
          const puntos = resultado ? calcularPuntos(pred, resultado) : null

          return (
            <div
              key={partido.id}
              className={`partido-card ${resultado ? 'jugado' : bloqueado ? 'en-curso' : 'pendiente'}`}
            >
              {/* Meta */}
              <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 4 }}>
                <span className="partido-meta">
                  {formatFecha(partido.fecha, partido.hora)} · {partido.estadio}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {bloqueado && !resultado && <span className="badge badge-oro">En juego</span>}
                  {resultado && resultado.goles_local !== null && (
                    <span className="badge badge-verde">Jugado</span>
                  )}
                  {puntos === 3 && <span className="puntos-exacto">+3 exacto</span>}
                  {puntos === 1 && <span className="puntos-resultado">+1 resultado</span>}
                  {puntos === 0 && resultado && <span className="puntos-cero">+0</span>}
                </div>
              </div>

              {/* Equipos + inputs */}
              <div className="partido-teams">
                {/* Local */}
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 28 }}>{FLAGS[partido.local] || '🏳️'}</div>
                  <div className="team-name" style={{ marginTop: 4 }}>{partido.local}</div>
                </div>

                {/* Scores */}
                <div style={{ textAlign: 'center', padding: '0 12px' }}>
                  {resultado && resultado.goles_local !== null ? (
                    // Resultado real
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--verde)', minWidth: 36, textAlign: 'center' }}>
                        {resultado.goles_local}
                      </div>
                      <div style={{ color: 'var(--text2)', fontWeight: 700 }}>-</div>
                      <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--verde)', minWidth: 36, textAlign: 'center' }}>
                        {resultado.goles_visita}
                      </div>
                    </div>
                  ) : bloqueado ? (
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>cerrado</div>
                  ) : (
                    // Inputs de predicción
                    <div className="score-input">
                      <input
                        type="number" min="0" max="99"
                        value={pred.goles_local_pred ?? ''}
                        onChange={e => handleChange(partido.id, 'goles_local_pred', e.target.value)}
                        onBlur={() => guardarPrediccion(partido.id)}
                        style={{ width: 52 }}
                        placeholder="?"
                      />
                      <span className="score-sep">-</span>
                      <input
                        type="number" min="0" max="99"
                        value={pred.goles_visita_pred ?? ''}
                        onChange={e => handleChange(partido.id, 'goles_visita_pred', e.target.value)}
                        onBlur={() => guardarPrediccion(partido.id)}
                        style={{ width: 52 }}
                        placeholder="?"
                      />
                    </div>
                  )}

                  {/* Predicción del usuario si ya hay resultado */}
                  {resultado && resultado.goles_local !== null && pred.goles_local_pred !== undefined && (
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
                      Tu pred: {pred.goles_local_pred} - {pred.goles_visita_pred}
                    </div>
                  )}

                  {/* Indicator guardado */}
                  {guardando[partido.id] && <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>guardando…</div>}
                  {guardado[partido.id] && <div style={{ fontSize: 11, color: 'var(--verde)', marginTop: 4 }}>✓ guardado</div>}
                </div>

                {/* Visita */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 28 }}>{FLAGS[partido.visita] || '🏳️'}</div>
                  <div className="team-name" style={{ marginTop: 4 }}>{partido.visita}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="alert alert-info mt-24">
        💡 Las predicciones se guardan automáticamente al salir del campo. Se bloquean al inicio de cada partido.
      </div>
    </div>
  )
}
