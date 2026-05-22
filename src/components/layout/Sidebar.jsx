// FILE: MobilisAdminFrontend/src/components/layout/Sidebar.jsx

import { useState } from 'react';
import { LayoutDashboard, AlertTriangle, BarChart2, Map, Users, FileText, LogOut, User } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import t from '../../i18n/translations.json';
import mobilisLogo from '../../assets/Mobilis_Logo_white.svg';
import LogoutModal from './LogoutModal';
import './Sidebar.css';

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={16} />, labelKey: 'dashboard',    id: 'dashboard'    },
  { icon: <AlertTriangle size={16} />,   labelKey: 'signalements', id: 'signalements' },
  { icon: <BarChart2 size={16} />,       labelKey: 'statistiques', id: 'statistiques' },
  { icon: <Map size={16} />,             labelKey: 'carte',        id: 'carte'        },
];

const GESTION_ITEMS = [
  { icon: <Users size={16} />,    labelKey: 'utilisateurs', id: 'users'    },
  { icon: <FileText size={16} />, labelKey: 'rapports',     id: 'rapports' },
];

export default function Sidebar({ isOpen, activeItem, onNavigate, onLogout }) {
  const { lang } = useLang();
  const s = t.sidebar;
  const { admin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Resolve the best display name from whatever the backend returns
  const displayName =
    admin?.fullName ||
    admin?.username ||
    admin?.name ||
    admin?.email ||
    'Admin';

  const handleNav = (id) => {
    onNavigate?.(id);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout?.();
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={mobilisLogo} alt="Mobilis" className="logo-img" />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-title">{s.navTitle[lang]}</p>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              {item.icon}
              <span>{s[item.labelKey][lang]}</span>
            </div>
          ))}
          <p className="nav-section-title">{s.gestionTitle[lang]}</p>
          {GESTION_ITEMS.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              {item.icon}
              <span>{s[item.labelKey][lang]}</span>
            </div>
          ))}
        </nav>

        {/* Footer — always pinned at bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              <User size={16} color="var(--color-primary)" />
            </div>
            <div className="sidebar-user-info">
              {/* FIXED: use real admin name from AuthContext instead of hardcoded translation */}
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">{s.adminRole?.[lang] ?? 'Administrateur'}</div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={() => setShowLogoutModal(true)}
              title={s.logout[lang]}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}