import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS } from '../lib/partidos'

export default function RankingPage() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ jugados: 0, pendientes: 0 })

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: predicciones }, { data: resultados }] = await Promise.all([
        supabase.from('profiles').select('id, nombre'),
        supabase.from('predicciones').select('*'),
        supabase.from('resultados').select('*').not('goles_local', 'is', null),
      ])

      const resMap = {}
      resultados?.forEach(r => { resMap[r.partido_id] = r })

      // calcular puntos por usuario
      const puntosMap = {}
      const exactosMap = {}
      const resultadosMap = {}

      predicciones?.forEach(pred => {
        const res = resMap[pred.partido_id]
        if (!res) return
        const ga = parseInt(pred.goles_local_pred)
        const gb = parseInt(pred.goles_visita_pred)
        const ra = res.goles_local
        const rb = res.goles_visita
        if (!puntosMap[pred.user_id]) { puntosMap[pred.user_id] = 0; exactosMap[pred.user_id] = 0; resultadosMap[pred.user_id] = 0 }
        if (ga === ra && gb === rb) {
          puntosMap[pred.user_id] += 3
          exactosMap[pred.user_id]++
        } else {
          const predRes = ga > gb ? 'L' : ga < gb ? 'V' : 'E'
          const realRes = ra > rb ? 'L' : ra < rb ? 'V' : 'E'
          if (predRes === realRes) {
            puntosMap[pred.user_id] += 1
            resultadosMap[pred.user_id]++
          }
        }
      })

      const rank = (profiles || []).map(p => ({
        ...p,
        puntos: puntosMap[p.id] || 0,
        exactos: exactosMap[p.id] || 0,
        resultados: resultadosMap[p.id] || 0,
        esYo: p.id === user.id,
      })).sort((a, b) => b.puntos - a.puntos || b.exactos - a.exactos)

      setRanking(rank)
      setStats({
        jugados: resultados?.length || 0,
        pendientes: PARTIDOS.length - (resultados?.length || 0),
      })
      setLoading(false)
    }
    load()
  }, [user.id])

  const MAX_PUNTOS = PARTIDOS.length * 3

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">TABLA <span>GENERAL</span></div>

      {/* Stats */}
      <div className="grid2 mb-16">
        <div className="card stat-card">
          <div className="stat-number">{stats.jugados}</div>
          <div className="stat-label">Partidos jugados</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--text2)' }}>{stats.pendientes}</div>
          <div className="stat-label">Por jugar</div>
        </div>
      </div>

      {/* Ranking */}
      <div className="card">
        {ranking.length === 0 && (
          <div className="text-muted" style={{ textAlign: 'center', padding: 20 }}>
            Aún no hay participantes registrados.
          </div>
        )}
        {ranking.map((r, i) => (
          <div
            key={r.id}
            className="rank-row"
            style={r.esYo ? { background: 'rgba(0,200,83,0.05)', borderRadius: 8, padding: '12px 8px', margin: '0 -8px' } : {}}
          >
            <div className={`rank-pos ${i < 3 ? 'top' : ''}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div className="rank-name">
                {r.nombre} {r.esYo && <span className="badge badge-verde">tú</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                {r.exactos} exactos · {r.resultados} resultados
              </div>
            </div>
            <div>
              <div className="rank-pts">{r.puntos}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'right' }}>
                /{MAX_PUNTOS} pts
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info mt-24">
        🏆 <strong>Sistema de puntos:</strong> 3 pts por marcador exacto · 1 pt por resultado correcto (ganador/empate)
      </div>
    </div>
  )
}
