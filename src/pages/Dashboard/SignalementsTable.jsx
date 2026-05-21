import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { SIGNALEMENTS, STATUS_MAP } from '../../Data/siganlements';
import t from '../../i18n/translations.json';
import './SignalementsTable.css';

// Fixed page capacity remains 10. The browser container safely clips around item 5 or 6 depending on visual layout depth.
const ROWS_PER_PAGE = 10;

export default function SignalementsTable() {
  const { lang } = useLang();
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('all');
  const tb = t.dashboard.table;
  const pt = t.signalements.problemTypes;

  /* ── Filter + search ── */
  const filtered = SIGNALEMENTS.filter(row => {
    const matchType   = typeFilter === 'all' || row.type === typeFilter;
    const typeLabel   = pt[row.type]?.[lang] ?? row.type;
    const regionLabel = t.signalements.regions[row.region]?.[lang] ?? row.region;
    const matchSearch = search === ''
      || row.msisdn.includes(search)
      || typeLabel.toLowerCase().includes(search.toLowerCase())
      || regionLabel.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const goTo = (n) => setPage(Math.max(1, Math.min(totalPages, n)));
  const handleType   = (e) => { setType(e.target.value);   setPage(1); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  /* Page buttons configuration */
  const showPages = [...new Set([1, 2, 3, 4, totalPages].filter(n => n >= 1 && n <= totalPages))];

  return (
    <div className="table-card">

      {/* Header */}
      <div className="table-header">
        <h3>{tb.title[lang]}</h3>
        <div className="table-controls">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              placeholder={tb.searchPlaceholder[lang]}
              value={search}
              onChange={handleSearch}
            />
          </div>
          <select className="filter-select" value={typeFilter} onChange={handleType}>
            <option value="all">{tb.filterAllTypes[lang]}</option>
            {Object.entries(pt).map(([key, val]) => (
              <option key={key} value={key}>{val[lang]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable table — custom layout internal auto-scrolling container */}
      <div className="table-scroll">
        <table className="sig-table">
          <thead>
            <tr>
              {[tb.colMsisdn, tb.colType, tb.colRegion, tb.colStatus, tb.colAction].map(col => (
                <th key={col[lang]}>{col[lang]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#9aa5b4', padding: '24px' }}>
                  Aucun résultat
                </td>
              </tr>
            ) : pageRows.map((row, i) => {
              const typeLabel   = pt[row.type]?.[lang]                       ?? row.type;
              const regionLabel = t.signalements.regions[row.region]?.[lang] ?? row.region;
              const statusLabel = t.signalements.status[row.status]?.[lang]  ?? row.status;
              const isTraiter   = row.status === 'enAttente';
              const actionLabel = isTraiter ? tb.actionTraiter[lang] : tb.actionVoir[lang];
              return (
                <tr key={i}>
                  <td>{row.msisdn}</td>
                  <td>{typeLabel}</td>
                  <td>{regionLabel}</td>
                  <td><span className={`badge ${STATUS_MAP[row.status]}`}>{statusLabel}</span></td>
                  <td>
                    <button className={`action-btn ${isTraiter ? 'btn-dark' : 'btn-light'}`}>
                      {actionLabel}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="page-btn" onClick={() => goTo(safePage - 1)}>
          <ChevronLeft size={14} />
        </button>
        {showPages.map((n, idx) => (
          <span key={n} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {idx > 0 && showPages[idx - 1] !== n - 1 && (
              <span className="page-dots">...</span>
            )}
            <button
              className={`page-btn ${safePage === n ? 'active' : ''}`}
              onClick={() => goTo(n)}
            >
              {n}
            </button>
          </span>
        ))}
        <button className="page-btn" onClick={() => goTo(safePage + 1)}>
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  );
}