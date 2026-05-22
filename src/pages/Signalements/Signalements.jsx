import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Settings, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { reportsApi } from '../../api/client';
import t from '../../i18n/translations.json';
import './Signalements.css';

const STATUS_CONFIG = {
  Resolved:   'badge-success',
  InProgress: 'badge-info',
  Pending:    'badge-warning',
};

const STATUS_LABELS = {
  Pending:    { fr: 'En attente', en: 'Pending',     ar: 'قيد الانتظار' },
  InProgress: { fr: 'En cours',   en: 'In Progress', ar: 'قيد المعالجة' },
  Resolved:   { fr: 'Résolu',     en: 'Resolved',    ar: 'محلول'        },
};

const FILTER_KEYS = ['tous', 'Pending', 'InProgress', 'Resolved'];

const PAGE_SIZE = 10;

export default function Signalements() {
  const { lang } = useLang();
  const s  = t.signalements;
  const tb = t.signalements.table;

  const [activeFilter, setActiveFilter] = useState('tous');
  const [search, setSearch]             = useState('');
  const [wilaya, setWilaya]             = useState('');
  const [type, setType]                 = useState('');
  const [page, setPage]                 = useState(1);
  const [data, setData]                 = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [loading, setLoading]           = useState(true);

  // Edit modal state
  const [editModal, setEditModal]   = useState(false);
  const [editRow, setEditRow]       = useState(null);
  const [newStatut, setNewStatut]   = useState('');
  const [notesAdmin, setNotesAdmin] = useState('');
  const [saving, setSaving]         = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    reportsApi.getAll({
      page,
      pageSize: PAGE_SIZE,
      ...(activeFilter !== 'tous' ? { statut: activeFilter } : {}),
      ...(wilaya ? { wilaya } : {}),
      ...(type   ? { typeProbleme: type } : {}),
    })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, activeFilter, wilaya, type]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilter = (key) => { setActiveFilter(key); setPage(1); };

  const openEdit = (row) => {
    setEditRow(row);
    setNewStatut(row.statut);
    setNotesAdmin('');
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      await reportsApi.updateStatut(editRow.id, { statut: newStatut, notesAdmin });
      setEditModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce signalement ?')) return;
    try {
      await reportsApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Client-side search filter on top of paginated results
  const filtered = (data.items || []).filter(row => {
    if (!search) return true;
    return (
      row.userPhone?.includes(search) ||
      row.wilaya?.toLowerCase().includes(search.toLowerCase()) ||
      row.problemType?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="sig-page">

      {/* Top bar */}
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

      {/* Filter bar */}
      <div className="sig-filterbar">
        <div className="sig-tabs">
          {FILTER_KEYS.map(key => {
            const label = key === 'tous'
              ? s.filters.tous[lang]
              : (STATUS_LABELS[key]?.[lang] ?? key);
            return (
              <button
                key={key}
                className={`sig-tab sig-tab--${key.toLowerCase()} ${activeFilter === key ? 'active' : ''}`}
                onClick={() => handleFilter(key)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="sig-dropdowns">
          <select className="sig-select" value={wilaya} onChange={e => { setWilaya(e.target.value); setPage(1); }}>
            <option value="">{s.dropdowns.allRegions[lang]}</option>
            {Object.entries(s.regions).map(([key, val]) => (
              <option key={key} value={key}>{val[lang]}</option>
            ))}
          </select>
          <select className="sig-select" value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
            <option value="">{s.dropdowns.allTypes[lang]}</option>
            {Object.entries(s.problemTypes).map(([key, val]) => (
              <option key={key} value={key}>{val[lang]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
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
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>Aucun résultat</td></tr>
              ) : filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.userPhone}</td>
                  <td>{t.signalements.problemTypes[row.problemType]?.[lang] ?? row.problemType}</td>
                  <td>{row.wilaya}</td>
                  <td>—</td>
                  <td>{new Date(row.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className={`sig-badge ${STATUS_CONFIG[row.statut] ?? ''}`}>
                      {STATUS_LABELS[row.statut]?.[lang] ?? row.statut}
                    </span>
                  </td>
                  <td>
                    <div className="sig-actions">
                      <button className="sig-action-btn sig-action-btn--view"   title={tb.actionView[lang]}><Eye size={14} /></button>
                      <button className="sig-action-btn sig-action-btn--edit"   title={tb.actionEdit[lang]} onClick={() => openEdit(row)}><Settings size={14} /></button>
                      <button className="sig-action-btn sig-action-btn--delete" title={tb.actionDelete[lang]} onClick={() => handleDelete(row.id)}><Trash2 size={14} /></button>
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
          {[...new Set([1, 2, 3, 4, data.totalPages].filter(n => n >= 1 && n <= data.totalPages))].map(n => (
            <button
              key={n}
              className={`sig-page-btn ${page === n ? 'active' : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button className="sig-page-btn" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Edit Status Modal */}
      {editModal && editRow && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier le statut</h3>
              <button className="modal-close" onClick={() => setEditModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Nouveau statut</label>
                <select className="modal-input" value={newStatut} onChange={e => setNewStatut(e.target.value)}>
                  <option value="Pending">En attente</option>
                  <option value="InProgress">En cours</option>
                  <option value="Resolved">Résolu</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Note admin (optionnelle)</label>
                <textarea
                  className="modal-textarea"
                  placeholder="Message envoyé à l'utilisateur..."
                  value={notesAdmin}
                  onChange={e => setNotesAdmin(e.target.value)}
                />
              </div>
              <button className="modal-submit" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}