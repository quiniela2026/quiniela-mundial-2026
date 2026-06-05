import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import AuthPage from './pages/AuthPage'
import FixturePage from './pages/FixturePage'
import RankingPage from './pages/RankingPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import NoticiasPage from './pages/NoticiasPage'

const IconFixture = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const IconRanking = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
)
const IconNoticias = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/>
    <path d="M7 8h10M7 12h6M7 16h4"/>
  </svg>
)
const IconAdmin = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
)
const IconProfile = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

function AppInner() {
  const { user, profile, loading } = useAuth()
  const [tab, setTab] = useState('fixture')

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
    { id: 'fixture',  label: 'Fixture',   icon: <IconFixture /> },
    { id: 'ranking',  label: 'Ranking',   icon: <IconRanking /> },
    { id: 'noticias', label: 'Noticias',  icon: <IconNoticias /> },
    ...(profile?.es_admin ? [{ id: 'admin', label: 'Admin', icon: <IconAdmin /> }] : []),
    { id: 'perfil',   label: 'Perfil',    icon: <IconProfile /> },
  ]

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">QUINIELA <span>2026</span></div>
          {tabs.map(t => (
            <button key={t.id} className={`nav-link ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {tab === 'fixture'  && <FixturePage />}
      {tab === 'ranking'  && <RankingPage />}
      {tab === 'noticias' && <NoticiasPage />}
      {tab === 'admin'    && <AdminPage />}
      {tab === 'perfil'   && <ProfilePage setTab={setTab} />}

      <div className="tabbar">
        {tabs.map(t => (
          <button key={t.id} className={`tabbar-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
