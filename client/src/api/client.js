const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If token is stored in localStorage / state, send Authorization header as fallback
  try {
    const authStorage = localStorage.getItem('kurtikatha_auth');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed?.state?.token) {
        headers['Authorization'] = `Bearer ${parsed.state.token}`;
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends httpOnly cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
}

// API methods
export const api = {
  getProducts: (params = '') => apiRequest(`/products${params ? `?${params}` : ''}`),
  getFeatured: () => apiRequest('/products/featured'),
  getProduct: (idOrSlug) => apiRequest(`/products/${idOrSlug}`),
  getCategories: () => apiRequest('/categories'),
  getSettings: () => apiRequest('/settings'),
  validateCoupon: (code, orderSubtotal) =>
    apiRequest('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderSubtotal }),
    }),
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};
