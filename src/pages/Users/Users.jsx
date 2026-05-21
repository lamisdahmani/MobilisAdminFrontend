import { useState } from 'react';
import { Search, Eye, Ban, ChevronLeft, ChevronRight, Users, UserCheck, UserX, X } from 'lucide-react';
import './Users.css';
import t from '../../i18n/translations.json';
import { useLang } from '../../context/LanguageContext';
import { MOCK_USERS_DATA } from '../../Data/UsersData';

export default function Utilisateurs() {
  const { lang } = useLang();
  const u = t.utilisateurs;

  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('tous');
  const [page, setPage]                 = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const [modalMode, setModalMode]       = useState('ban'); // 'ban' or 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [raison, setRaison]             = useState('');
  const [dateDebut, setDateDebut]       = useState('');
  const [dateFin, setDateFin]           = useState('');
  const totalPages = 40;

  const filtered = MOCK_USERS_DATA.filter(row => {
    const matchSearch = row.msisdn.includes(search);
    const matchFilter = filter === 'tous' || row.status === filter;
    return matchSearch && matchFilter;
  });

  const openBanModal = (user) => {
    setSelectedUser(user);
    setModalMode('ban');
    setRaison('');
    setDateDebut('');
    setDateFin('');
    setShowModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleEnregistrer = () => {
    console.log({ user: selectedUser, raison, dateDebut, dateFin });
    closeModal();
  };

  return (
    <div className="util-page">

      {/* Stats Wrapper */}
      <div className="util-stats">
        <div className="util-stat-card">
          <div className="util-stat-icon icon-total">
            <Users size={22} color="#1b6b3a" />
          </div>
          <div>
            <p className="util-stat-label">{u.stats.total[lang]}</p>
            <p className="util-stat-value">5 631</p>
          </div>
        </div>
        <div className="util-stat-card">
          <div className="util-stat-icon icon-actif">
            <UserCheck size={22} color="#1b6b3a" />
          </div>
          <div>
            <p className="util-stat-label">{u.stats.actifs[lang]}</p>
            <p className="util-stat-value">4 882</p>
          </div>
        </div>
        <div className="util-stat-card">
          <div className="util-stat-icon icon-suspendu">
            <UserX size={22} color="#e63946" />
          </div>
          <div>
            <p className="util-stat-label">{u.stats.suspendus[lang]}</p>
            <p className="util-stat-value">214</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="util-table-card">
        <div className="util-topbar">
          <div className="util-search-wrap">
            <Search size={16} color="#aaa" />
            <input
              className="util-search"
              placeholder={u.searchPlaceholder[lang]}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="util-select" value={filter} onChange={e => setFilter(e.target.value)}>
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
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td className="cell-msisdn">{row.msisdn}</td>
                  <td>{row.date}</td>
                  <td>{row.signalements}</td>
                  <td>
                    <span className={`util-badge ${row.status === 'actif' ? 'badge-actif' : 'badge-suspendu'}`}>
                      {u.status[row.status][lang]}
                    </span>
                  </td>
                  <td>
                    <div className="util-actions">
                      <button className="util-action-btn view" onClick={() => openViewModal(row)}>
                        <Eye size={14} />
                      </button>
                      <button className="util-action-btn ban" onClick={() => openBanModal(row)}>
                        <Ban size={14} />
                      </button>
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
          {[1, 2, 3, 4].map(n => (
            <button key={n} className={`util-page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>
              {n}
            </button>
          ))}
          <span className="util-page-dots">...</span>
          <button className="util-page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>
          <button className="util-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Shared Modals Container */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'ban' ? u.modal.title[lang] : "Détails de l'utilisateur"}</h3>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            
            <div className="modal-body">
              {modalMode === 'ban' ? (
                /* BAN MODAL MODE */
                <>
                  <div className="modal-field">
                    <label>{u.modal.raisonLabel[lang]}</label>
                    <textarea
                      className="modal-textarea"
                      placeholder={u.modal.raisonPlaceholder[lang]}
                      value={raison}
                      onChange={e => setRaison(e.target.value)}
                    />
                  </div>
                  <div className="modal-field">
                    <label>{u.modal.dateDebut[lang]}</label>
                    <div className="modal-input-wrap">
                      <input type="date" className="modal-input" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                    </div>
                  </div>
                  <div className="modal-field">
                    <label>{u.modal.dateFin[lang]}</label>
                    <div className="modal-input-wrap">
                      <input type="date" className="modal-input" value={dateFin} onChange={e => setDateFin(e.target.value)} />
                    </div>
                  </div>
                  <button className="modal-submit" onClick={handleEnregistrer}>{u.modal.submitBtn[lang]}</button>
                </>
              ) : (
                /* VIEW DETAILS MODAL MODE */
                <>
                  <div className="modal-view-row">
                    <span className="modal-view-label">MSISDN</span>
                    <div className="modal-view-value">{selectedUser?.msisdn}</div>
                  </div>
                  <div className="modal-view-row">
                    <span className="modal-view-label">Date d'inscription</span>
                    <div className="modal-view-value">{selectedUser?.date}</div>
                  </div>
                  <div className="modal-view-row">
                    <span className="modal-view-label">Signalements</span>
                    <div className="modal-view-value">{selectedUser?.signalements}</div>
                  </div>
                  <div className="modal-view-row">
                    <span className="modal-view-label">Status</span>
                    <div className="modal-view-value">
                      <span className={`util-badge ${selectedUser?.status === 'actif' ? 'badge-actif' : 'badge-suspendu'}`}>
                        {u.status[selectedUser?.status][lang]}
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