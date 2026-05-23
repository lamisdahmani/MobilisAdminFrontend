// FILE: MobilisAdminFrontend/src/api/client.js
// Fixed endpoint paths to match the actual backend routes.

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
  // Some endpoints return plain text ("Report deleted.")
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  put:    (path, body)  => request('PUT',    path, body),
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
// Backend route: GET  /api/admin/signalements
//                GET  /api/admin/signalements/:id
//                PATCH /api/admin/signalements/:id/statut
//                DELETE /api/admin/signalements/:id
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
// The backend also sends the push inside the PATCH handler; this call is a
// secondary acknowledgement that doesn't block the UI if it fails.
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