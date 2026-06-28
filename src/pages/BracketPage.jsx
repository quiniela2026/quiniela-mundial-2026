import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PARTIDOS_ELIMINATORIA, FLAGS_ELIM } from '../lib/eliminatoria/partidosEliminatoria'
import { LLAVES_OCTAVOS, LLAVES_CUARTOS, LLAVES_SEMIS, LLAVE_FINAL } from '../lib/bracket/estructuraBracket'
import Footer from '../components/Footer'

// Determina el nombre del equipo que avanzó de un partido de 16avos, dado el resultado
function ganador16avos(partidoId, resultados) {
  const partido = PARTIDOS_ELIMINATORIA.find(p => p.id === partidoId)
  const res = resultados[partidoId]
  if (!partido || !res || res.goles_local === null || res.goles_local === undefined) return null
  if (res.goles_local > res.goles_visita) return partido.local
  if (res.goles_visita > res.goles_local) return partido.visita
  return res.avanza || null // empate -> definido por penales
}

// Resuelve recursivamente quién ocupa un slot (puede venir de 16avos o de una ronda posterior ya resuelta)
function resolverEquipo(slot, resultados, resueltos) {
  if (slot.ronda < 200) return ganador16avos(slot.ronda, resultados)
  return resueltos[slot.ronda] || null
}

function BracketSlot({ nombre, esGanador }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
      background: esGanador ? 'rgba(0,200,83,0.08)' : 'var(--bg3)',
      borderRadius: 6, fontSize: 12, fontWeight: esGanador ? 700 : 500,
      color: nombre ? 'var(--text)' : 'var(--text2)', minHeight: 28,
    }}>
      <span style={{ fontSize: 15 }}>{nombre ? (FLAGS_ELIM[nombre] || '🏳️') : '❔'}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre || 'Por definir'}</span>
    </div>
  )
}

function LlaveCard({ nombreA, nombreB, ganadorNombre, fecha, estadio, completado }) {
  return (
    <div className="card" style={{ padding: '10px 12px', marginBottom: 8, borderColor: completado ? 'rgba(0,200,83,0.3)' : 'var(--border)' }}>
      <BracketSlot nombre={nombreA} esGanador={completado && ganadorNombre === nombreA} />
      <div style={{ height: 4 }} />
      <BracketSlot nombre={nombreB} esGanador={completado && ganadorNombre === nombreB} />
      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 6 }}>{fecha} · {estadio}</div>
    </div>
  )
}

