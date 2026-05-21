import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import t from '../../i18n/translations.json';

function validate(name, value, text, lang) {
  switch (name) {
    case 'email':
      if (!value) return text.email_required[lang];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return text.email_invalid[lang];
      return '';
    case 'password':
      if (!value) return text.password_required[lang];
      if (value.length < 6) return text.password_short[lang];
      return '';
    default:
      return '';
  }
}

export default function AuthPanel({ onLoginSuccess }) {
  const { lang } = useLang();
  const text = t.auth;

  const [login, setLogin] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState({});
  const [loginTouched, setLoginTouched] = useState({});
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function handleLoginChange(e) {
    const { name, value } = e.target;
    setLogin((p) => ({ ...p, [name]: value }));
    if (loginTouched[name])
      setLoginErr((p) => ({ ...p, [name]: validate(name, value, text, lang) }));
  }

  function handleLoginBlur(e) {
    const { name, value } = e.target;
    setLoginTouched((p) => ({ ...p, [name]: true }));
    setLoginErr((p) => ({ ...p, [name]: validate(name, value, text, lang) }));
  }

  function handleLoginSubmit() {
    const fields = ['email', 'password'];
    const touched = Object.fromEntries(fields.map((f) => [f, true]));
    const errors = Object.fromEntries(
      fields.map((f) => [f, validate(f, login[f], text, lang)])
    );
    setLoginTouched(touched);
    setLoginErr(errors);
    if (Object.values(errors).every((e) => !e)) onLoginSuccess?.();
  }

  return (
    <div className="lp-auth-panel">
      <div className="lp-form-container">
        <div className="lp-form-inner">
          <div className="lp-forms-body">
            <div className="lp-auth-form">

              <Field label={text.email[lang]} error={loginErr.email}>
                <input
                  name="email"
                  type="email"
                  className={`lp-field-input ${loginTouched.email ? (loginErr.email ? 'lp-input-error' : 'lp-input-ok') : ''}`}
                  placeholder="youremail@gmail.com"
                  value={login.email}
                  onChange={handleLoginChange}
                  onBlur={handleLoginBlur}
                />
              </Field>

              <Field label={text.password[lang]} error={loginErr.password}>
                <div className="lp-input-icon-wrap">
                  <input
                    name="password"
                    type={showLoginPass ? 'text' : 'password'}
                    className={`lp-field-input ${loginTouched.password ? (loginErr.password ? 'lp-input-error' : 'lp-input-ok') : ''}`}
                    placeholder="••••••••••"
                    value={login.password}
                    onChange={handleLoginChange}
                    onBlur={handleLoginBlur}
                  />
                  <button type="button" className="lp-eye-btn" onClick={() => setShowLoginPass((p) => !p)}>
                    {showLoginPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </Field>

              <div className="lp-login-meta">
                <label className="lp-checkbox-label">
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe((v) => !v)} />
                  <span>{text.remember_me[lang]}</span>
                </label>
                <a href="#" className="lp-forgot-link">{text.forgot_password[lang]}</a>
              </div>

              <button type="button" className="lp-btn-primary" onClick={handleLoginSubmit}>
                {text.login_btn[lang]}
              </button>

              <div className="lp-divider"><span>{text.or_label[lang]}</span></div>

              <button type="button" className="lp-btn-google">
                <GoogleIcon />{text.google_btn[lang]}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="lp-field-group">
      <label className="lp-field-label">{label}</label>
      {children}
      <div className="lp-field-error-slot">
        {error && (
          <span className="lp-field-error">
            <WarningIcon /> {error}
          </span>
        )}
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ flexShrink: 0, marginTop: '1px' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: '8px' }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}