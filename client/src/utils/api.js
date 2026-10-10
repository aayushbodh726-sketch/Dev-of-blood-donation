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

const NO_REFRESH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

async function request(endpoint, options = {}) {
  const token = options.accessToken || localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(SUPABASE_PUBLISHABLE_KEY && { apikey: SUPABASE_PUBLISHABLE_KEY }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  // Don't leak internal options into fetch
  delete config.accessToken;
  delete config._retried;

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const canRefresh = !NO_REFRESH_ENDPOINTS.includes(endpoint);
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

/** Build the URL users land on after clicking the reset link in email. */
export function getPasswordResetRedirectUrl() {
  const origin = window.location.origin;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  // HashRouter path
  return `${origin}${base}/#/reset-password`;
}

/**
 * Parse recovery tokens from the URL after Supabase redirects the user.
 * Supports hash fragments and query strings (HashRouter-friendly).
 */
export function extractRecoveryTokensFromUrl() {
  const href = window.location.href;
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  const tryParse = (raw) => {
    if (!raw || !raw.includes('access_token')) return null;
    // Strip leading # or ? and any path prefix before the params
    let qs = raw.replace(/^[#?]/, '');
    const tokenIdx = qs.indexOf('access_token=');
    if (tokenIdx > 0) qs = qs.slice(tokenIdx);
    const params = new URLSearchParams(qs);
    const accessToken = params.get('access_token');
    const type = params.get('type');
    if (accessToken && (type === 'recovery' || type === 'magiclink' || !type)) {
      return {
        accessToken,
        refreshToken: params.get('refresh_token') || '',
        type: type || 'recovery',
      };
    }
    return null;
  };

  return (
    tryParse(hash)
    || tryParse(search)
    || tryParse(href.includes('#') ? href.split('#').slice(1).join('#') : '')
    || null
  );
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  forgotPassword: (email, redirectTo) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, redirectTo }),
    }),
  resetPassword: (password, accessToken) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
      accessToken,
    }),
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
