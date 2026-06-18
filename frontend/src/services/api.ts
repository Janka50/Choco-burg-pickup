import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const access = localStorage.getItem('access_token');
  if (access && config.headers) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          if (original.headers) original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          // Refresh failed - clear and redirect
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        // No refresh token - redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
// authService moved to authService.ts

// Products
export const productService = {
  list: (search?: string) =>
    api.get('/products/', { params: search ? { search } : {} }),
  detail: (id: number) => api.get(`/products/${id}/`),
  // Admin
  adminList: () => api.get('/products/admin/'),
  adminCreate: (data: FormData) =>
    api.post('/products/admin/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminUpdate: (id: number, data: FormData | object) =>
    api.patch(`/products/admin/${id}/`, data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  adminDelete: (id: number) => api.delete(`/products/admin/${id}/`),
  inventory: () => api.get('/products/admin/inventory/'),
};

// Orders
export const orderService = {
  // Customer
  list: () => api.get('/orders/'),
  create: (items: { product_id: number; quantity: number }[], notes?: string) =>
    api.post('/orders/', { items, notes }),
  detail: (id: number) => api.get(`/orders/${id}/`),
  cancel: (id: number) => api.post(`/orders/${id}/cancel/`),
  // Admin
  adminList: (status?: string) =>
    api.get('/orders/admin/', { params: status ? { status } : {} }),
  adminDetail: (id: number) => api.get(`/orders/admin/${id}/`),
  review: (id: number, action: 'approve' | 'reject') =>
    api.patch(`/orders/admin/${id}/review/`, { action }),
  complete: (id: number) => api.patch(`/orders/admin/${id}/complete/`),
};
