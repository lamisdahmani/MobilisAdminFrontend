import { useState, useEffect } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Signalements from './pages/Signalements/Signalements';
import Utilisateurs from './pages/Users/Users';
import Rapports from './pages/Rapport/Rapports';
import Carte from './pages/Carte/Carte';
import Statistiques from './pages/Stats/Statistiques';
import { useLang } from './context/LanguageContext';
import t from './i18n/translations.json';
import './styles/variables.css';
import './styles/global.css';
import LoginPage from './pages/Login/Login';

const PAGES = {
  dashboard:    { component: Dashboard,    titleKey: 'dashboard',    subKey: 'dashboard'    },
  signalements: { component: Signalements, titleKey: 'signalements', subKey: 'signalements' },
  statistiques: { component: Statistiques, titleKey: 'statistiques', subKey: 'statistiques' },
  carte:        { component: Carte,        titleKey: 'carte',        subKey: 'carte'        },
  users:        { component: Utilisateurs, titleKey: 'utilisateurs', subKey: 'utilisateurs' },
  rapports:     { component: Rapports,     titleKey: 'rapports',     subKey: 'rapports'     },
};

export default function App() {
  const { lang } = useLang();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const isDesktop = useMediaQuery('(min-width: 900px)');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // ── Show login page if not authenticated ──
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const page = PAGES[activeNav] ?? PAGES.dashboard;
  const PageComponent = page.component;
  const pageTitle    = t.sidebar[page.titleKey]?.[lang] ?? '';
  const pageSubtitle = t[page.subKey]?.pageSubtitle?.[lang] ?? '';

  const handleNavigate = (id) => {
    setActiveNav(id);
    if (!isDesktop) setSidebarOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveNav('dashboard');
  };

  const contentClass = [
    'main-content',
    isDesktop && !sidebarOpen ? 'sidebar-closed' : '',
  ].join(' ').trim();

  return (
    <div className="app">
      <Sidebar
        isOpen={sidebarOpen}
        activeItem={activeNav}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {sidebarOpen && !isDesktop && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={contentClass}>
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
        />
        <div className="page-content">
          <PageComponent />
        </div>
      </div>
    </div>
  );
}