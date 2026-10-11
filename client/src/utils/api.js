import { supabase } from './supabase';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Production site root (GitHub Pages). Email links must point here, not localhost. */
const PRODUCTION_SITE_URL = 'https://aayushbodh726-sketch.github.io/Dev-of-blood-donation/';

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
  delete config.accessToken;
  delete config._retried;

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const canRefresh = !NO_REFRESH_ENDPOINTS.includes(endpoint);
  if (res.status === 401 && canRefresh && !options._retried) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshed = await refreshSession(refreshToken);
        if (refreshed?.token) {
          localStorage.setItem('token', refreshed.token);
          localStorage.setItem('refreshToken', refreshed.refreshToken);
          window.dispatchEvent(new Event('auth-token-refreshed'));
          return request(endpoint, { ...options, _retried: true });
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        throw new Error('Your session could not be refreshed. Please sign in again.');
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

/** Refresh using Supabase Auth (reliable) with API fallback. */
async function refreshSession(refreshToken) {
  if (supabase) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (!error && data.session) {
      return {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    }
  }
  const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SUPABASE_PUBLISHABLE_KEY && { apikey: SUPABASE_PUBLISHABLE_KEY }),
    },
    body: JSON.stringify({ refreshToken }),
  });
  const refreshData = await readJsonResponse(refreshed);
  if (refreshed.ok && refreshData.success) {
    return {
      token: refreshData.data.token,
      refreshToken: refreshData.data.refreshToken,
    };
  }
  return null;
}

export function getPasswordResetRedirectUrl() {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (isLocal) {
    return `${window.location.origin}/`;
  }
  return PRODUCTION_SITE_URL;
}

export function extractRecoveryTokensFromUrl() {
  const href = window.location.href;
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  const tryParse = (raw) => {
    if (!raw || !raw.includes('access_token')) return null;
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

/**
 * Login via Supabase Auth (the Edge Function signInWithPassword path is unreliable).
 * Then load the LifeFlow profile from /auth/me.
 */
async function login(body) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) {
    throw new Error('Invalid email or password');
  }

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error('Invalid email or password');
    }
    const me = await request('/auth/me', { accessToken: data.session.access_token });
    // Clear supabase client session so we only use our own token storage
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      /* ignore */
    }
    return {
      success: true,
      data: {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: me.data,
      },
    };
  }

  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

async function forgotPassword(email, redirectTo) {
  const target = redirectTo || getPasswordResetRedirectUrl();
  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: target,
    });
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('rate') || msg.includes('limit')) {
        throw new Error('Too many reset attempts. Please wait a few minutes and try again.');
      }
      console.warn('resetPasswordForEmail:', error.message);
    }
    return {
      success: true,
      message:
        'If an account exists for that email, a password reset link has been sent. Please check your inbox and spam folder.',
    };
  }

  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email, redirectTo: target }),
  });
}

async function resetPassword(password, accessToken, refreshToken = '') {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  if (!accessToken) {
    throw new Error('Invalid or expired reset link. Please request a new one.');
  }

  if (supabase) {
    const sessionPayload = {
      access_token: accessToken,
      refresh_token: refreshToken || accessToken,
    };
    const { error: sessionError } = await supabase.auth.setSession(sessionPayload);
    if (sessionError) {
      try {
        return await request('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ password }),
          accessToken,
        });
      } catch {
        throw new Error('Invalid or expired reset link. Please request a new one.');
      }
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(error.message || 'Could not update password');
    }
    await supabase.auth.signOut({ scope: 'local' });
    return {
      success: true,
      message: 'Your password has been updated. You can now sign in with your new password.',
    };
  }

  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
    accessToken,
  });
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login,
  getMe: () => request('/auth/me'),
  forgotPassword,
  resetPassword,
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
