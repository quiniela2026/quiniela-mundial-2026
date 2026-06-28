import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS_ELIMINATORIA, FLAGS_ELIM } from '../lib/eliminatoria/partidosEliminatoria'
import { LLAVES_OCTAVOS, LLAVES_CUARTOS, LLAVES_SEMIS, LLAVE_FINAL } from '../lib/bracket/estructuraBracket'
import Footer from '../components/Footer'

// ============================================================
// Misma cascada que usa RondaPosteriorPage: resultado real > predicción
// propia del usuario. Aquí se aplica a las 4 rondas posteriores completas
// para poder dibujar el bracket entero (16avos -> Final).
// ============================================================
const RONDAS_EN_ORDEN = ['octavos', 'cuartos', 'semis']
const LLAVES_POR_RONDA = { octavos: LLAVES_OCTAVOS, cuartos: LLAVES_CUARTOS, semis: LLAVES_SEMIS }

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

function resolverSlot(slot, resultados16, predicciones16, resueltosPorRonda) {
  if (slot.ronda < 200) return ganador16avos(slot.ronda, resultados16, predicciones16)
  for (const nombreRonda of RONDAS_EN_ORDEN) {
    const mapa = resueltosPorRonda[nombreRonda]
    if (mapa && slot.ronda in mapa) return mapa[slot.ronda]
  }
  return { nombre: null, esReal: false }
}

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

// ============================================================
// UI
// ============================================================

function BracketSlot({ nombre, esGanador, esReal }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
      background: esGanador ? (esReal ? 'rgba(0,200,83,0.08)' : 'rgba(255,193,7,0.08)') : 'var(--bg3)',
      borderRadius: 6, fontSize: 12, fontWeight: esGanador ? 700 : 500,
      color: nombre ? 'var(--text)' : 'var(--text2)', minHeight: 28,
    }}>
      <span style={{ fontSize: 15 }}>{nombre ? (FLAGS_ELIM[nombre] || '🏳️') : '❔'}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{nombre || 'Por definir'}</span>
      {esGanador && !esReal && <span style={{ fontSize: 9, color: 'var(--oro)', whiteSpace: 'nowrap' }}>● pred</span>}
    </div>
  )
}

function LlaveCard({ nombreA, nombreB, ganadorNombre, ganadorEsReal, fecha, estadio, completado }) {
  return (
    <div className="card" style={{ padding: '10px 12px', marginBottom: 8, borderColor: completado ? (ganadorEsReal ? 'rgba(0,200,83,0.3)' : 'rgba(255,193,7,0.3)') : 'var(--border)' }}>
      <BracketSlot nombre={nombreA} esGanador={completado && ganadorNombre === nombreA} esReal={ganadorEsReal} />
      <div style={{ height: 4 }} />
      <BracketSlot nombre={nombreB} esGanador={completado && ganadorNombre === nombreB} esReal={ganadorEsReal} />
      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 6 }}>{fecha} · {estadio}</div>
    </div>
  )
}

