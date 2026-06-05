import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS } from '../lib/partidos'
import { calcularPuntos, MAX_PUNTOS_TOTAL } from '../lib/puntos'
import Footer from '../components/Footer'

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

      const puntosMap = {}
      const exactosMap = {}
      const cuatroMap = {}
      const tresMap = {}
      const unoMap = {}

      predicciones?.forEach(pred => {
        const res = resMap[pred.partido_id]
        if (!res) return
        const pts = calcularPuntos(pred, res)
        if (pts === null) return
        if (!puntosMap[pred.user_id]) { puntosMap[pred.user_id] = 0; exactosMap[pred.user_id] = 0; cuatroMap[pred.user_id] = 0; tresMap[pred.user_id] = 0; unoMap[pred.user_id] = 0 }
        puntosMap[pred.user_id] += pts
        if (pts === 5) exactosMap[pred.user_id]++
        if (pts === 4) cuatroMap[pred.user_id]++
        if (pts === 3) tresMap[pred.user_id]++
        if (pts === 1) unoMap[pred.user_id]++
      })

      const rank = (profiles || []).map(p => ({
        ...p,
        puntos: puntosMap[p.id] || 0,
        exactos: exactosMap[p.id] || 0,
        cuatro: cuatroMap[p.id] || 0,
        tres: tresMap[p.id] || 0,
        uno: unoMap[p.id] || 0,
        esYo: p.id === user.id,
      })).sort((a, b) => b.puntos - a.puntos || b.exactos - a.exactos)

      setRanking(rank)
      setStats({ jugados: resultados?.length || 0, pendientes: PARTIDOS.length - (resultados?.length || 0) })
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">TABLA <span>GENERAL</span></div>

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

      <div className="card">
        {ranking.length === 0 && (
          <div className="text-muted" style={{ textAlign: 'center', padding: 20 }}>Aún no hay participantes.</div>
        )}
        {ranking.map((r, i) => (
          <div key={r.id} className="rank-row"
            style={r.esYo ? { background: 'rgba(0,200,83,0.05)', borderRadius: 8, padding: '12px 8px', margin: '0 -8px' } : {}}>
            <div className={`rank-pos ${i < 3 ? 'top' : ''}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div className="rank-name">
                {r.nombre} {r.esYo && <span className="badge badge-verde">tú</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.exactos > 0 && <span className="puntos-5">⭐{r.exactos}</span>}
                {r.cuatro > 0 && <span className="puntos-4">🎯{r.cuatro}</span>}
                {r.tres > 0 && <span className="puntos-3">✅{r.tres}</span>}
                {r.uno > 0 && <span className="puntos-1">〽️{r.uno}</span>}
              </div>
            </div>
            <div>
              <div className="rank-pts">{r.puntos}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'right' }}>/{MAX_PUNTOS_TOTAL}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda puntos */}
      <div className="card mt-16" style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sistema de puntos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { pts: '5 pts', label: 'Marcador exacto (ambos equipos)', clase: 'puntos-5', ej: 'Predijiste 2-1 → fue 2-1' },
            { pts: '4 pts', label: 'Ganador + marcador de un equipo', clase: 'puntos-4', ej: 'Predijiste 2-1 → fue 2-0' },
            { pts: '3 pts', label: 'Solo ganador o empate correcto', clase: 'puntos-3', ej: 'Predijiste 2-1 → fue 3-0' },
            { pts: '1 pt',  label: 'Solo marcador de un equipo',      clase: 'puntos-1', ej: 'Predijiste 2-1 → fue 2-3' },
          ].map(item => (
            <div key={item.pts} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={item.clase} style={{ minWidth: 44, textAlign: 'center' }}>{item.pts}</span>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.ej}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
