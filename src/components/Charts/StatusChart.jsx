import { PieChart, Pie, Cell } from 'recharts';
import { useLang } from '../../context/LanguageContext';
import { TOP_ZONES, PIE_DATA_CONFIG } from '../../Data/siganlements';
import t from '../../i18n/translations.json';
import './StatusChart.css';

export default function StatusChart() {
  const { lang } = useLang();
  const s = t.statistiques;

  const pieData = PIE_DATA_CONFIG.map(item => ({
    name: s.globalStatus[item.key][lang],
    value: item.value,
    color: item.color,
  }));

  return (
    <div className="chart-wrapper">
      {/* Donut chart */}
      <div className="chart-card">
        <h3>{s.globalStatus.title[lang]}</h3>
        <div className="pie-container">
          <PieChart width={160} height={130}>
            <Pie
              data={pieData}
              cx={80} cy={65}
              innerRadius={38}
              outerRadius={60}
              dataKey="value"
              strokeWidth={0}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </div>
        <div className="legend">
          {pieData.map(item => (
            <div key={item.name} className="legend-item">
              <span className="legend-dot" style={{ background: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 zones */}
      <div className="chart-card">
        <h3>{s.topZones.title[lang]}</h3>
        <div className="zones">
          {TOP_ZONES.map(z => {
            const label = t.signalements.regions[z.nameKey]?.[lang] ?? z.nameKey;
            return (
              <div key={z.nameKey}>
                <div className="zone-label">
                  <span>{label}</span>
                  <span>{z.val}</span>
                </div>
                <div className="zone-bar-bg">
                  <div
                    className="zone-bar-fill"
                    style={{ width: `${(z.val / TOP_ZONES[0].val) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}