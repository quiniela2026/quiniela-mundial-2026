import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS } from '../lib/partidos'

export default function ProfilePage({ setTab }) {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: preds }, { data: resultados }, { data: allPreds }] = await Promise.all([
        supabase.from('predicciones').select('*').eq('user_id', user.id),
        supabase.from('resultados').select('*').not('goles_local', 'is', null),
        supabase.from('predicciones').select('user_id'),
      ])

      const resMap = {}
      resultados?.forEach(r => { resMap[r.partido_id] = r })

      let puntos = 0, exactos = 0, resultadosCorrectos = 0, completadas = 0
      preds?.forEach(pred => {
        if (pred.goles_local_pred !== null && pred.goles_visita_pred !== null) completadas++
        const res = resMap[pred.partido_id]
        if (!res) return
        const ga = parseInt(pred.goles_local_pred), gb = parseInt(pred.goles_visita_pred)
        const ra = res.goles_local, rb = res.goles_visita
        if (ga === ra && gb === rb) { puntos += 3; exactos++ }
        else {
          const pR = ga > gb ? 'L' : ga < gb ? 'V' : 'E'
          const rR = ra > rb ? 'L' : ra < rb ? 'V' : 'E'
          if (pR === rR) { puntos += 1; resultadosCorrectos++ }
        }
      })

      // Ranking position
      const userPuntosMap = {}
      allPreds?.forEach(p => { if (!userPuntosMap[p.user_id]) userPuntosMap[p.user_id] = 0 })
      // rough rank calc
      const { data: allPredsFull } = await supabase.from('predicciones').select('*')
      const puntosMap = {}
      allPredsFull?.forEach(pred => {
        const res = resMap[pred.partido_id]
        if (!res) return
        const ga = parseInt(pred.goles_local_pred), gb = parseInt(pred.goles_visita_pred)
        const ra = res.goles_local, rb = res.goles_visita
        if (!puntosMap[pred.user_id]) puntosMap[pred.user_id] = 0
        if (ga === ra && gb === rb) puntosMap[pred.user_id] += 3
        else {
          const pR = ga > gb ? 'L' : ga < gb ? 'V' : 'E'
          const rR = ra > rb ? 'L' : ra < rb ? 'V' : 'E'
          if (pR === rR) puntosMap[pred.user_id] += 1
        }
      })
      const misPuntos = puntosMap[user.id] || 0
      const mejores = Object.values(puntosMap).filter(p => p > misPuntos).length
      const posicion = mejores + 1

      setStats({
        puntos, exactos, resultadosCorrectos, completadas,
        totalPartidos: PARTIDOS.length,
        jugados: resultados?.length || 0,
        posicion,
        totalParticipantes: Object.keys(puntosMap).length || 1,
      })
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div className="page"><div className="loader" /></div>

  const pct = stats.totalPartidos > 0 ? Math.round((stats.completadas / stats.totalPartidos) * 100) : 0

  return (
    <div className="page">
      {/* Header */}
      <div className="card mb-16" style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.1) 0%, transparent 60%)' }}>
        <div className="flex-between">
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {profile?.nombre || user.email}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              {user.email}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--verde)', lineHeight: 1 }}>
              {stats.puntos}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>puntos</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 16 }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Predicciones completadas</span>
            <span style={{ fontSize: 13, color: 'var(--verde)', fontWeight: 600 }}>{stats.completadas}/{stats.totalPartidos}</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--verde)', borderRadius: 3,
              width: `${pct}%`, transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid2 mb-16">
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--oro)' }}>
            #{stats.posicion}
          </div>
          <div className="stat-label">Posición actual</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{stats.exactos}</div>
          <div className="stat-label">Marcadores exactos (+3)</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--oro)' }}>{stats.resultadosCorrectos}</div>
          <div className="stat-label">Resultados correctos (+1)</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--text2)' }}>{stats.jugados}</div>
          <div className="stat-label">Partidos con resultado</div>
        </div>
      </div>

      {/* CTA si faltan predicciones */}
      {stats.completadas < stats.totalPartidos && stats.jugados < stats.totalPartidos && (
        <div className="alert alert-warn">
          ⚽ Te faltan predicciones. ¡Completa el fixture antes de que empiecen los partidos!
          <button
            className="btn-primary mt-8"
            onClick={() => setTab && setTab('fixture')}
          >
            Ir al Fixture →
          </button>
        </div>
      )}

      {/* Signout */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button className="btn-ghost" onClick={signOut}>Cerrar sesión</button>
      </div>
    </div>
  )
}