export default function BracketPage() {
  const [resultados16, setResultados16] = useState({})
  const [resultadosOctavos, setResultadosOctavos] = useState({})
  const [resultadosCuartos, setResultadosCuartos] = useState({})
  const [resultadosSemis, setResultadosSemis] = useState({})
  const [resultadoFinal, setResultadoFinal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Para esta primera versión, sólo 16avos tiene datos reales en Supabase.
      // Octavos/cuartos/semis/final se preparan para cuando se creen sus tablas — por ahora avanzan vacíos.
      const { data } = await supabase.from('resultados_eliminatoria').select('*')
      const map = {}
      data?.forEach(r => { map[r.partido_id] = r })
      setResultados16(map)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="page"><div className="loader" /></div>

  // Resolver octavos
  const octavosResueltos = {}
  const octavosInfo = LLAVES_OCTAVOS.map(llave => {
    const nombreA = resolverEquipo(llave.equipoA, resultados16, {})
    const nombreB = resolverEquipo(llave.equipoB, resultados16, {})
    const resOct = resultadosOctavos[llave.id]
    let ganadorNombre = null
    if (resOct && nombreA && nombreB) {
      if (resOct.goles_local > resOct.goles_visita) ganadorNombre = nombreA
      else if (resOct.goles_visita > resOct.goles_local) ganadorNombre = nombreB
      else ganadorNombre = resOct.avanza || null
    }
    if (ganadorNombre) octavosResueltos[llave.id] = ganadorNombre
    return { ...llave, nombreA, nombreB, ganadorNombre, completado: !!ganadorNombre }
  })

  // Resolver cuartos
  const cuartosResueltos = {}
  const cuartosInfo = LLAVES_CUARTOS.map(llave => {
    const nombreA = resolverEquipo(llave.equipoA, resultados16, octavosResueltos)
    const nombreB = resolverEquipo(llave.equipoB, resultados16, octavosResueltos)
    const resCua = resultadosCuartos[llave.id]
    let ganadorNombre = null
    if (resCua && nombreA && nombreB) {
      if (resCua.goles_local > resCua.goles_visita) ganadorNombre = nombreA
      else if (resCua.goles_visita > resCua.goles_local) ganadorNombre = nombreB
      else ganadorNombre = resCua.avanza || null
    }
    if (ganadorNombre) cuartosResueltos[llave.id] = ganadorNombre
    return { ...llave, nombreA, nombreB, ganadorNombre, completado: !!ganadorNombre }
  })

  // Resolver semis
  const semisResueltos = {}
  const semisInfo = LLAVES_SEMIS.map(llave => {
    const nombreA = resolverEquipo(llave.equipoA, resultados16, cuartosResueltos)
    const nombreB = resolverEquipo(llave.equipoB, resultados16, cuartosResueltos)
    const resSemi = resultadosSemis[llave.id]
    let ganadorNombre = null
    if (resSemi && nombreA && nombreB) {
      if (resSemi.goles_local > resSemi.goles_visita) ganadorNombre = nombreA
      else if (resSemi.goles_visita > resSemi.goles_local) ganadorNombre = nombreB
      else ganadorNombre = resSemi.avanza || null
    }
    if (ganadorNombre) semisResueltos[llave.id] = ganadorNombre
    return { ...llave, nombreA, nombreB, ganadorNombre, completado: !!ganadorNombre }
  })

  // Final
  const finalNombreA = resolverEquipo(LLAVE_FINAL.equipoA, resultados16, semisResueltos)
  const finalNombreB = resolverEquipo(LLAVE_FINAL.equipoB, resultados16, semisResueltos)
  let finalGanador = null
  if (resultadoFinal && finalNombreA && finalNombreB) {
    if (resultadoFinal.goles_local > resultadoFinal.goles_visita) finalGanador = finalNombreA
    else if (resultadoFinal.goles_visita > resultadoFinal.goles_local) finalGanador = finalNombreB
    else finalGanador = resultadoFinal.avanza || null
  }

  return (
    <div className="page">
      <div className="section-title">BRACKET <span>COMPLETO</span></div>
      <div className="alert alert-info mb-16">
        🏆 El cuadro se actualiza solo cuando el Admin carga resultados reales. Las llaves siguen el bracket oficial de FIFA.
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>16avos de Final</div>
      <div className="grid2" style={{ gap: 8, marginBottom: 20 }}>
        {PARTIDOS_ELIMINATORIA.map(p => {
          const res = resultados16[p.id]
          const jugado = res?.goles_local !== null && res?.goles_local !== undefined
          let ganador = null
          if (jugado) {
            if (res.goles_local > res.goles_visita) ganador = p.local
            else if (res.goles_visita > res.goles_local) ganador = p.visita
            else ganador = res.avanza
          }
          return (
            <LlaveCard key={p.id} nombreA={p.local} nombreB={p.visita} ganadorNombre={ganador} fecha={p.fecha} estadio={p.estadio} completado={jugado} />
          )
        })}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>Octavos de Final</div>
      <div className="grid2" style={{ gap: 8, marginBottom: 20 }}>
        {octavosInfo.map(l => (
          <LlaveCard key={l.id} nombreA={l.nombreA} nombreB={l.nombreB} ganadorNombre={l.ganadorNombre} fecha={l.fecha} estadio={l.estadio} completado={l.completado} />
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>Cuartos de Final</div>
      <div className="grid2" style={{ gap: 8, marginBottom: 20 }}>
        {cuartosInfo.map(l => (
          <LlaveCard key={l.id} nombreA={l.nombreA} nombreB={l.nombreB} ganadorNombre={l.ganadorNombre} fecha={l.fecha} estadio={l.estadio} completado={l.completado} />
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>Semifinales</div>
      <div className="grid2" style={{ gap: 8, marginBottom: 20 }}>
        {semisInfo.map(l => (
          <LlaveCard key={l.id} nombreA={l.nombreA} nombreB={l.nombreB} ganadorNombre={l.ganadorNombre} fecha={l.fecha} estadio={l.estadio} completado={l.completado} />
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--oro)', marginBottom: 8, textTransform: 'uppercase' }}>🏆 Final</div>
      <div style={{ maxWidth: 320, margin: '0 auto 24px' }}>
        <LlaveCard nombreA={finalNombreA} nombreB={finalNombreB} ganadorNombre={finalGanador} fecha={LLAVE_FINAL.fecha} estadio={LLAVE_FINAL.estadio} completado={!!finalGanador} />
      </div>

      <Footer />
    </div>
  )
}
