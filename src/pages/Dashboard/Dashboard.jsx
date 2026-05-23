// FILE: MobilisAdminFrontend/src/pages/Dashboard/Dashboard.jsx

import { useEffect, useState, useCallback } from 'react';
import StatCard from '../../components/UI/StatCard';
import SignalementsTable from './SignalementsTable';
import StatusChart from '../../components/Charts/StatusChart';
import { statsApi } from '../../api/client';
import './Dashboard.css';

const REFRESH_INTERVAL = 30_000;

const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconCheckbox = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
    <polyline points="9 12 11.5 14.5 16 9"/>
  </svg>
);

const IconClock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const LEVEL_COLOR = {
  Critique: '#e63946',
  Élevé:    '#f4a261',
  Faible:   '#2d6a4f',
};

const LEVEL_CLASS = {
  Critique: 'badge-critique',
  Élevé:    'badge-eleve',
  Faible:   'badge-faible',
};

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heatLoading, setHeatLoading] = useState(true);

  const fetchStats = useCallback(() => {
    return statsApi.getDashboard()
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  const fetchHeatmap = useCallback(() => {
    return statsApi.getHeatmap()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        const order = { Critique: 0, Élevé: 1, Faible: 2 };
        data.sort((a, b) =>
          (order[a.niveauCriticite] ?? 3) - (order[b.niveauCriticite] ?? 3) ||
          (b.count - a.count)
        );
        setHeatmap(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    Promise.all([fetchStats(), fetchHeatmap()]).finally(() => {
      setLoading(false);
      setHeatLoading(false);
    });
  }, [fetchStats, fetchHeatmap]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      fetchHeatmap();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats, fetchHeatmap]);

  const total     = loading ? '...' : (stats?.totalSignalements ?? 0).toLocaleString();
  const resolus   = loading ? '...' : (stats?.resolus           ?? 0).toLocaleString();
  const enAttente = loading ? '...' : (stats?.enAttente         ?? 0).toLocaleString();
  const enCours   = loading ? '...' : (stats?.enCours           ?? 0).toLocaleString();

  // Top 5 zones critiques from heatmap
  const topZones = heatmap
    .filter(z => z.niveauCriticite === 'Critique' || z.niveauCriticite === 'Élevé')
    .slice(0, 5);
  const displayZones = topZones.length > 0 ? topZones : heatmap.slice(0, 5);

  return (
    <>
      <div className="stat-cards">
        <StatCard titleKey="totalSignalements" value={total}     color="#e63946" icon={<IconAlert />}    />
        <StatCard titleKey="resolus"           value={resolus}   color="#2d6a4f" icon={<IconCheckbox />} />
        <StatCard titleKey="enAttente"         value={enAttente} color="#f4a261" icon={<IconClock />}    />
        <StatCard titleKey="enCours"           value={enCours}   color="#457b9d" icon={<IconStar />}     />
      </div>

      <div className="dashboard-grid">
        <div className="grid-left">
          <SignalementsTable />
        </div>

        <div className="grid-right">
          {/* ── Donut chart with REAL percentages (replaces the old progress-bar panel) ── */}
          <StatusChart stats={stats} loading={loading} />

          {/* ── Zones Critiques with REAL data from heatmap ── */}
          <div className="dash-panel">
            <h3 className="dash-panel-title">Zones critiques</h3>
            {heatLoading ? (
              <p className="dash-loading">Chargement…</p>
            ) : displayZones.length === 0 ? (
              <p className="dash-loading">Aucune zone critique.</p>
            ) : (
              <div className="dash-zones-list">
                {displayZones.map(z => (
                  <div key={z.wilaya} className="dash-zone-row">
                    <div className="dash-zone-info">
                      <span className="dash-zone-name">{z.wilaya}</span>
                      <span className="dash-zone-sub">{z.count} signalements</span>
                    </div>
                    <span
                      className={`dash-zone-badge ${LEVEL_CLASS[z.niveauCriticite] ?? ''}`}
                      style={{ background: LEVEL_COLOR[z.niveauCriticite] ?? '#aaa' }}
                    >
                      {z.niveauCriticite}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
