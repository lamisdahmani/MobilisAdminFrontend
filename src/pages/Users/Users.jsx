import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Ban, ChevronLeft, ChevronRight, Users, UserCheck, UserX, X, RefreshCw } from 'lucide-react';
import './Users.css';
import t from '../../i18n/translations.json';
import { useLang } from '../../context/LanguageContext';
import { usersApi } from '../../api/client';

const PAGE_SIZE = 10;

export default function Utilisateurs() {
  const { lang } = useLang();
  const u = t.utilisateurs;

  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('tous');
  const [page, setPage]                 = useState(1);
  const [data, setData]                 = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [stats, setStats]               = useState({ totalUtilisateurs: 0, utilisateursActifs: 0, utilisateursSuspendus: 0 });
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [modalMode, setModalMode]       = useState('ban');
  const [selectedUser, setSelectedUser] = useState(null);
  const [raison, setRaison]             = useState('');
  const [dateDebut, setDateDebut]       = useState('');
  const [dateFin, setDateFin]           = useState('');
  const [saving, setSaving]             = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {
      page,
      pageSize: PAGE_SIZE,
      ...(filter !== 'tous' ? { statut: filter === 'actif' ? 'Actif' : 'Suspendu' } : {}),
      ...(search ? { search } : {}),
    };
    Promise.all([
      usersApi.getAll(params),
      usersApi.getStats(),
    ])
      .then(([usersRes, statsRes]) => {
        setData(usersRes.data);
        setStats(statsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openBanModal = (user) => {
    setSelectedUser(user);
    setModalMode('ban');
    setRaison(''); setDateDebut(''); setDateFin('');
    setShowModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSelectedUser(null); };

  const handleEnregistrer = async () => {
    if (!selectedUser || !raison || !dateDebut || !dateFin) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    setSaving(true);
    try {
      await usersApi.suspendre(selectedUser.id, {
        raisonSuspension: raison,
        dateDebut: new Date(dateDebut).toISOString(),
        dateFin:   new Date(dateFin).toISOString(),
      });
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReactiver = async (userId) => {
    try {
      await usersApi.reactiver(userId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const rows = data.items || [];

  return (
    <div className="util-page">

      {/* Stats */}
      <div className="util-stats">
        <div className="util-stat-card">
          <div className="util-stat-icon icon-total"><Users size={22} color="#1b6b3a" /></div>
          <div>
            <p className="util-stat-label">{u.stats.total[lang]}</p>
            <p className="util-stat-value">{stats.totalUtilisateurs.toLocaleString()}</p>
          </div>
        </div>
        <div className="util-stat-card">
          <div className="util-stat-icon icon-actif"><UserCheck size={22} color="#1b6b3a" /></div>
          <div>
            <p className="util-stat-label">{u.stats.actifs[lang]}</p>
            <p className="util-stat-value">{stats.utilisateursActifs.toLocaleString()}</p>
          </div>
        </div>
        <div className="util-stat-card">
          <div className="util-stat-icon icon-suspendu"><UserX size={22} color="#e63946" /></div>
          <div>
            <p className="util-stat-label">{u.stats.suspendus[lang]}</p>
            <p className="util-stat-value">{stats.utilisateursSuspendus.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="util-table-card">
        <div className="util-topbar">
          <div className="util-search-wrap">
            <Search size={16} color="#aaa" />
            <input
              className="util-search"
              placeholder={u.searchPlaceholder[lang]}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="util-select" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
            <option value="tous">{u.filter.tous[lang]}</option>
            <option value="actif">{u.filter.actif[lang]}</option>
            <option value="suspendu">{u.filter.suspendu[lang]}</option>
          </select>
        </div>

        <div className="util-table-scroll">
          <table className="util-table">
            <thead>
              <tr>
                {[u.table.colMsisdn, u.table.colDate, u.table.colSignalements, u.table.colStatus, u.table.colAction].map(col => (
                  <th key={col[lang]}>{col[lang]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#aaa' }}>Chargement...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#aaa' }}>Aucun utilisateur</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-msisdn">{row.phoneNumber}</td>
                  <td>{new Date(row.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>{row.nombreSignalements}</td>
                  <td>
                    <span className={`util-badge ${row.statut === 'Actif' ? 'badge-actif' : 'badge-suspendu'}`}>
                      {row.statut === 'Actif' ? u.status.actif[lang] : u.status.suspendu[lang]}
                    </span>
                  </td>
                  <td>
                    <div className="util-actions">
                      <button className="util-action-btn view" onClick={() => openViewModal(row)}>
                        <Eye size={14} />
                      </button>
                      {row.statut === 'Actif' ? (
                        <button className="util-action-btn ban" onClick={() => openBanModal(row)}>
                          <Ban size={14} />
                        </button>
                      ) : (
                        <button className="util-action-btn view" title="Réactiver" onClick={() => handleReactiver(row.id)}>
                          <RefreshCw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="util-pagination">
          <button className="util-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))}>
            <ChevronLeft size={14} />
          </button>
          {[...new Set([1, 2, 3, 4, data.totalPages].filter(n => n >= 1 && n <= data.totalPages))].map(n => (
            <button key={n} className={`util-page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>
              {n}
            </button>
          ))}
          <button className="util-page-btn" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'ban' ? u.modal.title[lang] : "Détails de l'utilisateur"}</h3>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {modalMode === 'ban' ? (
                <>
                  <div className="modal-field">
                    <label>{u.modal.raisonLabel[lang]}</label>
                    <textarea className="modal-textarea" placeholder={u.modal.raisonPlaceholder[lang]}
                      value={raison} onChange={e => setRaison(e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>{u.modal.dateDebut[lang]}</label>
                    <input type="date" className="modal-input" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>{u.modal.dateFin[lang]}</label>
                    <input type="date" className="modal-input" value={dateFin} onChange={e => setDateFin(e.target.value)} />
                  </div>
                  <button className="modal-submit" onClick={handleEnregistrer} disabled={saving}>
                    {saving ? 'Enregistrement...' : u.modal.submitBtn[lang]}
                  </button>
                </>
              ) : (
                <>
                  <div className="modal-view-row">
                    <span className="modal-view-label">Nom complet</span>
                    <div className="modal-view-value">{selectedUser.fullName}</div>
                  </div>
                  <div className="modal-view-row">
                    <span className="modal-view-label">MSISDN</span>
                    <div className="modal-view-value">{selectedUser.phoneNumber}</div>
                  </div>
                  <div className="modal-view-row">
                    <span className="modal-view-label">Email</span>
                    <div className="modal-view-value">{selectedUser.email || '—'}</div>
                  </div>
                  <div className="modal-view-row">
                    <span className="modal-view-label">Date d'inscription</span>
                    <div className="modal-view-value">{new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="modal-view-row">
                    <span className="modal-view-label">Signalements</span>
                    <div className="modal-view-value">{selectedUser.nombreSignalements}</div>
                  </div>
                  <div className="modal-view-row">
                    <span className="modal-view-label">Statut</span>
                    <div className="modal-view-value">
                      <span className={`util-badge ${selectedUser.statut === 'Actif' ? 'badge-actif' : 'badge-suspendu'}`}>
                        {selectedUser.statut}
                      </span>
                    </div>
                  </div>
                  <button className="modal-submit btn-secondary" onClick={closeModal}>Fermer</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}