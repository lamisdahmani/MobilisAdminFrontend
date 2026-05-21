import { useState } from 'react';
import { Bell, Globe, PanelLeft } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import Calendar from '../UI/Calendar'; 
import t from '../../i18n/translations.json';
import './TopNavbar.css';

const LANG_OPTIONS = ['fr', 'en', 'ar'];

export default function TopNavbar({ onToggleSidebar, pageTitle, pageSubtitle }) {
  const { lang, setLang } = useLang();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button className="toggle-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <PanelLeft size={20} color="#555" />
        </button>
        <div>
          <h2 className="navbar-page-title">{pageTitle}</h2>
          {pageSubtitle && <p className="navbar-page-subtitle">{pageSubtitle}</p>}
        </div>
      </div>

      <div className="navbar-right">
        <Bell size={18} className="navbar-icon" />
        
        {/* Render our isolated custom tool widget */}
        <Calendar />

        <div className="lang-dropdown-wrap">
          <button
            className="lang-dropdown-btn"
            onClick={() => setDropdownOpen(o => !o)}
            aria-label="Change language"
          >
            <Globe size={18} />
          </button>

          {dropdownOpen && (
            <div className="lang-dropdown-menu">
              {LANG_OPTIONS.map(code => (
                <button
                  key={code}
                  className={`lang-dropdown-item ${lang === code ? 'active' : ''}`}
                  onClick={() => { setLang(code); setDropdownOpen(false); }}
                >
                  {t.languages[code]?.[lang] ?? code}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}