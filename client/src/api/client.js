const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

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
  updateSettings: (data) =>
    apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
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
  sendOtp: (phone) =>
    apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  verifyOtp: (payload) =>
    apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProfile: (data) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
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

  // Admin APIs
  getAdminMetrics: () => apiRequest('/admin/metrics'),
  getAdminProducts: () => apiRequest('/admin/products'),
  createAdminProduct: (data) =>
    apiRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdminProduct: (id, data) =>
    apiRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAdminProduct: (id) =>
    apiRequest(`/admin/products/${id}`, {
      method: 'DELETE',
    }),
  getAdminOrders: (params = '') => apiRequest(`/admin/orders${params ? `?${params}` : ''}`),
  updateAdminOrderStatus: (id, data) =>
    apiRequest(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getAdminCustomers: () => apiRequest('/admin/customers'),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const url = `${API_BASE}/admin/upload`;
    const headers = {};
    try {
      const authStorage = localStorage.getItem('kurtikatha_auth');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed?.state?.token) {
          headers['Authorization'] = `Bearer ${parsed.state.token}`;
        }
      }
    } catch (e) {
      // Ignore parse error
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Upload failed with status ${response.status}`);
    }
    return data;
  },
};

