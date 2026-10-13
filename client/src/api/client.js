const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const authStorage = localStorage.getItem('kurtikatha_auth');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed?.state?.token) {
        headers['Authorization'] = `Bearer ${parsed.state.token}`;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
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
  checkoutOrder: (payload) =>
    apiRequest('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyPayment: (payload) =>
    apiRequest('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getOrder: (id) => apiRequest(`/orders/${id}`),
  getMyOrders: () => apiRequest('/orders/my-orders'),
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
