import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PARTIDOS, FLAGS } from '../lib/partidos'
import { calcularPuntos, labelPuntos } from '../lib/puntos'
import Footer from '../components/Footer'

const GRUPOS_LETRAS = [...new Set(PARTIDOS.map(p => p.grupo))]

export default function ComparacionPage() {
  const [predicciones, setPredicciones] = useState({})
  const [resultados, setResultados] = useState({})
  const [grupoActivo, setGrupoActivo] = useState('A')
  const [loading, setLoading] = useState(true)
  const [partidoAbierto, setPartidoAbierto] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: preds }, { data: resuls }, { data: profs }] = await Promise.all([
        supabase.from('predicciones').select('*'),
        supabase.from('resultados').select('*').not('goles_local', 'is', null),
        supabase.from('profiles').select('id, nombre'),
      ])
      const profMap = {}
      profs?.forEach(p => { profMap[p.id] = p.nombre })

      const resMap = {}
      resuls?.forEach(r => { resMap[r.partido_id] = r })
      setResultados(resMap)

      // Agrupar predicciones por partido — TODOS los partidos, no solo los jugados
      const predMap = {}
      preds?.forEach(pred => {
        if (!predMap[pred.partido_id]) predMap[pred.partido_id] = []
        const res = resMap[pred.partido_id]
        const pts = res ? calcularPuntos(pred, res) : null
        predMap[pred.partido_id].push({
          nombre: profMap[pred.user_id] || 'Usuario',
          local: pred.goles_local_pred,
          visita: pred.goles_visita_pred,
          puntos: pts,
        })
      })
      // Ordenar: jugados por puntos desc, pendientes por nombre
      Object.keys(predMap).forEach(k => {
        const jugado = resMap[parseInt(k)]
        if (jugado) {
          predMap[k].sort((a, b) => (b.puntos ?? -1) - (a.puntos ?? -1))
        } else {
          predMap[k].sort((a, b) => a.nombre.localeCompare(b.nombre))
        }
      })
      setPredicciones(predMap)
      setLoading(false)
    }
    load()
  }, [])

  const partidosGrupo = PARTIDOS.filter(p => p.grupo === grupoActivo)
  // CAMBIO CLAVE: mostrar TODOS los partidos, no solo los jugados
  const partidosMostrar = partidosGrupo

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">TODOS <span>PREDIJERON</span></div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
        ✅ Las predicciones están bloqueadas — ya puedes ver las de todos
      </div>

      {/* Tabs grupos */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {GRUPOS_LETRAS.map(g => {
          const jugados = PARTIDOS.filter(p => p.grupo === g && resultados[p.id]).length
          const total = PARTIDOS.filter(p => p.grupo === g).length
          return (
            <button key={g} onClick={() => setGrupoActivo(g)} style={{
              background: grupoActivo === g ? 'var(--verde)' : 'var(--bg3)',
              color: grupoActivo === g ? '#000' : 'var(--text)',
              border: '1px solid ' + (grupoActivo === g ? 'var(--verde)' : 'var(--border)'),
              borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              position: 'relative'
            }}>
              {g}
              {jugados > 0 && grupoActivo !== g && (
                <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 9, background: 'var(--verde)', color: '#000', borderRadius: 10, padding: '1px 4px', fontWeight: 700 }}>
                  {jugados}/{total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {partidosMostrar.map(partido => {
          const res = resultados[partido.id]
          const jugado = res !== undefined && res !== null
          const preds = predicciones[partido.id] || []
          const abierto = partidoAbierto === partido.id

          return (
            <div key={partido.id} className={`card ${jugado ? '' : ''}`}
              style={{ cursor: 'pointer', borderColor: jugado ? 'rgba(0,200,83,0.2)' : 'var(--border)' }}
              onClick={() => setPartidoAbierto(abierto ? null : partido.id)}>

              {/* Header partido */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 20 }}>{FLAGS[partido.local] || '🏳️'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {partido.local} vs {partido.visita}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                    Grupo {partido.grupo} · {partido.fecha} · {partido.hora}
                  </div>
                </div>

                {/* Resultado real o estado */}
                {jugado ? (
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--verde)', margin: '0 6px' }}>
                    {res.goles_local} - {res.goles_visita}
                  </div>
                ) : (
                  <span className="badge badge-gray" style={{ margin: '0 6px' }}>
                    🔒 Pendiente
                  </span>
                )}

                <div style={{ fontSize: 20 }}>{FLAGS[partido.visita] || '🏳️'}</div>
                <div style={{ fontSize: 16, color: 'var(--text2)', marginLeft: 8 }}>
                  {abierto ? '▲' : '▼'}
                </div>
              </div>

              {/* Predicciones expandidas */}
              {abierto && (
                <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {preds.length} predicciones
                    {!jugado && <span style={{ color: 'var(--oro)', marginLeft: 8 }}>· resultado pendiente</span>}
                  </div>

                  {preds.length === 0 && (
                    <div style={{ color: 'var(--text2)', fontSize: 13 }}>Nadie predijo este partido</div>
                  )}

                  {preds.map((pred, i) => {
                    const pLabel = pred.puntos !== null ? labelPuntos(pred.puntos) : null
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 0',
                        borderBottom: i < preds.length - 1 ? '1px solid var(--border)' : 'none'
                      }}>
                        <div style={{ width: 20, textAlign: 'center', fontSize: 12, color: 'var(--text2)' }}>
                          {jugado ? i + 1 : '·'}
                        </div>
                        <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{pred.nombre}</div>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: 20,
                          color: pred.puntos === 5 ? 'var(--oro)' : pred.puntos > 0 ? 'var(--verde)' : jugado ? 'var(--text2)' : 'var(--text)',
                          minWidth: 60, textAlign: 'center'
                        }}>
                          {pred.local ?? '?'} - {pred.visita ?? '?'}
                        </div>
                        {jugado && pLabel && (
                          <span className={pLabel.clase} style={{ minWidth: 55, textAlign: 'center', fontSize: 11 }}>
                            {pLabel.texto}
                          </span>
                        )}
                        {jugado && pred.puntos === null && (
                          <span style={{ fontSize: 11, color: 'var(--text2)', minWidth: 55, textAlign: 'center' }}>sin pred</span>
                        )}
                        {!jugado && (
                          <span style={{ fontSize: 11, color: 'var(--text2)', minWidth: 55, textAlign: 'center' }}>⏳ en juego</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <Footer />
    </div>
  )
}
