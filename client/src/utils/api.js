const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(SUPABASE_PUBLISHABLE_KEY && { apikey: SUPABASE_PUBLISHABLE_KEY }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const canRefresh = !['/auth/login', '/auth/register', '/auth/refresh'].includes(endpoint);
  if (res.status === 401 && canRefresh && !options._retried) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SUPABASE_PUBLISHABLE_KEY && { apikey: SUPABASE_PUBLISHABLE_KEY }),
        },
        body: JSON.stringify({ refreshToken }),
      });
      const refreshData = await refreshed.json();
      if (refreshed.ok && refreshData.success) {
        localStorage.setItem('token', refreshData.data.token);
        localStorage.setItem('refreshToken', refreshData.data.refreshToken);
        window.dispatchEvent(new Event('auth-token-refreshed'));
        return request(endpoint, { ...options, _retried: true });
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  searchDonors: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, v); });
    return request(`/donors/search?${query.toString()}`);
  },
  toggleAvailability: () => request('/donors/availability', { method: 'PUT' }),
  createRequest: (body) => request('/requests', { method: 'POST', body: JSON.stringify(body) }),
  getRequests: (status) => request(`/requests${status ? `?status=${status}` : ''}`),
  pledgeToRequest: (id) => request(`/requests/${id}/pledge`, { method: 'POST' }),
  getStats: () => request('/stats'),
};
