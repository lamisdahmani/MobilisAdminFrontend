import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useLang } from '../../context/LanguageContext';
import t from '../../i18n/translations.json';
import {
  TYPE_DATA,
  REGION_DATA,
  EVOLUTION_DATA,
  RESUME_DATA,
  STAT_CARDS_DATA,
} from '../../Data/siganlements';
import './Statistiques.css';

/* ─── SVG Icons ─── */
const IconWarning = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconTrending = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const IconClock = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconPin = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ICONS = [IconWarning, IconTrending, IconClock, IconPin];

/* ─── Tooltip ─── */
function CustomTooltip({ active, payload, label, lang }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a2332', color: '#fff',
      padding: '8px 14px', borderRadius: 8, fontSize: 12,
    }}>
      <p style={{ fontWeight: 700, marginBottom: 2 }}>{label}</p>
      <p>{payload[0].value.toLocaleString()} {t.statistiques.evolution.tooltip[lang]}</p>
    </div>
  );
}

/* ─── Signalements par type ─── */
function SignalementsByType() {
  const { lang } = useLang();
  const s = t.statistiques.byType;
  const max = TYPE_DATA[0].value;
  return (
    <div className="chart-card-ui2">
      <h3>{s.title[lang]}</h3>
      <div className="bar-list">
        {TYPE_DATA.map(({ labelKey, value }) => (
          <div key={labelKey} className="bar-row">
            <span className="bar-label">{s[labelKey][lang]}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(value / max) * 100}%`, background: '#1b6b3a' }} />
            </div>
            <span className="bar-count">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Signalements par region ─── */
function SignalementsByRegion() {
  const { lang } = useLang();
  const s = t.statistiques.byRegion;
  const max = REGION_DATA[0].value;
  return (
    <div className="chart-card-ui2">
      <h3>{s.title[lang]}</h3>
      <div className="bar-list">
        {REGION_DATA.map(({ nameKey, value, color }) => {
          const label = t.signalements.regions[nameKey]?.[lang] ?? nameKey;
          return (
            <div key={nameKey} className="bar-row">
              <span className="bar-label region">{label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
              </div>
              <span className="bar-count">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Évolution mensuelle ─── */
function EvolutionMensuelle() {
  const { lang } = useLang();
  return (
    <div className="evolution-card">
      <h3>{t.statistiques.evolution.title[lang]}</h3>
      <div className="evolution-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={EVOLUTION_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9aa5b4' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9aa5b4' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}K`} />
            <Tooltip content={<CustomTooltip lang={lang} />} />
            <Line type="monotone" dataKey="value" stroke="#1b6b3a" strokeWidth={2.5}
              dot={{ r: 4, fill: '#1b6b3a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Résumé performances ─── */
function ResumePerformances() {
  const { lang } = useLang();
  const r = t.statistiques.resume;
  return (
    <div className="resume-card">
      <h3>{r.title[lang]}</h3>
      {RESUME_DATA.map(({ key, value }) => (
        <div key={key} className="resume-row">
          <span className="resume-row-label">{r[key][lang]}</span>
          <span className="resume-row-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function Statistiques() {
  const { lang } = useLang();
  const s = t.statistiques;
  const months = t.common.months[lang];
  const years = ['2025', '2026'];

  return (
    <div className="stat-page">

      {/* Filters */}
      <div className="stat-filters">
        <select className="stat-filter-select">
          <option>{t.signalements.dropdowns.allRegions[lang]}</option>
          {Object.entries(t.signalements.regions).map(([k, v]) => (
            <option key={k}>{v[lang]}</option>
          ))}
        </select>
        <select className="stat-filter-select">
          <option>{t.signalements.dropdowns.allTypes[lang]}</option>
          {Object.entries(t.signalements.problemTypes).map(([k, v]) => (
            <option key={k}>{v[lang]}</option>
          ))}
        </select>
        <select className="stat-filter-select">
          {months.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="stat-filter-select">
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Top stat cards */}
      <div className="stat-cards-row">
        {STAT_CARDS_DATA.map(({ key, value, color }, i) => {
          const IconComponent = ICONS[i];
          return (
            <div key={key} className="stat-card" style={{ borderLeftColor: color }}>
              <div className="stat-card-left">
                <span className="stat-card-label">{s.statCards[key][lang]}</span>
                <span className="stat-card-value">{value}</span>
              </div>
              <IconComponent color={color} />
            </div>
          );
        })}
      </div>

      {/* Middle: byType + byRegion */}
      <div className="stat-main-grid">
        <SignalementsByType />
        <SignalementsByRegion />
      </div>

      {/* Bottom: evolution + résumé */}
      <div className="stat-bottom-row">
        <EvolutionMensuelle />
        <ResumePerformances />
      </div>

    </div>
  );
}