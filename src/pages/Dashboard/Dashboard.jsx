// FILE: MobilisAdminFrontend/src/pages/Dashboard/Dashboard.jsx
// FIXED: real percentages for Statut Global + real Zones Critiques from heatmap API
// FIXED: auto-refresh every 30s so new mobile reports appear without full page reload

import { useEffect, useState, useCallback } from 'react';
import StatCard from '../../components/UI/StatCard';
import SignalementsTable from './SignalementsTable';
import StatusChart from '../../components/Charts/StatusChart';
import { statsApi } from '../../api/client';
import './Dashboard.css';

const REFRESH_INTERVAL = 30_000; // 30 seconds — new mobile reports appear automatically

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

// ── Small progress bar used in Statut Global ──────────────────────────────────
function ProgressBar({ pct, color }) {
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 7, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, pct))}%`,
        height: '100%',
        background: color,
        borderRadius: 99,
        transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heatLoading, setHeatLoading] = useState(true);

  // ── Fetch dashboard stats ───────────────────────────────────────────────────
  const fetchStats = useCallback(() => {
    return statsApi.getDashboard()
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  // ── Fetch heatmap for zones critiques ──────────────────────────────────────
  const fetchHeatmap = useCallback(() => {
    return statsApi.getHeatmap()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        // Sort: Critique first, then Élevé, then Faible; within each group by count desc
        const order = { Critique: 0, Élevé: 1, Faible: 2 };
        data.sort((a, b) =>
          (order[a.niveauCriticite] ?? 3) - (order[b.niveauCriticite] ?? 3) ||
          (b.count - a.count)
        );
        setHeatmap(data);
      })
      .catch(console.error);
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchHeatmap(),
    ]).finally(() => {
      setLoading(false);
      setHeatLoading(false);
    });
  }, [fetchStats, fetchHeatmap]);

  // ── Auto-refresh every 30s so new mobile reports appear automatically ──────
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      fetchHeatmap();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats, fetchHeatmap]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const total     = loading ? '...' : (stats?.totalSignalements ?? 0).toLocaleString();
  const resolus   = loading ? '...' : (stats?.resolus           ?? 0).toLocaleString();
  const enAttente = loading ? '...' : (stats?.enAttente         ?? 0).toLocaleString();
  const enCours   = loading ? '...' : (stats?.enCours           ?? 0).toLocaleString();

  // Real percentages calculated from actual counts
  const totalNum  = stats?.totalSignalements ?? 0;
  const pctResolu   = totalNum > 0 ? Math.round((stats.resolus   / totalNum) * 100) : 0;
  const pctAttente  = totalNum > 0 ? Math.round((stats.enAttente / totalNum) * 100) : 0;
  const pctEnCours  = totalNum > 0 ? Math.round((stats.enCours   / totalNum) * 100) : 0;

  // Top 5 zones critiques from heatmap (only Critique + Élevé, or fallback to all)
  const topZones = heatmap
    .filter(z => z.niveauCriticite === 'Critique' || z.niveauCriticite === 'Élevé')
    .slice(0, 5);
  // If none are critical/elevated, show top 5 by count anyway
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
          {/* ── Statut Global with REAL percentages ── */}
          <div className="dash-panel">
            <h3 className="dash-panel-title">Statut global</h3>
            {loading ? (
              <p className="dash-loading">Chargement…</p>
            ) : (
              <div className="dash-status-list">
                <div className="dash-status-row">
                  <div className="dash-status-label">
                    <span className="dash-status-dot" style={{ background: '#2d6a4f' }} />
                    <span>Résolus</span>
                  </div>
                  <span className="dash-status-pct">{pctResolu}%</span>
                </div>
                <ProgressBar pct={pctResolu} color="#2d6a4f" />

                <div className="dash-status-row" style={{ marginTop: 14 }}>
                  <div className="dash-status-label">
                    <span className="dash-status-dot" style={{ background: '#f4a261' }} />
                    <span>En attente</span>
                  </div>
                  <span className="dash-status-pct">{pctAttente}%</span>
                </div>
                <ProgressBar pct={pctAttente} color="#f4a261" />

                <div className="dash-status-row" style={{ marginTop: 14 }}>
                  <div className="dash-status-label">
                    <span className="dash-status-dot" style={{ background: '#457b9d' }} />
                    <span>En cours</span>
                  </div>
                  <span className="dash-status-pct">{pctEnCours}%</span>
                </div>
                <ProgressBar pct={pctEnCours} color="#457b9d" />
              </div>
            )}
          </div>

          {/* ── Zones Critiques with REAL data from heatmap ── */}
          <div className="dash-panel" style={{ marginTop: 14 }}>
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

          {/* Existing status chart */}
          <StatusChart stats={stats} loading={loading} />
        </div>
      </div>
    </>
  );
}