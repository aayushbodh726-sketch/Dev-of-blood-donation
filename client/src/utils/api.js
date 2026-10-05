const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function readJsonResponse(response) {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(`The API returned an empty response (HTTP ${response.status}). Check that the API is running and that its URL is configured correctly.`);
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`The API returned an invalid response (HTTP ${response.status}). Check that the API URL points to the LifeFlow API.`);
  }
}

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
      let refreshData;
      try {
        refreshData = await readJsonResponse(refreshed);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        throw new Error('Your session could not be refreshed. Please sign in again.');
      }
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

  const data = await readJsonResponse(res);
  
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
