import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PARTIDOS } from '../lib/partidos'
import { calcularPuntos } from '../lib/puntos'
import Footer from '../components/Footer'

export default function GanadorPage() {
  const [ganador, setGanador] = useState(null)
  const [podio, setPodio] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalJugados, setTotalJugados] = useState(0)
  const [celebrar, setCelebrar] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: predicciones }, { data: resultados }] = await Promise.all([
        supabase.from('profiles').select('id, nombre'),
        supabase.from('predicciones').select('*'),
        supabase.from('resultados').select('*').not('goles_local', 'is', null),
      ])
      const resMap = {}
      resultados?.forEach(r => { resMap[r.partido_id] = r })
      setTotalJugados(resultados?.length || 0)

      const puntosMap = {}
      const detalleMap = {}
      predicciones?.forEach(pred => {
        const res = resMap[pred.partido_id]
        if (!res) return
        const pts = calcularPuntos(pred, res)
        if (pts === null) return
        if (!puntosMap[pred.user_id]) { puntosMap[pred.user_id] = 0; detalleMap[pred.user_id] = { exactos: 0, cuatro: 0, tres: 0 } }
        puntosMap[pred.user_id] += pts
        if (pts === 5) detalleMap[pred.user_id].exactos++
        if (pts === 4) detalleMap[pred.user_id].cuatro++
        if (pts === 3) detalleMap[pred.user_id].tres++
      })

      const rank = (profiles || []).map(p => ({
        ...p,
        puntos: puntosMap[p.id] || 0,
        ...detalleMap[p.id],
      })).sort((a, b) => b.puntos - a.puntos)

      setPodio(rank.slice(0, 3))
      setGanador(rank[0] || null)
      setLoading(false)
      setTimeout(() => setCelebrar(true), 300)
    }
    load()
  }, [])

  const terminado = totalJugados >= PARTIDOS.length

  if (loading) return <div className="page"><div className="loader" /></div>

  return (
    <div className="page">
      <div className="section-title">
        {terminado ? '🏆 GANADOR' : '📊 MARCADOR'} <span>ACTUAL</span>
      </div>

      {!terminado && (
        <div className="alert alert-info mb-16">
          ⚽ Faltan {PARTIDOS.length - totalJugados} partidos para terminar la fase de grupos.
          Este marcador se actualiza en tiempo real.
        </div>
      )}

      {/* Ganador / Líder */}
      {ganador && (
        <div style={{
          background: celebrar ? 'linear-gradient(135deg, rgba(255,214,0,0.15) 0%, rgba(0,200,83,0.1) 100%)' : 'var(--card)',
          border: '1px solid rgba(255,214,0,0.4)',
          borderRadius: 16, padding: '28px 20px', textAlign: 'center',
          marginBottom: 20, transition: 'background 1s ease'
        }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>
            {terminado ? '🥇' : '🔝'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--oro)', letterSpacing: '0.05em' }}>
            {ganador.nombre}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--verde)', lineHeight: 1, margin: '8px 0' }}>
            {ganador.puntos}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>puntos</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            {ganador.exactos > 0 && <span className="puntos-5">⭐ {ganador.exactos} exactos</span>}
            {ganador.cuatro > 0 && <span className="puntos-4">🎯 {ganador.cuatro} ganador+gol</span>}
            {ganador.tres > 0 && <span className="puntos-3">✅ {ganador.tres} ganadores</span>}
          </div>
          {terminado && (
            <div style={{ marginTop: 16 }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🏆 ¡El ganador de la Quiniela Mundial 2026 es *${ganador.nombre}* con ${ganador.puntos} puntos! ⚽🥇\n\nParticipa en la próxima: https://quiniela-mundial-2026-murex.vercel.app/`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#25d366', color: '#fff', borderRadius: 8,
                  padding: '10px 20px', fontWeight: 600, fontSize: 14, textDecoration: 'none'
                }}
              >
                📱 Compartir ganador en WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {/* Podio */}
      {podio.length >= 2 && (
        <div className="card mb-16">
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Podio
          </div>
          {podio.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: i < podio.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{ fontSize: 24, width: 36, textAlign: 'center' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
              </div>
              <div style={{ flex: 1, fontWeight: 500 }}>{p.nombre}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: i === 0 ? 'var(--oro)' : 'var(--text2)' }}>
                {p.puntos}
              </div>
            </div>
          ))}
        </div>
      )}

      {podio.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
          Aún no hay resultados cargados.
        </div>
      )}

      <Footer />
    </div>
  )
}
