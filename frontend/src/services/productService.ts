import api from './api';
import { Product, InventorySummary } from '../types';

export const productService = {
  async getProducts(): Promise<Product[]> {
    const { data } = await api.get('/products/');
    return data.results || data;
  },

  async getAdminProducts(): Promise<Product[]> {
    const { data } = await api.get('/products/admin/');
    return data.results || data;
  },

  async getInventory(): Promise<InventorySummary> {
    const { data } = await api.get('/products/admin/inventory/');
    return data;
  },

  async createProduct(formData: FormData): Promise<Product> {
    const { data } = await api.post('/products/admin/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async updateProduct(id: number, formData: FormData): Promise<Product> {
    const { data } = await api.patch(`/products/admin/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
