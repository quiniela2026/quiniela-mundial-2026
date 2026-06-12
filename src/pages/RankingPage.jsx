import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { PARTIDOS } from '../lib/partidos'
import { calcularPuntos, MAX_PUNTOS_TOTAL } from '../lib/puntos'
import Footer from '../components/Footer'

const GRUPOS_LETRAS = [...new Set(PARTIDOS.map(p => p.grupo))]

export default function RankingPage() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ jugados: 0, pendientes: 0 })
  const [vista, setVista] = useState('general') // 'general' | grupo letra
  const [puntosGrupo, setPuntosGrupo] = useState({}) // grupoLetra -> {userId -> pts}

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: predicciones }, { data: resultados }] = await Promise.all([
        supabase.from('profiles').select('id, nombre'),
        supabase.from('predicciones').select('*'),
        supabase.from('resultados').select('*').not('goles_local', 'is', null),
      ])
      const resMap = {}
      resultados?.forEach(r => { resMap[r.partido_id] = r })

      const puntosMap = {}, exactosMap = {}, cuatroMap = {}, tresMap = {}, unoMap = {}
      const grupoMap = {} // grupoLetra -> userId -> pts

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

        // Por grupo
        const partido = PARTIDOS.find(p => p.id === pred.partido_id)
        if (partido) {
          if (!grupoMap[partido.grupo]) grupoMap[partido.grupo] = {}
          if (!grupoMap[partido.grupo][pred.user_id]) grupoMap[partido.grupo][pred.user_id] = 0
          grupoMap[partido.grupo][pred.user_id] += pts
        }
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
      setPuntosGrupo(grupoMap)
      setStats({ jugados: resultados?.length || 0, pendientes: PARTIDOS.length - (resultados?.length || 0) })
      setLoading(false)
    }
    load()
  }, [user.id])

  // Ranking por grupo
  const rankingGrupo = vista !== 'general' ? ranking
    .map(r => ({ ...r, puntos: puntosGrupo[vista]?.[r.id] || 0 }))
    .sort((a, b) => b.puntos - a.puntos) : []

  const listaActual = vista === 'general' ? ranking : rankingGrupo

  if (loading) return <div className="page"><div className="loader" /></div>

  // Compartir por WhatsApp
  const miPos = ranking.findIndex(r => r.esYo) + 1
  const miPuntos = ranking.find(r => r.esYo)?.puntos || 0
  const lider = ranking[0]
  const whatsappText = `⚽ *Quiniela Mundial 2026*\n\nEstoy en el puesto #${miPos} con *${miPuntos} puntos*!\n${lider && !ranking.find(r=>r.esYo)?.esYo ? `El líder ${lider.nombre} lleva ${lider.puntos} pts` : '¡Voy liderando!'}\n\n¿Te apuntas? → https://quiniela-mundial-2026-murex.vercel.app/`

  return (
    <div className="page">
      <div className="flex-between mb-16">
        <div className="section-title" style={{ marginBottom: 0 }}>RANKING</div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#25d366', color: '#fff', borderRadius: 8,
            padding: '8px 14px', fontWeight: 600, fontSize: 13, textDecoration: 'none'
          }}
        >
          📱 Compartir
        </a>
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

      {/* Filtro general / por grupo */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setVista('general')} style={{
          background: vista === 'general' ? 'var(--verde)' : 'var(--bg3)',
          color: vista === 'general' ? '#000' : 'var(--text2)',
          border: '1px solid ' + (vista === 'general' ? 'var(--verde)' : 'var(--border)'),
          borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
        }}>General</button>
        {GRUPOS_LETRAS.map(g => (
          <button key={g} onClick={() => setVista(g)} style={{
            background: vista === g ? 'var(--oro)' : 'var(--bg3)',
            color: vista === g ? '#000' : 'var(--text2)',
            border: '1px solid ' + (vista === g ? 'var(--oro)' : 'var(--border)'),
            borderRadius: 8, padding: '6px 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer'
          }}>{g}</button>
        ))}
      </div>

      {vista !== 'general' && (
        <div className="alert alert-info mb-16">
          📊 Puntos acumulados en partidos del Grupo {vista}
        </div>
      )}

      <div className="card">
        {listaActual.length === 0 && (
          <div className="text-muted" style={{ textAlign: 'center', padding: 20 }}>Sin datos aún.</div>
        )}
        {listaActual.map((r, i) => (
          <div key={r.id} className="rank-row"
            style={r.esYo ? { background: 'rgba(0,200,83,0.05)', borderRadius: 8, padding: '12px 8px', margin: '0 -8px' } : {}}>
            <div className={`rank-pos ${i < 3 ? 'top' : ''}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div className="rank-name">
                {r.nombre} {r.esYo && <span className="badge badge-verde">tú</span>}
              </div>
              {vista === 'general' && (
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {r.exactos > 0 && <span className="puntos-5">⭐{r.exactos}</span>}
                  {r.cuatro > 0 && <span className="puntos-4">🎯{r.cuatro}</span>}
                  {r.tres > 0 && <span className="puntos-3">✅{r.tres}</span>}
                  {r.uno > 0 && <span className="puntos-1">〽️{r.uno}</span>}
                </div>
              )}
            </div>
            <div>
              <div className="rank-pts">{r.puntos}</div>
              {vista === 'general' && <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'right' }}>/{MAX_PUNTOS_TOTAL}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="card mt-16" style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sistema de puntos</div>
        {[
          { pts: '5 pts', label: 'Marcador exacto', clase: 'puntos-5', ej: 'Predijiste 2-1 → fue 2-1' },
          { pts: '4 pts', label: 'Ganador + un gol correcto', clase: 'puntos-4', ej: 'Predijiste 2-1 → fue 2-0' },
          { pts: '3 pts', label: 'Solo ganador o empate', clase: 'puntos-3', ej: 'Predijiste 2-1 → fue 3-0' },
          { pts: '1 pt',  label: 'Solo un marcador correcto', clase: 'puntos-1', ej: 'Predijiste 2-1 → fue 2-3' },
        ].map(item => (
          <div key={item.pts} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className={item.clase} style={{ minWidth: 44, textAlign: 'center' }}>{item.pts}</span>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.ej}</div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}
