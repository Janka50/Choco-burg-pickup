import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - refresh token or signal logout
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");

      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, {
            refresh,
          });
          localStorage.setItem("access_token", data.access);
          if (data.refresh) {
            localStorage.setItem("refresh_token", data.refresh);
          }
          if (original.headers) {
            original.headers.Authorization = `Bearer ${data.access}`;
          }
          return api(original);
        } catch {
          // Refresh failed - signal auth context to logout
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          // Dispatch event instead of window.location.href
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }

    return Promise.reject(error);
  }
);

// authService moved to authService.ts
export const productService = {
  inventory: () => api.get("/products/admin/inventory/"),
  list: (search?: string) => api.get("/products/", { params: search ? { search } : {} }),
  adminList: () => api.get("/products/admin/"),
};

export const orderService = {
  // Customer
  list: () => api.get("/orders/"),
  create: (
    items: { product_id: number; quantity: number }[],
    notes?: string
  ) => api.post("/orders/", { items, notes }),
  detail: (id: number) => api.get(`/orders/${id}/`),
  cancel: (id: number) => api.post(`/orders/${id}/cancel/`),
  // Admin
  adminList: (status?: string) =>
    api.get("/orders/admin/", { params: status ? { status } : {} }),
  adminDetail: (id: number) => api.get(`/orders/admin/${id}/`),
  review: (id: number, action: "approve" | "reject") =>
    api.patch(`/orders/admin/${id}/review/`, { action }),
  complete: (id: number) => api.patch(`/orders/admin/${id}/complete/`),
};
