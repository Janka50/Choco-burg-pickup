import api from './api';
import { Order, PaginatedResponse } from '../types';

export const orderService = {
  async createOrder(items: { product_id: number; quantity: number }[], notes?: string): Promise<Order> {
    const { data } = await api.post<Order>('/orders/', { items, notes });
    return data;
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders/');
    return data.results || [];
  },

  async getOrderById(id: number): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}/`);
    return data;
  },

  async cancelOrder(id: number): Promise<Order> {
    const { data } = await api.post<Order>(`/orders/${id}/cancel/`);
    return data;
  },

  // Admin
  async getAdminOrders(statusFilter?: string): Promise<Order[]> {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    const { data } = await api.get<PaginatedResponse<Order>>(`/orders/admin/${params}`);
    return data.results || [];
  },

  async approveOrder(id: number): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/admin/${id}/action/`, { action: 'approve' });
    return data;
  },

  async rejectOrder(id: number, rejection_reason: string): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/admin/${id}/action/`, { action: 'reject', rejection_reason });
    return data;
  },

  async completeOrder(id: number): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/admin/${id}/action/`, { action: 'complete' });
    return data;
  },
};
