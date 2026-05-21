import { useState } from 'react';
import { Search, Eye, Download, FileText, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import './Rapports.css';
import t from '../../i18n/translations.json';
import { useLang } from '../../context/LanguageContext';

const ALL_RAPPORTS = [
  { id: 1, title: 'Signalements par région – Mai 2025', typeKey: 'signalements', badgeClass: 'rap-badge-region',  periode: '01/05/2025 – 31/05/2025', date: '31/05/2025 14:30', taille: '2.45 MB' },
  { id: 2, title: 'Analyse des problèmes – Mai 2025',   typeKey: 'analyse',       badgeClass: 'rap-badge-analyse', periode: '01/05/2025 – 31/05/2025', date: '31/05/2025 13:45', taille: '1.82 MB' },
  { id: 3, title: 'Performance réseau – Mai 2025',      typeKey: 'performance',   badgeClass: 'rap-badge-perf',    periode: '01/05/2025 – 31/05/2025', date: '31/05/2025 13:20', taille: '3.12 MB' },
  { id: 4, title: 'Signalements par région – Avr 2025', typeKey: 'signalements', badgeClass: 'rap-badge-region',  periode: '01/04/2025 – 30/04/2025', date: '30/04/2025 10:00', taille: '2.10 MB' },
  { id: 5, title: 'Performance réseau – Avr 2025',      typeKey: 'performance',   badgeClass: 'rap-badge-perf',    periode: '01/04/2025 – 30/04/2025', date: '30/04/2025 09:15', taille: '2.98 MB' },
];

const PAGE_SIZE = 3;

const BADGE_LABELS = {
  signalements: 'Signalements par région',
  analyse:      'Analyse des problèmes',
  performance:  'Performance réseau',
};

export default function Rapports() {
  const { lang } = useLang();

  // Form state
  const [typeRapport, setTypeRapport]   = useState('tous');
  const [region,      setRegion]        = useState('toutes');
  const [typeProb,    setTypeProb]      = useState('tous');
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 8) + '01';
  const [dateFrom,    setDateFrom]      = useState(firstOfMonth);
  const [dateTo,      setDateTo]        = useState(today);

  // Table state
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const filtered = ALL_RAPPORTS.filter(row => {
    const matchSearch = row.title.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeRapport === 'tous' || row.typeKey === typeRapport;
    return matchSearch && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  return (
    <div className="rap-page">

      {/* ── GENERATE PANEL ── */}
      <div className="rap-generate-card">
        <h3>Générer un rapport</h3>

        <div className="rap-form-row">
          {/* Type de rapport */}
          <div className="rap-form-field">
            <label>TYPE DE RAPPORT</label>
            <div className="rap-select-wrap">
              <select className="rap-select" value={typeRapport} onChange={e => { setTypeRapport(e.target.value); setPage(1); }}>
                <option value="tous">Tous les rapports</option>
                <option value="signalements">Signalements par région</option>
                <option value="analyse">Analyse des problèmes</option>
                <option value="performance">Performance réseau</option>
              </select>
            </div>
          </div>

          {/* Région */}
          <div className="rap-form-field">
            <label>RÉGION</label>
            <div className="rap-select-wrap">
              <select className="rap-select" value={region} onChange={e => setRegion(e.target.value)}>
                <option value="toutes">Toutes les régions</option>
                <option value="alger">Alger</option>
                <option value="oran">Oran</option>
                <option value="constantine">Constantine</option>
                <option value="annaba">Annaba</option>
              </select>
            </div>
          </div>

          {/* Type de problème */}
          <div className="rap-form-field">
            <label>TYPE DE PROBLÈME</label>
            <div className="rap-select-wrap">
              <select className="rap-select" value={typeProb} onChange={e => setTypeProb(e.target.value)}>
                <option value="tous">Tous les types</option>
                <option value="couverture">Couverture réseau</option>
                <option value="debit">Débit insuffisant</option>
                <option value="coupure">Coupure de service</option>
                <option value="qualite">Qualité d'appel</option>
              </select>
            </div>
          </div>

          {/* Période (date range) */}
          <div className="rap-form-field rap-field-periode">
            <label>PÉRIODE</label>
            <div className="rap-date-range">
              <input type="date" className="rap-date-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span className="rap-date-sep">—</span>
              <input type="date" className="rap-date-input" value={dateTo}   onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          {/* Generate button */}
          <button className="rap-btn-submit">
            <Download size={16} />
            Générer le rapport
          </button>
        </div>

        {/* Info banner */}
        <div className="rap-info-banner">
          <Info size={15} className="rap-info-icon" />
          <span>Pour des performances optimales, veuillez sélectionner une période ne dépassant pas 1 mois.</span>
        </div>
      </div>

      {/* ── TABLE PANEL ── */}
      <div className="rap-table-card">
        {/* Table header row */}
        <div className="rap-topbar">
          <h3 className="rap-table-title">Rapports générés</h3>
          <div className="rap-search-wrap">
            <Search size={15} color="#94a3b8" />
            <input
              className="rap-search"
              placeholder="Rechercher un rapport..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rap-table-scroll">
          <table className="rap-table">
            <thead>
              <tr>
                <th>TITRE DU RAPPORT</th>
                <th>TYPE DE RAPPORT</th>
                <th>PÉRIODE</th>
                <th>GÉNÉRÉ LE</th>
                <th>TAILLE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rap-empty">Aucun rapport trouvé.</td>
                </tr>
              ) : paginated.map(row => (
                <tr key={row.id}>
                  <td>
                    <div className="rap-title-cell">
                      <FileText size={18} className="rap-file-icon" />
                      <span>{row.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`rap-badge ${row.badgeClass}`}>
                      {BADGE_LABELS[row.typeKey]}
                    </span>
                  </td>
                  <td>{row.periode}</td>
                  <td>{row.date}</td>
                  <td>{row.taille}</td>
                  <td>
                    <div className="rap-actions">
                      <button className="rap-action-btn view">     <Eye      size={14} /></button>
                      <button className="rap-action-btn download"> <Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="rap-footer">
          <span className="rap-count">
            Affichage de {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} à {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} rapports
          </span>
          <div className="rap-pagination">
            <button className="rap-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`rap-page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>
                {n}
              </button>
            ))}
            <button className="rap-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}