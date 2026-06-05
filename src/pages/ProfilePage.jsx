import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS } from '../lib/partidos'
import { calcularPuntos, MAX_PUNTOS_TOTAL } from '../lib/puntos'
import Footer from '../components/Footer'

export default function ProfilePage({ setTab }) {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: preds }, { data: resultados }, { data: allPredsFull }] = await Promise.all([
        supabase.from('predicciones').select('*').eq('user_id', user.id),
        supabase.from('resultados').select('*').not('goles_local', 'is', null),
        supabase.from('predicciones').select('*'),
      ])
      const resMap = {}
      resultados?.forEach(r => { resMap[r.partido_id] = r })

      let puntos = 0, exactos = 0, cuatro = 0, tres = 0, uno = 0, completadas = 0
      preds?.forEach(pred => {
        if (pred.goles_local_pred !== null && pred.goles_visita_pred !== null) completadas++
        const res = resMap[pred.partido_id]
        if (!res) return
        const pts = calcularPuntos(pred, res)
        if (pts === null) return
        puntos += pts
        if (pts === 5) exactos++
        if (pts === 4) cuatro++
        if (pts === 3) tres++
        if (pts === 1) uno++
      })

      // Ranking position
      const puntosMap = {}
      allPredsFull?.forEach(pred => {
        const res = resMap[pred.partido_id]
        if (!res) return
        const pts = calcularPuntos(pred, res)
        if (pts === null) return
        if (!puntosMap[pred.user_id]) puntosMap[pred.user_id] = 0
        puntosMap[pred.user_id] += pts
      })
      const misPuntos = puntosMap[user.id] || 0
      const posicion = Object.values(puntosMap).filter(p => p > misPuntos).length + 1

      setStats({ puntos, exactos, cuatro, tres, uno, completadas, totalPartidos: PARTIDOS.length, jugados: resultados?.length || 0, posicion, totalParticipantes: Object.keys(puntosMap).length || 1 })
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div className="page"><div className="loader" /></div>

  const pct = stats.totalPartidos > 0 ? Math.round((stats.completadas / stats.totalPartidos) * 100) : 0

  return (
    <div className="page">
      <div className="card mb-16" style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.1) 0%, transparent 60%)' }}>
        <div className="flex-between">
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{profile?.nombre || user.email}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{user.email}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--verde)', lineHeight: 1 }}>{stats.puntos}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>puntos</div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Predicciones completadas</span>
            <span style={{ fontSize: 13, color: 'var(--verde)', fontWeight: 600 }}>{stats.completadas}/{stats.totalPartidos}</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--verde)', borderRadius: 3, width: `${pct}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      <div className="grid2 mb-16">
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--oro)' }}>#{stats.posicion}</div>
          <div className="stat-label">Posición actual</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{stats.exactos}</div>
          <div className="stat-label">⭐ Exactos (5pts)</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--verde)' }}>{stats.cuatro}</div>
          <div className="stat-label">🎯 Ganador+gol (4pts)</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: '#69f0ae' }}>{stats.tres}</div>
          <div className="stat-label">✅ Solo ganador (3pts)</div>
        </div>
      </div>

      {stats.completadas < stats.totalPartidos && (
        <div className="alert alert-warn">
          ⚽ Te faltan predicciones. ¡Completa el fixture!
          <button className="btn-primary mt-8" onClick={() => setTab && setTab('fixture')}>Ir al Fixture →</button>
        </div>
      )}

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button className="btn-ghost" onClick={signOut}>Cerrar sesión</button>
      </div>

      <Footer />
    </div>
  )
}
