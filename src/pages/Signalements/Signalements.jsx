import { useState } from 'react';
import { Search, Eye, Settings, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import t from '../../i18n/translations.json';
import './Signalements.css';

const ALL_DATA = [
  { msisdn: '213697******', type: 'coupureReseau',     region: 'babEzzouar',   cell: 'BTS-12 / A', date: '20/04 16:33', status: 'resolu'    },
  { msisdn: '213697******', type: 'coupureReseau',     region: 'darElBeida',   cell: 'BTS-07 / B', date: '20/04 16:33', status: 'resolu'    },
  { msisdn: '213697******', type: 'faibleSignal',      region: 'algerCentre',  cell: 'BTS-03 / C', date: '20/04 16:33', status: 'resolu'    },
  { msisdn: '213697******', type: 'absenceCouverture', region: 'sidiMhamed',   cell: 'BTS-09 / A', date: '20/04 16:33', status: 'enCours'   },
  { msisdn: '213697******', type: 'congestionReseau',  region: 'elHarrach',    cell: 'BTS-15 / B', date: '20/04 16:33', status: 'enCours'   },
  { msisdn: '213697******', type: 'faibleSignal',      region: 'kouba',        cell: 'BTS-02 / C', date: '20/04 16:33', status: 'enCours'   },
  { msisdn: '213697******', type: 'lenteurConnexion',  region: 'birMouradRais',cell: 'BTS-06 / A', date: '20/04 16:33', status: 'enAttente' },
  { msisdn: '213697******', type: 'lenteurConnexion',  region: 'hydra',        cell: 'BTS-07 / A', date: '20/04 16:33', status: 'enAttente' },
];

const STATUS_CONFIG = {
  resolu:    'badge-success',
  enCours:   'badge-info',
  enAttente: 'badge-warning',
};

const FILTER_KEYS = ['tous', 'enAttente', 'enCours', 'resolu'];
const TOTAL_PAGES = 40;

export default function Signalements() {
  const { lang } = useLang();
  const s  = t.signalements;
  const tb = t.signalements.table;

  const [activeFilter, setActiveFilter] = useState('tous');
  const [search, setSearch]             = useState('');
  const [region, setRegion]             = useState('allRegions');
  const [type, setType]                 = useState('allTypes');
  const [page, setPage]                 = useState(1);

  const filtered = ALL_DATA.filter(row => {
    const rowStatus = t.signalements.status[row.status]?.[lang] ?? row.status;
    const rowRegion = t.signalements.regions[row.region]?.[lang] ?? row.region;
    const rowType   = t.signalements.problemTypes[row.type]?.[lang] ?? row.type;

    const matchFilter = activeFilter === 'tous' || row.status === activeFilter;
    const matchSearch = !search
      || row.msisdn.includes(search)
      || rowType.toLowerCase().includes(search.toLowerCase())
      || rowRegion.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === 'allRegions' || row.region === region;
    const matchType   = type === 'allTypes'     || row.type === type;

    return matchFilter && matchSearch && matchRegion && matchType;
  });

  const handleFilter = (key) => { setActiveFilter(key); setPage(1); };

  return (
    <div className="sig-page">

      {/* Top bar: search + export */}
      <div className="sig-topbar">
        <div className="sig-search-wrap">
          <Search size={14} color="#aaa" />
          <input
            className="sig-search"
            placeholder={s.searchPlaceholder[lang]}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="sig-export-btn">⬇ {t.common.export[lang]}</button>
      </div>

      {/* Filter bar: status tabs + dropdowns */}
      <div className="sig-filterbar">
        <div className="sig-tabs">
          {FILTER_KEYS.map(key => (
            <button
              key={key}
              className={`sig-tab sig-tab--${key} ${activeFilter === key ? 'active' : ''}`}
              onClick={() => handleFilter(key)}
            >
              {s.filters[key][lang]}
            </button>
          ))}
        </div>
        <div className="sig-dropdowns">
          <select className="sig-select" value={region} onChange={e => setRegion(e.target.value)}>
            <option value="allRegions">{s.dropdowns.allRegions[lang]}</option>
            {Object.entries(s.regions).map(([key, val]) => (
              <option key={key} value={key}>{val[lang]}</option>
            ))}
          </select>
          <select className="sig-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="allTypes">{s.dropdowns.allTypes[lang]}</option>
            {Object.entries(s.problemTypes).map(([key, val]) => (
              <option key={key} value={key}>{val[lang]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table card */}
      <div className="sig-table-wrap">
        <div className="sig-table-scroll">
          <table className="sig-table">
            <thead>
              <tr>
                {[tb.colMsisdn, tb.colType, tb.colRegion, tb.colCellId, tb.colDate, tb.colStatus, tb.colAction].map(col => (
                  <th key={col[lang]}>{col[lang]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>
                    Aucun résultat
                  </td>
                </tr>
              ) : filtered.map((row, i) => (
                <tr key={i}>
                  <td>{row.msisdn}</td>
                  <td>{t.signalements.problemTypes[row.type]?.[lang] ?? row.type}</td>
                  <td>{t.signalements.regions[row.region]?.[lang] ?? row.region}</td>
                  <td>{row.cell}</td>
                  <td>{row.date}</td>
                  <td>
                    <span className={`sig-badge ${STATUS_CONFIG[row.status]}`}>
                      {t.signalements.status[row.status]?.[lang] ?? row.status}
                    </span>
                  </td>
                  <td>
                    <div className="sig-actions">
                      <button className="sig-action-btn sig-action-btn--view"   title={tb.actionView[lang]}><Eye size={14} /></button>
                      <button className="sig-action-btn sig-action-btn--edit"   title={tb.actionEdit[lang]}><Settings size={14} /></button>
                      <button className="sig-action-btn sig-action-btn--delete" title={tb.actionDelete[lang]}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="sig-pagination">
          <button className="sig-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))}>
            <ChevronLeft size={14} />
          </button>
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              className={`sig-page-btn ${page === n ? 'active' : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <span className="sig-page-dots">...</span>
          <button className="sig-page-btn" onClick={() => setPage(TOTAL_PAGES)}>{TOTAL_PAGES}</button>
          <button className="sig-page-btn" onClick={() => setPage(p => Math.min(TOTAL_PAGES, p + 1))}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}