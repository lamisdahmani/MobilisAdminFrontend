import { useEffect, useState } from 'react';
import StatCard from '../../components/UI/StatCard';
import SignalementsTable from './SignalementsTable';
import StatusChart from '../../components/Charts/StatusChart';
import { statsApi } from '../../api/client';
import './Dashboard.css';

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

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getDashboard()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total     = loading ? '...' : (stats?.totalSignalements ?? 0).toLocaleString();
  const resolus   = loading ? '...' : (stats?.resolus           ?? 0).toLocaleString();
  const enAttente = loading ? '...' : (stats?.enAttente         ?? 0).toLocaleString();
  const enCours   = loading ? '...' : (stats?.enCours           ?? 0).toLocaleString();

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
          <StatusChart stats={stats} loading={loading} />
        </div>
      </div>
    </>
  );
}