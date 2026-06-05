import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import AuthPage from './pages/AuthPage'
import FixturePage from './pages/FixturePage'
import RankingPage from './pages/RankingPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'

// Icons
const IconFixture = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

const IconRanking = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
)

const IconAdmin = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
)

const IconProfile = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

function AppInner() {
  const { user, profile, loading } = useAuth()
  const [tab, setTab] = useState('fixture')

  // ✅ ESTO ES LO IMPORTANTE (BIEN PUESTO)
  const [predictions, setPredictions] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem("predictions")
    if (saved) {
      setPredictions(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("predictions", JSON.stringify(predictions))
  }, [predictions])

  // LOADING
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--verde)', textAlign: 'center' }}>
            QUINIELA <span style={{ color: 'var(--oro)' }}>2026</span>
          </div>
          <div className="loader" style={{ marginTop: 20 }} />
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  const tabs = [
    { id: 'fixture', label: 'Fixture', icon: <IconFixture /> },
    { id: 'ranking', label: 'Ranking', icon: <IconRanking /> },
    ...(profile?.es_admin ? [{ id: 'admin', label: 'Admin', icon: <IconAdmin /> }] : []),
    { id: 'perfil', label: 'Perfil', icon: <IconProfile /> },
  ]

  return (
    <div className="bg-slate-900 text-white min-h-screen">

      {/* NAV */}
      <nav className="nav bg-slate-800 shadow-lg">
        <div className="nav-inner">
          <div className="nav-logo">QUINIELA <span>2026</span></div>

          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-link px-3 py-2 rounded-lg ${
                tab === t.id ? 'bg-green-500 text-white' : 'text-gray-300'
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENIDO */}
      {tab === 'fixture' && (
        <FixturePage 
          predictions={predictions}
          setPredictions={setPredictions}
        />
      )}

      {tab === 'ranking' && <RankingPage />}
      {tab === 'admin' && <AdminPage />}
      {tab === 'perfil' && <ProfilePage setTab={setTab} />}

      {/* TAB BAR */}
      <div className="tabbar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="nav-link px-3 py-2 rounded-lg"
          >
            {t.label}
          </button>
        ))}
      </div>

    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}