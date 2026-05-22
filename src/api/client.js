// FILE: MobilisAdminFrontend/src/api/client.js
// ADDED: notificationsApi.sendStatusUpdate() — called by Signalements after
//        an admin changes a report status, which triggers a push notification
//        to the mobile user via the backend.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5253';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (emailOrPhone, password) =>
    api.post('/api/admin/auth/login', { emailOrPhone, password }),
};

// ── Dashboard stats ───────────────────────────────────────────────────────────
export const statsApi = {
  getDashboard:    ()            => api.get('/api/admin/statistiques/dashboard'),
  getStatistiques: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return api.get(`/api/admin/statistiques${qs ? '?' + qs : ''}`);
  },
  getHeatmap: () => api.get('/api/admin/statistiques/heatmap'),
};

// ── Reports / Signalements ────────────────────────────────────────────────────
export const reportsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return api.get(`/api/admin/signalements${qs ? '?' + qs : ''}`);
  },
  getById:      (id)       => api.get(`/api/admin/signalements/${id}`),
  updateStatut: (id, body) => api.patch(`/api/admin/signalements/${id}/statut`, body),
  delete:       (id)       => api.delete(`/api/admin/signalements/${id}`),
};

// ── Push Notifications (mobile sync) ─────────────────────────────────────────
// Called after updateStatut so the mobile user gets an instant push notification.
// The backend endpoint should look up the user's FCM/Expo token by reportId
// and send the notification + update mobile app state.
//
// Expected backend route: POST /api/admin/notifications/status-update
// Body: { reportId, statut, notesAdmin }
// The backend handles finding the right user and sending the push.
export const notificationsApi = {
  sendStatusUpdate: (reportId, statut, notesAdmin = '') =>
    api.post('/api/admin/notifications/status-update', {
      reportId,
      statut,
      notesAdmin,
    }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getStats: ()            => api.get('/api/admin/users/stats'),
  getAll:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return api.get(`/api/admin/users${qs ? '?' + qs : ''}`);
  },
  getById:          (id)       => api.get(`/api/admin/users/${id}`),
  suspendre:        (id, body) => api.post(`/api/admin/users/${id}/suspendre`, body),
  reactiver:        (id)       => api.post(`/api/admin/users/${id}/reactiver`),
  getHistorique:    (id)       => api.get(`/api/admin/users/${id}/historique-suspensions`),
};