export default function BracketPage() {
  const { user } = useAuth()
  const [resultados16, setResultados16] = useState({})
  const [predicciones16, setPredicciones16] = useState({})
  const [datosRondas, setDatosRondas] = useState({}) // { octavos: {resultados,predicciones}, cuartos:..., semis:..., final:... }
  const [loading, setLoading] = useState(true)
  const [verPrediccion, setVerPrediccion] = useState(true) // toggle: camino proyectado vs solo reales

  useEffect(() => {
    async function load() {
      setLoading(true)

      const cargas = [
        supabase.from('resultados_eliminatoria').select('*'),
        supabase.from('predicciones_eliminatoria').select('*').eq('user_id', user.id),
        ...['octavos', 'cuartos', 'semis', 'final'].flatMap(r => [
          supabase.from(`resultados_${r}`).select('*'),
          supabase.from(`predicciones_${r}`).select('*').eq('user_id', user.id),
        ]),
      ]

      const respuestas = await Promise.all(cargas)
      const [{ data: res16 }, { data: pred16 }] = respuestas

      const res16Map = {}
      res16?.forEach(r => { res16Map[r.partido_id] = r })
      setResultados16(res16Map)

      const pred16Map = {}
      pred16?.forEach(p => { pred16Map[p.partido_id] = p })
      setPredicciones16(pred16Map)

      const rondasData = {}
      ;['octavos', 'cuartos', 'semis', 'final'].forEach((nombreRonda, idx) => {
        const { data: resR } = respuestas[2 + idx * 2]
        const { data: predR } = respuestas[3 + idx * 2]
        const resMap = {}
        resR?.forEach(r => { resMap[r.id] = r })
        const predMap = {}
        predR?.forEach(p => { predMap[p.partido_id] = p })
        rondasData[nombreRonda] = { resultados: resMap, predicciones: predMap }
      })
      setDatosRondas(rondasData)

      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div className="page"><div className="loader" /></div>

  // Si "verPrediccion" está apagado, usamos mapas de predicciones vacíos para
  // que la cascada sólo avance con resultados reales (comportamiento original).
  const pred16Efectivo = verPrediccion ? predicciones16 : {}

  const resueltosPorRonda = {}
  RONDAS_EN_ORDEN.forEach(nombreRonda => {
    const llaves = LLAVES_POR_RONDA[nombreRonda]
    const { resultados: resR = {}, predicciones: predR = {} } = datosRondas[nombreRonda] || {}
    const predREfectivo = verPrediccion ? predR : {}
    const mapaResuelto = {}
    llaves.forEach(llave => {
      const a = resolverSlot(llave.equipoA, resultados16, pred16Efectivo, resueltosPorRonda)
      const b = resolverSlot(llave.equipoB, resultados16, pred16Efectivo, resueltosPorRonda)
      mapaResuelto[llave.id] = resolverGanadorLlave(llave, a, b, resR, predREfectivo)
    })
    resueltosPorRonda[nombreRonda] = mapaResuelto
  })

  const octavosInfo = LLAVES_OCTAVOS.map(llave => {
    const a = resolverSlot(llave.equipoA, resultados16, pred16Efectivo, resueltosPorRonda)
    const b = resolverSlot(llave.equipoB, resultados16, pred16Efectivo, resueltosPorRonda)
    const g = resueltosPorRonda.octavos[llave.id]
    return { ...llave, nombreA: a.nombre, nombreB: b.nombre, ganadorNombre: g.nombre, ganadorEsReal: g.esReal, completado: !!g.nombre }
  })

  const cuartosInfo = LLAVES_CUARTOS.map(llave => {
    const a = resolverSlot(llave.equipoA, resultados16, pred16Efectivo, resueltosPorRonda)
    const b = resolverSlot(llave.equipoB, resultados16, pred16Efectivo, resueltosPorRonda)
    const g = resueltosPorRonda.cuartos[llave.id]
    return { ...llave, nombreA: a.nombre, nombreB: b.nombre, ganadorNombre: g.nombre, ganadorEsReal: g.esReal, completado: !!g.nombre }
  })

  const semisInfo = LLAVES_SEMIS.map(llave => {
    const a = resolverSlot(llave.equipoA, resultados16, pred16Efectivo, resueltosPorRonda)
    const b = resolverSlot(llave.equipoB, resultados16, pred16Efectivo, resueltosPorRonda)
    const g = resueltosPorRonda.semis[llave.id]
    return { ...llave, nombreA: a.nombre, nombreB: b.nombre, ganadorNombre: g.nombre, ganadorEsReal: g.esReal, completado: !!g.nombre }
  })

  const finalA = resolverSlot(LLAVE_FINAL.equipoA, resultados16, pred16Efectivo, resueltosPorRonda)
  const finalB = resolverSlot(LLAVE_FINAL.equipoB, resultados16, pred16Efectivo, resueltosPorRonda)
  const { resultados: resFinal = {}, predicciones: predFinal = {} } = datosRondas.final || {}
  const predFinalEfectivo = verPrediccion ? predFinal : {}
  const ganadorFinal = resolverGanadorLlave(LLAVE_FINAL, finalA, finalB, resFinal, predFinalEfectivo)

  return (
    <div className="page">
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>BRACKET <span>COMPLETO</span></div>
        <button
          onClick={() => setVerPrediccion(v => !v)}
          style={{
            background: verPrediccion ? 'var(--oro)' : 'var(--bg3)',
            color: verPrediccion ? '#000' : 'var(--text2)',
            border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px',
            fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}
        >
          {verPrediccion ? '🔮 Mostrando tu camino proyectado' : '✅ Mostrando solo resultados reales'}
        </button>
      </div>

      <div className="alert alert-info mb-16">
        {verPrediccion
          ? '🏆 Este es tu camino proyectado: combina resultados reales ya jugados con tus propias predicciones donde aún no hay resultado.'
          : '🏆 El cuadro se actualiza solo cuando el Admin carga resultados reales. Las llaves siguen el bracket oficial de FIFA.'}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>16avos de Final</div>
      <div className="grid2" style={{ gap: 8, marginBottom: 20 }}>
        {PARTIDOS_ELIMINATORIA.map(p => {
          const g = ganador16avos(p.id, resultados16, pred16Efectivo)
          const res = resultados16[p.id]
          const jugado = res?.goles_local !== null && res?.goles_local !== undefined
          return (
            <LlaveCard key={p.id} nombreA={p.local} nombreB={p.visita} ganadorNombre={g.nombre} ganadorEsReal={g.esReal || jugado} fecha={p.fecha} estadio={p.estadio} completado={!!g.nombre} />
          )
        })}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>Octavos de Final</div>
      <div className="grid2" style={{ gap: 8, marginBottom: 20 }}>
        {octavosInfo.map(l => (
          <LlaveCard key={l.id} nombreA={l.nombreA} nombreB={l.nombreB} ganadorNombre={l.ganadorNombre} ganadorEsReal={l.ganadorEsReal} fecha={l.fecha} estadio={l.estadio} completado={l.completado} />
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>Cuartos de Final</div>
      <div className="grid2" style={{ gap: 8, marginBottom: 20 }}>
        {cuartosInfo.map(l => (
          <LlaveCard key={l.id} nombreA={l.nombreA} nombreB={l.nombreB} ganadorNombre={l.ganadorNombre} ganadorEsReal={l.ganadorEsReal} fecha={l.fecha} estadio={l.estadio} completado={l.completado} />
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>Semifinales</div>
      <div className="grid2" style={{ gap: 8, marginBottom: 20 }}>
        {semisInfo.map(l => (
          <LlaveCard key={l.id} nombreA={l.nombreA} nombreB={l.nombreB} ganadorNombre={l.ganadorNombre} ganadorEsReal={l.ganadorEsReal} fecha={l.fecha} estadio={l.estadio} completado={l.completado} />
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>🏆 Final</div>
      <div style={{ maxWidth: 320, margin: '0 auto 24px' }}>
        <LlaveCard nombreA={finalA.nombre} nombreB={finalB.nombre} ganadorNombre={ganadorFinal.nombre} ganadorEsReal={ganadorFinal.esReal} fecha={LLAVE_FINAL.fecha} estadio={LLAVE_FINAL.estadio} completado={!!ganadorFinal.nombre} />
      </div>

      {verPrediccion && (
        <div className="alert alert-info mt-16" style={{ fontSize: 12 }}>
          ● pred = ese equipo está ahí por tu predicción, no por un resultado real todavía.
        </div>
      )}

      <Footer />
    </div>
  )
}
