import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import t from '../../i18n/translations.json';

function validate(name, value, text, lang) {
  switch (name) {
    case 'email':
      if (!value) return text.email_required[lang];
      return '';
    case 'password':
      if (!value) return text.password_required[lang];
      if (value.length < 6) return text.password_short[lang];
      return '';
    default:
      return '';
  }
}

export default function AuthPanel() {
  const { lang } = useLang();
  const { login, loading, error: authError } = useAuth();
  const text = t.auth;

  const [login_form, setLoginForm] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState({});
  const [loginTouched, setLoginTouched] = useState({});
  const [showLoginPass, setShowLoginPass] = useState(false);

  function handleLoginChange(e) {
    const { name, value } = e.target;
    setLoginForm((p) => ({ ...p, [name]: value }));
    if (loginTouched[name])
      setLoginErr((p) => ({ ...p, [name]: validate(name, value, text, lang) }));
  }

  function handleLoginBlur(e) {
    const { name, value } = e.target;
    setLoginTouched((p) => ({ ...p, [name]: true }));
    setLoginErr((p) => ({ ...p, [name]: validate(name, value, text, lang) }));
  }

  async function handleLoginSubmit() {
    const fields = ['email', 'password'];
    const touched = Object.fromEntries(fields.map((f) => [f, true]));
    const errors = Object.fromEntries(
      fields.map((f) => [f, validate(f, login_form[f], text, lang)])
    );
    setLoginTouched(touched);
    setLoginErr(errors);
    if (Object.values(errors).some((e) => e)) return;

    await login(login_form.email, login_form.password);
  }

  return (
    <div className="lp-auth-panel">
      <div className="lp-form-container">
        <div className="lp-form-inner">
          <div className="lp-forms-body">
            <div className="lp-auth-form">

              {/* Server error message */}
              {authError && (
                <div className="lp-server-error">
                  <WarningIcon /> {authError}
                </div>
              )}

              <Field label={text.email[lang]} error={loginErr.email}>
                <input
                  name="email"
                  type="text"
                  className={`lp-field-input ${loginTouched.email ? (loginErr.email ? 'lp-input-error' : 'lp-input-ok') : ''}`}
                  placeholder="email@mobilis.dz ou numéro"
                  value={login_form.email}
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
                    value={login_form.password}
                    onChange={handleLoginChange}
                    onBlur={handleLoginBlur}
                  />
                  <button type="button" className="lp-eye-btn" onClick={() => setShowLoginPass((p) => !p)}>
                    {showLoginPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </Field>

              <button
                type="button"
                className="lp-btn-primary"
                onClick={handleLoginSubmit}
                disabled={loading}
              >
                {loading ? 'Connexion...' : text.login_btn[lang]}
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