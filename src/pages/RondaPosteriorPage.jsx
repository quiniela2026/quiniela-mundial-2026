import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS_ELIMINATORIA, FLAGS_ELIM } from '../lib/eliminatoria/partidosEliminatoria'
import { LLAVES_OCTAVOS, LLAVES_CUARTOS, LLAVES_SEMIS, LLAVE_FINAL } from '../lib/bracket/estructuraBracket'
import Footer from '../components/Footer'

// ============================================================
// Config por ronda: qué llaves usa, y la cadena de rondas
// anteriores que hay que cargar para resolver la cascada
// completa hasta 16avos.
// ============================================================
const CONFIG_RONDAS = {
  octavos: { llaves: LLAVES_OCTAVOS, label: 'OCTAVOS', labelLarga: 'Octavos de Final', cadenaAnterior: [] },
  cuartos: { llaves: LLAVES_CUARTOS, label: 'CUARTOS', labelLarga: 'Cuartos de Final', cadenaAnterior: ['octavos'] },
  semis: { llaves: LLAVES_SEMIS, label: 'SEMIS', labelLarga: 'Semifinales', cadenaAnterior: ['octavos', 'cuartos'] },
  final: { llaves: [LLAVE_FINAL], label: 'FINAL', labelLarga: 'Final', cadenaAnterior: ['octavos', 'cuartos', 'semis'] },
}

function formatFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(`${fecha}T00:00:00-04:00`)
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Resultado real o predicción propia de un partido de 16avos -> { nombre, esReal }
function ganador16avos(partidoId, resultados16, predicciones16) {
  const partido = PARTIDOS_ELIMINATORIA.find(p => p.id === partidoId)
  if (!partido) return { nombre: null, esReal: false }

  const res = resultados16[partidoId]
  if (res && res.goles_local !== null && res.goles_local !== undefined) {
    if (res.goles_local > res.goles_visita) return { nombre: partido.local, esReal: true }
    if (res.goles_visita > res.goles_local) return { nombre: partido.visita, esReal: true }
    return { nombre: res.avanza || null, esReal: true }
  }

  const pred = predicciones16[partidoId]
  if (pred && pred.goles_local_pred !== null && pred.goles_local_pred !== undefined &&
      pred.goles_visita_pred !== null && pred.goles_visita_pred !== undefined) {
    const gl = parseInt(pred.goles_local_pred)
    const gv = parseInt(pred.goles_visita_pred)
    if (gl > gv) return { nombre: partido.local, esReal: false }
    if (gv > gl) return { nombre: partido.visita, esReal: false }
    return { nombre: pred.avanza_pred || null, esReal: false }
  }

  return { nombre: null, esReal: false }
}

// Resuelve quién ocupa un slot { ronda: N }. Si N < 200 viene de 16avos.
// Si no, viene del mapa "resueltos" de esa ronda (ya calculado previamente).
function resolverSlot(slot, resultados16, predicciones16, resueltosPorRonda) {
  if (slot.ronda < 200) return ganador16avos(slot.ronda, resultados16, predicciones16)
  // slot.ronda es el id de una llave de octavos/cuartos/semis -> buscamos en qué ronda vive ese id
  for (const nombreRonda of ['octavos', 'cuartos', 'semis']) {
    const mapa = resueltosPorRonda[nombreRonda]
    if (mapa && slot.ronda in mapa) return mapa[slot.ronda]
  }
  return { nombre: null, esReal: false }
}

// Dado el resultado real (si existe) o la predicción propia (si no), determina
// quién avanza de una llave ya con equipoA/equipoB resueltos (nombre, esReal).
function resolverGanadorLlave(llave, equipoA, equipoB, resultadosRonda, prediccionesRondaUser) {
  if (!equipoA.nombre || !equipoB.nombre) return { nombre: null, esReal: false }

  const real = resultadosRonda[llave.id]
  if (real && real.goles_local !== null && real.goles_local !== undefined) {
    let nombre = null
    if (real.goles_local > real.goles_visita) nombre = equipoA.nombre
    else if (real.goles_visita > real.goles_local) nombre = equipoB.nombre
    else nombre = real.avanza || null
    return { nombre, esReal: true }
  }

  const pred = prediccionesRondaUser[llave.id]
  if (pred && pred.goles_local_pred !== null && pred.goles_local_pred !== undefined &&
      pred.goles_visita_pred !== null && pred.goles_visita_pred !== undefined) {
    const gl = parseInt(pred.goles_local_pred)
    const gv = parseInt(pred.goles_visita_pred)
    let nombre = null
    if (gl > gv) nombre = equipoA.nombre
    else if (gv > gl) nombre = equipoB.nombre
    else nombre = pred.avanza_pred || null
    return { nombre, esReal: false }
  }

  return { nombre: null, esReal: false }
}

