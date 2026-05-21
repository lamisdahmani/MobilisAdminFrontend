import './Login.css';
import AuthPanel from './Authpanel';
import LeftPanel from './Leftpanel';
import LanguageSwitcher from './Languageswitcher';
import { useLang } from '../../context/LanguageContext';
import t from '../../i18n/translations.json';
import logoMobilis from '../../assets/Mobilis_Logo.svg';

export default function LoginPage({ onLoginSuccess }) {
  const { lang } = useLang();
  const text = t.auth;

  return (
    <div className="lp-page-wrapper" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="lp-lang-switcher-wrapper">
        <LanguageSwitcher />
      </div>

      <div className="lp-mobile-header">
        <img src={logoMobilis} alt="Mobilis" className="lp-mobile-logo" />
        <span>
          {text.left_title_1[lang]}{' '}
          <span className="lp-green">{text.left_title_2[lang]}</span>
        </span>
      </div>

      <div className="lp-auth-card">
        <LeftPanel />
        <AuthPanel onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
}