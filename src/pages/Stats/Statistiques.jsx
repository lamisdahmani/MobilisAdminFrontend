import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useLang } from '../../context/LanguageContext';
import { statsApi } from '../../api/client';
import t from '../../i18n/translations.json';
import './Statistiques.css';

const IconWarning  = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconTrending = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconClock    = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconPin      = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const STAT_COLORS = ['#e63946', '#2d6a4f', '#f4a261', '#457b9d'];
const ICONS = [IconWarning, IconTrending, IconClock, IconPin];

function CustomTooltip({ active, payload, label, lang }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2332', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12 }}>
      <p style={{ fontWeight: 700, marginBottom: 2 }}>{label}</p>
      <p>{payload[0].value.toLocaleString()} {t.statistiques.evolution.tooltip[lang]}</p>
    </div>
  );
}

export default function Statistiques() {
  const { lang } = useLang();
  const s = t.statistiques;
  const months = t.common.months[lang];
  const years  = ['2025', '2026'];

  const [filters, setFilters] = useState({ wilaya: '', typeProbleme: '', month: '', year: '' });
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    statsApi.getStatistiques({
      wilaya:       filters.wilaya       || undefined,
      typeProbleme: filters.typeProbleme || undefined,
      month:        filters.month        || undefined,
      year:         filters.year         || undefined,
    })
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const statCards = stats ? [
    { key: 'totalSignalements', value: stats.totalCeMois,            color: STAT_COLORS[0] },
    { key: 'resolus',           value: stats.totalResolus,           color: STAT_COLORS[1] },
    { key: 'tempsMoyen',        value: stats.tempsMoyenResolution,   color: STAT_COLORS[2] },
    { key: 'zonesCritiques',    value: stats.nombreZonesCritiques,   color: STAT_COLORS[3] },
  ] : [];

  const typeMax   = stats?.parTypes?.[0]?.count   || 1;
  const wilayaMax = stats?.parWilayas?.[0]?.count || 1;

  return (
    <div className="stat-page">

      {/* Filters */}
      <div className="stat-filters">
        <select className="stat-filter-select" value={filters.wilaya} onChange={e => setFilter('wilaya', e.target.value)}>
          <option value="">{t.signalements.dropdowns.allRegions[lang]}</option>
          {Object.entries(t.signalements.regions).map(([k, v]) => (
            <option key={k} value={k}>{v[lang]}</option>
          ))}
        </select>
        <select className="stat-filter-select" value={filters.typeProbleme} onChange={e => setFilter('typeProbleme', e.target.value)}>
          <option value="">{t.signalements.dropdowns.allTypes[lang]}</option>
          {Object.entries(t.signalements.problemTypes).map(([k, v]) => (
            <option key={k} value={k}>{v[lang]}</option>
          ))}
        </select>
        <select className="stat-filter-select" value={filters.month} onChange={e => setFilter('month', e.target.value)}>
          <option value="">Tous les mois</option>
          {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select className="stat-filter-select" value={filters.year} onChange={e => setFilter('year', e.target.value)}>
          <option value="">Toutes les années</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Chargement...</div>
      ) : (
        <>
          <div className="stat-cards-row">
            {statCards.map(({ key, value, color }, i) => {
              const Icon = ICONS[i];
              return (
                <div key={key} className="stat-card" style={{ borderLeftColor: color }}>
                  <div className="stat-card-left">
                    <span className="stat-card-label">{s.statCards[key]?.[lang] ?? key}</span>
                    <span className="stat-card-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                  </div>
                  <Icon color={color} />
                </div>
              );
            })}
          </div>

          <div className="stat-main-grid">
            {/* By type */}
            <div className="chart-card-ui2">
              <h3>{s.byType.title[lang]}</h3>
              <div className="bar-list">
                {(stats?.parTypes || []).map(({ type, count }) => (
                  <div key={type} className="bar-row">
                    <span className="bar-label">{t.signalements.problemTypes[type]?.[lang] ?? type}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(count / typeMax) * 100}%`, background: '#1b6b3a' }} />
                    </div>
                    <span className="bar-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By wilaya */}
            <div className="chart-card-ui2">
              <h3>{s.byRegion.title[lang]}</h3>
              <div className="bar-list">
                {(stats?.parWilayas || []).map(({ wilaya, count, niveauCriticite }) => {
                  const color = niveauCriticite === 'Critique' ? '#e63946' : niveauCriticite === 'Élevé' ? '#f4a261' : '#2d6a4f';
                  return (
                    <div key={wilaya} className="bar-row">
                      <span className="bar-label region">{wilaya}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(count / wilayaMax) * 100}%`, background: color }} />
                      </div>
                      <span className="bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="stat-bottom-row">
            {/* Evolution chart */}
            <div className="evolution-card">
              <h3>{s.evolution.title[lang]}</h3>
              <div className="evolution-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={(stats?.evolution || []).map(e => ({ month: e.mois, value: e.count }))}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9aa5b4' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9aa5b4' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip lang={lang} />} />
                    <Line type="monotone" dataKey="value" stroke="#1b6b3a" strokeWidth={2.5}
                      dot={{ r: 4, fill: '#1b6b3a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance résumé */}
            <div className="resume-card">
              <h3>{s.resume.title[lang]}</h3>
              {stats?.performances && (
                <>
                  <div className="resume-row">
                    <span className="resume-row-label">{s.resume.signalementsTraites?.[lang] ?? 'Traités'}</span>
                    <span className="resume-row-value">{stats.performances.signalementsTraites}</span>
                  </div>
                  <div className="resume-row">
                    <span className="resume-row-label">{s.resume.moyParJour?.[lang] ?? 'Moy/jour'}</span>
                    <span className="resume-row-value">{stats.performances.moyParJour}</span>
                  </div>
                  <div className="resume-row">
                    <span className="resume-row-label">{s.resume.utilisateursActifs?.[lang] ?? 'Utilisateurs'}</span>
                    <span className="resume-row-value">{stats.performances.utilisateursAyantSignale}</span>
                  </div>
                  <div className="resume-row">
                    <span className="resume-row-label">{s.resume.tempsMoyen?.[lang] ?? 'Temps moyen'}</span>
                    <span className="resume-row-value">{stats.tempsMoyenResolution}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}