export default function RondaPosteriorPage({ ronda }) {
  const { user } = useAuth()
  const config = CONFIG_RONDAS[ronda]

  const [resultados16, setResultados16] = useState({})
  const [predicciones16, setPredicciones16] = useState({})
  // Para cada ronda en la cadena anterior (octavos/cuartos/semis): { resultados: {id: row}, predicciones: {id: row} }
  const [datosCadena, setDatosCadena] = useState({})

  const [resultadosRonda, setResultadosRonda] = useState({})
  const [predicciones, setPredicciones] = useState({})
  const [guardando, setGuardando] = useState({})
  const [guardado, setGuardado] = useState({})
  const [loading, setLoading] = useState(true)
  const [bloqueoGlobal, setBloqueoGlobal] = useState(false)
  const timerRef = useRef({})

  useEffect(() => {
    async function load() {
      setLoading(true)

      const tablasACargar = [
        supabase.from('resultados_eliminatoria').select('*'),
        supabase.from('predicciones_eliminatoria').select('*').eq('user_id', user.id),
        supabase.from(`resultados_${ronda}`).select('*'),
        supabase.from(`predicciones_${ronda}`).select('*').eq('user_id', user.id),
        supabase.from('configuracion').select('valor').eq('clave', `predicciones_bloqueadas_${ronda}`).single(),
        ...config.cadenaAnterior.flatMap(r => [
          supabase.from(`resultados_${r}`).select('*'),
          supabase.from(`predicciones_${r}`).select('*').eq('user_id', user.id),
        ]),
      ]

      const respuestas = await Promise.all(tablasACargar)
      const [
        { data: res16 },
        { data: pred16 },
        { data: resRonda },
        { data: predRonda },
        { data: configRonda },
      ] = respuestas

      const res16Map = {}
      res16?.forEach(r => { res16Map[r.partido_id] = r })
      setResultados16(res16Map)

      const pred16Map = {}
      pred16?.forEach(p => { pred16Map[p.partido_id] = p })
      setPredicciones16(pred16Map)

      const resRondaMap = {}
      resRonda?.forEach(r => { resRondaMap[r.id] = r })
      setResultadosRonda(resRondaMap)

      const predRondaMap = {}
      predRonda?.forEach(p => { predRondaMap[p.partido_id] = p })
      setPredicciones(predRondaMap)

      setBloqueoGlobal(configRonda?.valor === 'true')

      // Resto de respuestas: pares [resultados, predicciones] por cada ronda de la cadena anterior
      const cadenaData = {}
      config.cadenaAnterior.forEach((nombreRondaAnt, idx) => {
        const { data: resAnt } = respuestas[5 + idx * 2]
        const { data: predAnt } = respuestas[6 + idx * 2]
        const resMap = {}
        resAnt?.forEach(r => { resMap[r.id] = r })
        const predMap = {}
        predAnt?.forEach(p => { predMap[p.partido_id] = p })
        cadenaData[nombreRondaAnt] = { resultados: resMap, predicciones: predMap }
      })
      setDatosCadena(cadenaData)

      setLoading(false)
    }
    load()
  }, [user.id, ronda])

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
    if (esEmpatePred && !pred.avanza_pred) return

    setGuardando(prev => ({ ...prev, [partidoId]: true }))
    const { error } = await supabase.from(`predicciones_${ronda}`).upsert({
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
    } else {
      console.error(`Error guardando predicción ${ronda}:`, error)
    }
  }

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}><div className="loader" /></div>

  // ------------------------------------------------------------------
  // Resolver, en orden, cada ronda de la cadena anterior (de la más
  // temprana a la más tardía), para tener un mapa { idLlave: {nombre, esReal} }
  // por ronda, listo para que la ronda final (la que se está mostrando) lo use.
  // ------------------------------------------------------------------
  const resueltosPorRonda = {}
  config.cadenaAnterior.forEach(nombreRondaAnt => {
    const llavesDeEsaRonda = CONFIG_RONDAS[nombreRondaAnt].llaves
    const { resultados: resAnt = {}, predicciones: predAnt = {} } = datosCadena[nombreRondaAnt] || {}
    const mapaResuelto = {}
    llavesDeEsaRonda.forEach(llave => {
      const a = resolverSlot(llave.equipoA, resultados16, predicciones16, resueltosPorRonda)
      const b = resolverSlot(llave.equipoB, resultados16, predicciones16, resueltosPorRonda)
      mapaResuelto[llave.id] = resolverGanadorLlave(llave, a, b, resAnt, predAnt)
    })
    resueltosPorRonda[nombreRondaAnt] = mapaResuelto
  })

  // Ahora resolvemos los equipos A/B de CADA llave de la ronda que se está mostrando
  const llavesResueltas = config.llaves.map(llave => {
    const a = resolverSlot(llave.equipoA, resultados16, predicciones16, resueltosPorRonda)
    const b = resolverSlot(llave.equipoB, resultados16, predicciones16, resueltosPorRonda)
    return { ...llave, equipoANombre: a.nombre, equipoAEsReal: a.esReal, equipoBNombre: b.nombre, equipoBEsReal: b.esReal }
  })

  const completadas = llavesResueltas.filter(l => {
    const pred = predicciones[l.id]
    if (!pred || pred.goles_local_pred == null || pred.goles_visita_pred == null) return false
    const empatePred = parseInt(pred.goles_local_pred) === parseInt(pred.goles_visita_pred)
    return !empatePred || !!pred.avanza_pred
  }).length

  return (
    <div className="page">
      {bloqueoGlobal && (
        <div className="alert alert-warn mb-16" style={{ textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
          🔒 Las predicciones de {config.labelLarga.toLowerCase()} están cerradas.
        </div>
      )}

      <div className="flex-between mb-16">
        <div className="section-title" style={{ marginBottom: 0 }}>{config.label}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{completadas}/{llavesResueltas.length} listos</div>
      </div>

      <div className="alert alert-info mb-16">
        💡 Mientras un partido real no se haya jugado, usamos tu propia predicción de la ronda anterior para mostrarte quién jugaría aquí.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {llavesResueltas.map(llave => {
          const equiposListos = llave.equipoANombre && llave.equipoBNombre
          const resultado = resultadosRonda[llave.id]
          const jugado = resultado?.goles_local !== null && resultado?.goles_local !== undefined
          const pred = predicciones[llave.id] || {}
          const tienePred = pred.goles_local_pred !== undefined && pred.goles_local_pred !== null &&
                            pred.goles_visita_pred !== undefined && pred.goles_visita_pred !== null
          const prediceEmpate = tienePred && parseInt(pred.goles_local_pred) === parseInt(pred.goles_visita_pred)
          const bloqueado = bloqueoGlobal || jugado

          return (
            <div key={llave.id} className={`partido-card ${jugado ? 'jugado' : bloqueado ? 'en-curso' : 'pendiente'}`}>
              <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 4 }}>
                <span className="partido-meta">{formatFecha(llave.fecha)} · {llave.estadio}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {!equiposListos && <span className="badge badge-oro">⏳ Por definir</span>}
                  {bloqueado && !jugado && equiposListos && <span className="badge badge-oro">🔒 Cerrado</span>}
                  {jugado && <span className="badge badge-verde">Jugado</span>}
                </div>
              </div>

              <div className="partido-teams">
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 26 }}>{llave.equipoANombre ? (FLAGS_ELIM[llave.equipoANombre] || '🏳️') : '❔'}</div>
                  <div className="team-name" style={{ marginTop: 4, fontSize: 13 }}>{llave.equipoANombre || 'Por definir'}</div>
                  {llave.equipoANombre && !llave.equipoAEsReal && (
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>(tu predicción)</div>
                  )}
                </div>

                <div style={{ textAlign: 'center', padding: '0 12px', minWidth: 130 }}>
                  {!equiposListos ? (
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>Esperando resultado<br />de ronda anterior</div>
                  ) : jugado ? (
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
                            <input type="number" min="0" max="99" value={pred.goles_local_pred ?? ''} onChange={e => handleChange(llave.id, 'goles_local_pred', e.target.value)} onBlur={() => guardarPrediccion(llave.id)} style={{ width: 50 }} placeholder="?" />
                            <span className="score-sep">-</span>
                            <input type="number" min="0" max="99" value={pred.goles_visita_pred ?? ''} onChange={e => handleChange(llave.id, 'goles_visita_pred', e.target.value)} onBlur={() => guardarPrediccion(llave.id)} style={{ width: 50 }} placeholder="?" />
                          </div>

                          {prediceEmpate && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontSize: 11, color: 'var(--oro)', marginBottom: 4 }}>¿Quién avanza en penales?</div>
                              <select
                                value={pred.avanza_pred || ''}
                                onChange={e => { handleChange(llave.id, 'avanza_pred', e.target.value) }}
                                onBlur={() => guardarPrediccion(llave.id)}
                                style={{ fontSize: 12, padding: '4px 6px' }}
                              >
                                <option value="">Selecciona…</option>
                                <option value={llave.equipoANombre}>{llave.equipoANombre}</option>
                                <option value={llave.equipoBNombre}>{llave.equipoBNombre}</option>
                              </select>
                            </div>
                          )}

                          <div style={{ textAlign: 'center', height: 16, marginTop: 4 }}>
                            {guardando[llave.id] && <span style={{ fontSize: 11, color: 'var(--text2)' }}>guardando…</span>}
                            {guardado[llave.id] && <span style={{ fontSize: 11, color: 'var(--verde)' }}>✓ guardado</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 26 }}>{llave.equipoBNombre ? (FLAGS_ELIM[llave.equipoBNombre] || '🏳️') : '❔'}</div>
                  <div className="team-name" style={{ marginTop: 4, fontSize: 13 }}>{llave.equipoBNombre || 'Por definir'}</div>
                  {llave.equipoBNombre && !llave.equipoBEsReal && (
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>(tu predicción)</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Footer />
    </div>
  )
}
