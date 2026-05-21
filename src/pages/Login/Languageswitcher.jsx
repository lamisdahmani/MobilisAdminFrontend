import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';

const LANGUAGES = [
  { code: 'fr', labels: { fr: 'Français', en: 'French',  ar: 'الفرنسية' } },
  { code: 'en', labels: { fr: 'Anglais',  en: 'English', ar: 'الإنجليزية' } },
  { code: 'ar', labels: { fr: 'Arabe',    en: 'Arabic',  ar: 'العربية' } },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="lp-lang-switcher">
      <button className="lp-lang-btn" onClick={() => setOpen((p) => !p)}>
        <GlobeIcon />
        <span>{current.labels[lang]}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="lp-lang-dropdown">
          {LANGUAGES.filter((l) => l.code !== lang).map((l) => (
            <button
              key={l.code}
              className="lp-lang-option"
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              {l.labels[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}