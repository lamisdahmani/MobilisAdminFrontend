import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { reportsApi } from '../../api/client';
import t from '../../i18n/translations.json';
import './SignalementsTable.css';

const ROWS_PER_PAGE = 10;

const STATUS_MAP = {
  Pending:    'badge-warning',
  InProgress: 'badge-info',
  Resolved:   'badge-success',
};

const STATUS_LABEL = {
  Pending:    { fr: 'En attente', en: 'Pending',     ar: 'قيد الانتظار' },
  InProgress: { fr: 'En cours',   en: 'In Progress', ar: 'قيد المعالجة' },
  Resolved:   { fr: 'Résolu',     en: 'Resolved',    ar: 'محلول'        },
};

export default function SignalementsTable() {
  const { lang } = useLang();
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('all');
  const [data, setData]       = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const tb = t.dashboard.table;
  const pt = t.signalements.problemTypes;

  const fetchReports = useCallback(() => {
    setLoading(true);
    reportsApi.getAll({
      page,
      pageSize: ROWS_PER_PAGE,
      ...(typeFilter !== 'all' ? { typeProbleme: typeFilter } : {}),
    })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, typeFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Reset page when filter changes
  const handleType   = (e) => { setType(e.target.value); setPage(1); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  // Client-side search on top of paginated results
  const pageRows = (data.items || []).filter(row => {
    if (!search) return true;
    return (
      row.userPhone?.includes(search) ||
      row.userFullName?.toLowerCase().includes(search.toLowerCase()) ||
      row.wilaya?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const showPages = [...new Set([1, 2, 3, 4, data.totalPages].filter(n => n >= 1 && n <= data.totalPages))];

  return (
    <div className="table-card">
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
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9aa5b4', padding: '24px' }}>Chargement...</td></tr>
            ) : pageRows.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9aa5b4', padding: '24px' }}>Aucun résultat</td></tr>
            ) : pageRows.map((row) => {
              const typeLabel   = pt[row.problemType]?.[lang]                        ?? row.problemType;
              const statusLabel = STATUS_LABEL[row.statut]?.[lang]                   ?? row.statut;
              const isTraiter   = row.statut === 'Pending';
              const actionLabel = isTraiter ? tb.actionTraiter[lang] : tb.actionVoir[lang];
              return (
                <tr key={row.id}>
                  <td>{row.userPhone}</td>
                  <td>{typeLabel}</td>
                  <td>{row.wilaya}</td>
                  <td><span className={`badge ${STATUS_MAP[row.statut] ?? ''}`}>{statusLabel}</span></td>
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

      <div className="pagination">
        <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))}>
          <ChevronLeft size={14} />
        </button>
        {showPages.map((n, idx) => (
          <span key={n} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {idx > 0 && showPages[idx - 1] !== n - 1 && <span className="page-dots">...</span>}
            <button
              className={`page-btn ${page === n ? 'active' : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          </span>
        ))}
        <button className="page-btn" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}