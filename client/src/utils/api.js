const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api`;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
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
