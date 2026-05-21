import { useLang } from '../../context/LanguageContext';
import t from '../../i18n/translations.json';
import './StatCard.css';

export default function StatCard({ titleKey, value, color, icon }) {
  const { lang } = useLang();
  const label = t.dashboard.statCards[titleKey]?.[lang] ?? titleKey;

  return (
    <div className="stat-card-dash" style={{ borderLeftColor: color }}>
      <div className="stat-card-dash-left">
        <span className="stat-card-dash-label">{label}</span>
        <span className="stat-card-dash-value">{value}</span>
      </div>
      <div className="stat-card-dash-icon" style={{ color: color }}>
        {icon}
      </div>
    </div>
  );
}