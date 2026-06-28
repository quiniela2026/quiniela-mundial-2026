import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS_ELIMINATORIA } from '../lib/eliminatoria/partidosEliminatoria'
import { calcularPuntosEliminatoria, MAX_PUNTOS_ELIMINATORIA } from '../lib/eliminatoria/puntosEliminatoria'
import Footer from '../components/Footer'

export default function RankingEliminatoriaPage() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ jugados: 0, pendientes: 0 })

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: predicciones }, { data: resultados }] = await Promise.all([
        supabase.from('profiles').select('id, nombre'),
        supabase.from('predicciones_eliminatoria').select('*'),
        supabase.from('resultados_eliminatoria').select('*').not('goles_local', 'is', null),
      ])
      const resMap = {}
      resultados?.forEach(r => { resMap[r.partido_id] = r })

      const puntosMap = {}, exactosMap = {}, avanceMap = {}, soloAvanceMap = {}, empateMap = {}
      predicciones?.forEach(pred => {
        const res = resMap[pred.partido_id]
        const partido = PARTIDOS_ELIMINATORIA.find(p => p.id === pred.partido_id)
        if (!res || !partido) return
        const pts = calcularPuntosEliminatoria(partido, pred, res)
        if (pts === null) return
        if (!puntosMap[pred.user_id]) {
          puntosMap[pred.user_id] = 0; exactosMap[pred.user_id] = 0
          avanceMap[pred.user_id] = 0; soloAvanceMap[pred.user_id] = 0; empateMap[pred.user_id] = 0
        }
        puntosMap[pred.user_id] += pts
        if (pts === 5) exactosMap[pred.user_id]++
        if (pts === 3) avanceMap[pred.user_id]++
        if (pts === 2) soloAvanceMap[pred.user_id]++
        if (pts === 1) empateMap[pred.user_id]++
      })

      const rank = (profiles || []).map(p => ({
        ...p,
        puntos: puntosMap[p.id] || 0,
        exactos: exactosMap[p.id] || 0,
        avance: avanceMap[p.id] || 0,
        soloAvance: soloAvanceMap[p.id] || 0,
        empate: empateMap[p.id] || 0,
        esYo: p.id === user.id,
      })).sort((a, b) => b.puntos - a.puntos || b.exactos - a.exactos)

      setRanking(rank)
      setStats({ jugados: resultados?.length || 0, pendientes: PARTIDOS_ELIMINATORIA.length - (resultados?.length || 0) })
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div className="page"><div className="loader" /></div>

  const miPos = ranking.findIndex(r => r.esYo) + 1
  const miPuntos = ranking.find(r => r.esYo)?.puntos || 0
  const lider = ranking[0]
  const whatsappText = `🏆 *Quiniela Mundial 2026 — Eliminatoria*\n\nEstoy en el puesto #${miPos} con *${miPuntos} puntos*!\n${lider && !ranking.find(r=>r.esYo)?.esYo ? `El líder ${lider.nombre} lleva ${lider.puntos} pts` : '¡Voy liderando!'}\n\n¿Te apuntas? → https://quiniela-mundial-2026-murex.vercel.app/`

  return (
    <div className="page">
      <div className="flex-between mb-16">
        <div className="section-title" style={{ marginBottom: 0 }}>RANKING <span>ELIMINATORIA</span></div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25d366', color: '#fff', borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
        >
          📱 Compartir
        </a>
      </div>

      <div className="alert alert-info mb-16">
        🆕 Este ranking es independiente del de fase de grupos — empieza desde cero.
      </div>

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
          <div className="text-muted" style={{ textAlign: 'center', padding: 20 }}>Sin datos aún.</div>
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
                {r.avance > 0 && <span className="puntos-4">🎯{r.avance}</span>}
                {r.soloAvance > 0 && <span className="puntos-3">✅{r.soloAvance}</span>}
                {r.empate > 0 && <span className="puntos-1">〽️{r.empate}</span>}
              </div>
            </div>
            <div>
              <div className="rank-pts">{r.puntos}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'right' }}>/{PARTIDOS_ELIMINATORIA.length * MAX_PUNTOS_ELIMINATORIA}</div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}
