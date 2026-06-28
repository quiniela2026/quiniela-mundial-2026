import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import AuthPage from './pages/AuthPage'
import FixturePage from './pages/FixturePage'
import RankingPage from './pages/RankingPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import NoticiasPage from './pages/NoticiasPage'
import GanadorPage from './pages/GanadorPage'
import ComparacionPage from './pages/ComparacionPage'
import EliminatoriaPage from './pages/EliminatoriaPage'
import RankingEliminatoriaPage from './pages/RankingEliminatoriaPage'
import AdminEliminatoriaPage from './pages/AdminEliminatoriaPage'
import BracketPage from './pages/BracketPage'

const IconFixture = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
const IconRanking = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
const IconNoticias = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/><path d="M7 8h10M7 12h6M7 16h4"/></svg>
const IconTrofeo = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4M12 17v4M8 21h8M5 5h14v4a7 7 0 01-14 0V5z"/></svg>
const IconComparar = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
const IconAdmin = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
const IconProfile = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconCopa = () => <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10l-1 9a4 4 0 01-8 0L7 4z"/><path d="M7 5H4a1 1 0 00-1 1v1a4 4 0 004 4M17 5h3a1 1 0 011 1v1a4 4 0 01-4 4"/></svg>

function AppInner() {
  const { user, profile, loading } = useAuth()
  const [tab, setTab] = useState('fixture')
  const [adminVista, setAdminVista] = useState('grupos') // 'grupos' | 'eliminatoria' — solo dentro del tab Admin

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--verde)', textAlign: 'center' }}>
          QUINIELA <span style={{ color: 'var(--oro)' }}>2026</span>
        </div>
        <div className="loader" style={{ marginTop: 20 }} />
      </div>
    </div>
  )

  if (!user) return <AuthPage />

  const tabs = [
    { id: 'fixture',      label: 'Fixture',     icon: <IconFixture /> },
    { id: 'ranking',      label: 'Ranking',     icon: <IconRanking /> },
    { id: 'eliminatoria', label: '16avos',      icon: <IconCopa /> },
    { id: 'bracket',      label: 'Bracket',     icon: <IconTrofeo /> },
    { id: 'rankingElim',  label: 'Rank.Elim',   icon: <IconTrofeo /> },
    { id: 'comparacion',  label: 'Todos',       icon: <IconComparar /> },
    { id: 'noticias',     label: 'Noticias',    icon: <IconNoticias /> },
    { id: 'ganador',      label: 'Trofeo',      icon: <IconTrofeo /> },
    ...(profile?.es_admin ? [{ id: 'admin', label: 'Admin', icon: <IconAdmin /> }] : []),
    { id: 'perfil',       label: 'Perfil',      icon: <IconProfile /> },
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

      {tab === 'fixture'      && <FixturePage />}
      {tab === 'ranking'      && <RankingPage />}
      {tab === 'eliminatoria' && <EliminatoriaPage />}
      {tab === 'bracket'      && <BracketPage />}
      {tab === 'rankingElim'  && <RankingEliminatoriaPage />}
      {tab === 'comparacion'  && <ComparacionPage />}
      {tab === 'noticias'     && <NoticiasPage />}
      {tab === 'ganador'      && <GanadorPage />}
      {tab === 'perfil'       && <ProfilePage setTab={setTab} />}

      {tab === 'admin' && (
        <div className="page" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <button onClick={() => setAdminVista('grupos')} style={{
              background: adminVista === 'grupos' ? 'var(--oro)' : 'var(--bg3)',
              color: adminVista === 'grupos' ? '#000' : 'var(--text2)',
              border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}>📋 Fase de grupos</button>
            <button onClick={() => setAdminVista('eliminatoria')} style={{
              background: adminVista === 'eliminatoria' ? 'var(--oro)' : 'var(--bg3)',
              color: adminVista === 'eliminatoria' ? '#000' : 'var(--text2)',
              border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}>🏆 Eliminatoria</button>
          </div>
        </div>
      )}
      {tab === 'admin' && adminVista === 'grupos' && <AdminPage />}
      {tab === 'admin' && adminVista === 'eliminatoria' && <AdminEliminatoriaPage />}

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
  return <AuthProvider><AppInner /></AuthProvider>
}
