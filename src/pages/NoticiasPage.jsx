import { useEffect, useState } from 'react'
import Footer from '../components/Footer'

// GNews API — gratis hasta 100 req/día
// El usuario necesita registrarse en gnews.io para obtener su API key gratis
const GNEWS_KEY = import.meta.env.VITE_GNEWS_KEY

const QUERIES = [
  'FIFA World Cup 2026',
  'Mundial FIFA 2026',
  'Copa del Mundo 2026',
]

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff/60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff/3600)} h`
  return `hace ${Math.floor(diff/86400)} días`
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState(0)

  useEffect(() => {
    fetchNoticias(filtro)
  }, [filtro])

  async function fetchNoticias(queryIdx) {
    setLoading(true)
    setError(null)
    try {
      if (!GNEWS_KEY) {
        // Modo demo sin API key
        setNoticias(NOTICIAS_DEMO)
        setLoading(false)
        return
      }
      const q = encodeURIComponent(QUERIES[queryIdx])
      const url = `https://gnews.io/api/v4/search?q=${q}&lang=es&max=10&apikey=${GNEWS_KEY}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.errors) throw new Error(data.errors[0])
      setNoticias(data.articles || [])
    } catch (e) {
      console.error(e)
      setNoticias(NOTICIAS_DEMO)
      setError('Usando noticias de muestra — configura VITE_GNEWS_KEY para noticias en vivo')
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="section-title">NOTICIAS <span>MUNDIAL</span></div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {['En español', 'FIFA 2026', 'Copa del Mundo'].map((label, i) => (
          <button key={i} onClick={() => setFiltro(i)} style={{
            background: filtro === i ? 'var(--verde)' : 'var(--bg3)',
            color: filtro === i ? '#000' : 'var(--text2)',
            border: '1px solid ' + (filtro === i ? 'var(--verde)' : 'var(--border)'),
            borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
          }}>{label}</button>
        ))}
        <button onClick={() => fetchNoticias(filtro)} style={{
          background: 'var(--bg3)', color: 'var(--text2)',
          border: '1px solid var(--border)', borderRadius: 8,
          padding: '6px 12px', fontSize: 13, cursor: 'pointer', marginLeft: 'auto'
        }}>↻ Actualizar</button>
      </div>

      {error && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div className="loader" />
          <div style={{ color: 'var(--text2)', marginTop: 12, fontSize: 14 }}>Cargando noticias...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {noticias.map((n, i) => (
            <a
              key={i}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{
                display: 'flex', gap: 12, cursor: 'pointer',
                transition: 'border-color 0.2s',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--verde)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Imagen */}
                {n.image && (
                  <div style={{
                    width: 90, height: 70, borderRadius: 8, overflow: 'hidden',
                    flexShrink: 0, background: 'var(--bg3)'
                  }}>
                    <img
                      src={n.image}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                {/* Texto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: 'var(--text)',
                    lineHeight: 1.4, marginBottom: 6,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {n.title}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--text2)',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    marginBottom: 8
                  }}>
                    {n.description}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--verde)', fontWeight: 600 }}>
                      {n.source?.name || 'Fuente'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>
                      {timeAgo(n.publishedAt)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 'auto' }}>
                      Leer más →
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {!loading && noticias.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
          No se encontraron noticias en este momento.
        </div>
      )}

      <Footer />
    </div>
  )
}

// Noticias de demo mientras no hay API key configurada
const NOTICIAS_DEMO = [
  {
    title: 'FIFA confirma los 12 estadios para el Mundial 2026',
    description: 'La FIFA ha confirmado los recintos que albergarán los partidos del Mundial 2026, distribuidos entre Estados Unidos, Canadá y México.',
    url: 'https://www.fifa.com',
    image: null,
    source: { name: 'FIFA.com' },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    title: 'El Mundial 2026 contará con 48 selecciones por primera vez en la historia',
    description: 'La edición 2026 de la Copa del Mundo será la primera en contar con 48 equipos participantes, distribuidos en 12 grupos de 4 equipos.',
    url: 'https://www.fifa.com',
    image: null,
    source: { name: 'FIFA.com' },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    title: 'Las selecciones favoritas para ganar el Mundial 2026',
    description: 'Francia, Brasil y Argentina encabezan las apuestas para alzar el trofeo en el torneo que se disputará en Norteamérica.',
    url: 'https://www.fifa.com',
    image: null,
    source: { name: 'ESPN' },
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]
