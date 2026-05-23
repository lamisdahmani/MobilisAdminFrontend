import { PieChart, Pie, Cell } from 'recharts';
import { useLang } from '../../context/LanguageContext';
import t from '../../i18n/translations.json';
import './StatusChart.css';

const COLORS = {
  resolus:   '#2d6a4f',  // green
  enAttente: '#e63946',  // red
  enCours:   '#f4a261',  // yellow/orange
};

export default function StatusChart({ stats, loading }) {
  const { lang } = useLang();
  const s = t.statistiques;

  // Build pie data from real API stats
  const totalNum = stats?.totalSignalements ?? 0;

  const pieData = totalNum > 0
    ? [
        {
          name: s.globalStatus?.resolus?.[lang] ?? 'Résolus',
          value: stats?.resolus ?? 0,
          color: COLORS.resolus,
        },
        {
          name: s.globalStatus?.enAttente?.[lang] ?? 'En attente',
          value: stats?.enAttente ?? 0,
          color: COLORS.enAttente,
        },
        {
          name: s.globalStatus?.enCours?.[lang] ?? 'En cours',
          value: stats?.enCours ?? 0,
          color: COLORS.enCours,
        },
      ]
    : [
        { name: 'Résolus',   value: 1, color: COLORS.resolus   },
        { name: 'En attente',value: 1, color: COLORS.enAttente },
        { name: 'En cours',  value: 1, color: COLORS.enCours   },
      ];

  return (
    <div className="chart-card">
      <h3>{s.globalStatus?.title?.[lang] ?? 'Statut global'}</h3>

      {loading ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>Chargement…</p>
      ) : (
        <>
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
            {pieData.map(item => {
              const pct = totalNum > 0 ? Math.round((item.value / totalNum) * 100) : 0;
              return (
                <div key={item.name} className="legend-item">
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{pct}%</span>
                </div>
              );
            })}
          </div>

          {totalNum === 0 && (
            <p style={{ color: '#aaa', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
              Aucune donnée disponible
            </p>
          )}
        </>
      )}
    </div>
  );
}