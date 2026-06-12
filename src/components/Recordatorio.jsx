import { useEffect, useState } from 'react'
import { PARTIDOS } from '../lib/partidos'

export default function Recordatorio({ predicciones }) {
  const [alertas, setAlertas] = useState([])
  const [cerrados, setCerrados] = useState([])

  useEffect(() => {
    const ahora = new Date()
    const proximos = PARTIDOS.filter(p => {
      if (cerrados.includes(p.id)) return false
      const kickoff = new Date(`${p.fecha}T${p.hora}:00-04:00`)
      const diff = (kickoff - ahora) / 60000 // minutos
      const sinPred = predicciones[p.id]?.goles_local_pred === undefined ||
                      predicciones[p.id]?.goles_local_pred === null
      return diff > 0 && diff <= 120 && sinPred
    }).slice(0, 3)
    setAlertas(proximos)
  }, [predicciones, cerrados])

  if (alertas.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 64, right: 12, zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300
    }}>
      {alertas.map(p => {
        const kickoff = new Date(`${p.fecha}T${p.hora}:00-04:00`)
        const mins = Math.round((kickoff - new Date()) / 60000)
        return (
          <div key={p.id} style={{
            background: 'var(--bg2)', border: '1px solid rgba(255,214,0,0.4)',
            borderRadius: 10, padding: '10px 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 12, color: 'var(--oro)', fontWeight: 600, marginBottom: 4 }}>
                ⏰ En {mins} min
              </div>
              <button onClick={() => setCerrados(prev => [...prev, p.id])}
                style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 16, cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                ×
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
              {p.local} vs {p.visita}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
              Sin predicción — Grupo {p.grupo}
            </div>
          </div>
        )
      })}
    </div>
  )
}
