import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PARTIDOS, FLAGS } from '../lib/partidos'
import { calcularPuntos, labelPuntos } from '../lib/puntos'
import Footer from '../components/Footer'

const GRUPOS_LETRAS = [...new Set(PARTIDOS.map(p => p.grupo))]

export default function ComparacionPage() {
  const [predicciones, setPredicciones] = useState({}) // partidoId -> [{ nombre, local, visita, puntos }]
  const [resultados, setResultados] = useState({})
  const [perfiles, setPerfiles] = useState({})
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
      setPerfiles(profMap)

      const resMap = {}
      resuls?.forEach(r => { resMap[r.partido_id] = r })
      setResultados(resMap)

      // Agrupar predicciones por partido
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
      // Ordenar por puntos desc
      Object.keys(predMap).forEach(k => {
        predMap[k].sort((a, b) => (b.puntos ?? -1) - (a.puntos ?? -1))
      })
      setPredicciones(predMap)
      setLoading(false)
    }
    load()
  }, [])

  const partidosGrupo = PARTIDOS.filter(p => p.grupo === grupoActivo)
  const jugadosGrupo = partidosGrupo.filter(p => resultados[p.id])

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">TODOS <span>PREDIJERON</span></div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
        Solo visible después de que termina cada partido
      </div>

      {/* Tabs grupos */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {GRUPOS_LETRAS.map(g => {
          const jugados = PARTIDOS.filter(p => p.grupo === g && resultados[p.id]).length
          return (
            <button key={g} onClick={() => setGrupoActivo(g)} style={{
              background: grupoActivo === g ? 'var(--verde)' : 'var(--bg3)',
              color: grupoActivo === g ? '#000' : jugados > 0 ? 'var(--text)' : 'var(--text2)',
              border: '1px solid ' + (grupoActivo === g ? 'var(--verde)' : 'var(--border)'),
              borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              position: 'relative'
            }}>
              {g}
              {jugados > 0 && grupoActivo !== g && (
                <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 9, background: 'var(--verde)', color: '#000', borderRadius: 10, padding: '1px 4px', fontWeight: 700 }}>{jugados}</span>
              )}
            </button>
          )
        })}
      </div>

      {jugadosGrupo.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>
          Aún no hay partidos jugados en el Grupo {grupoActivo}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jugadosGrupo.map(partido => {
            const res = resultados[partido.id]
            const preds = predicciones[partido.id] || []
            const abierto = partidoAbierto === partido.id

            return (
              <div key={partido.id} className="card" style={{ cursor: 'pointer' }}
                onClick={() => setPartidoAbierto(abierto ? null : partido.id)}>
                {/* Header partido */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 20 }}>{FLAGS[partido.local] || '🏳️'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{partido.local} vs {partido.visita}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>Grupo {partido.grupo} · {partido.fecha}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--verde)', margin: '0 8px' }}>
                    {res.goles_local} - {res.goles_visita}
                  </div>
                  <div style={{ fontSize: 20 }}>{FLAGS[partido.visita] || '🏳️'}</div>
                  <div style={{ fontSize: 18, color: 'var(--text2)', marginLeft: 8 }}>{abierto ? '▲' : '▼'}</div>
                </div>

                {/* Predicciones expandidas */}
                {abierto && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Predicciones de {preds.length} participantes
                    </div>
                    {preds.length === 0 && <div style={{ color: 'var(--text2)', fontSize: 13 }}>Nadie predijo este partido</div>}
                    {preds.map((pred, i) => {
                      const pLabel = pred.puntos !== null ? labelPuntos(pred.puntos) : null
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 0', borderBottom: i < preds.length - 1 ? '1px solid var(--border)' : 'none'
                        }}>
                          <div style={{ width: 24, textAlign: 'center', fontSize: 13, color: 'var(--text2)' }}>{i + 1}</div>
                          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{pred.nombre}</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: pred.puntos === 5 ? 'var(--oro)' : pred.puntos > 0 ? 'var(--verde)' : 'var(--text2)', minWidth: 60, textAlign: 'center' }}>
                            {pred.local ?? '?'} - {pred.visita ?? '?'}
                          </div>
                          {pLabel && <span className={pLabel.clase} style={{ minWidth: 60, textAlign: 'center' }}>{pLabel.texto}</span>}
                          {pred.puntos === null && <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 60, textAlign: 'center' }}>sin pred</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <Footer />
    </div>
  )
}
