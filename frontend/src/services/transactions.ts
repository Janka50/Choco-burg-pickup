import { api } from './api';

export type TxType = 'ONLINE_ORDER' | 'POS_SALE';

export interface TxItem {
  name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Transaction {
  key: string;
  source: 'order' | 'pos';
  source_id: number;
  type: TxType;
  reference: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: string;
  amount_paid: string | null;
  change_given: string | null;
  customer: string;
  handled_by: string | null;
  notes: string;
  items: TxItem[];
  created_at: string;
}

export interface TxSummary {
  revenue: string;
  online_orders: { count: number; total: string };
  pos_sales: { count: number; total: string };
  pos_by_payment_method: Record<string, { count: number; total: string }>;
  voided_sales: number;
  pending_orders: number;
  rejected_or_cancelled_orders: number;
}

export interface TxFilters {
  type: string;
  status: string;
  payment_method: string;
  date_from: string;
  date_to: string;
  q: string;
}

export const EMPTY_FILTERS: TxFilters = {
  type: '', status: '', payment_method: '', date_from: '', date_to: '', q: '',
};

// Only send filters that have a value
const clean = (f: TxFilters) =>
  Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));

export const transactionService = {
  adminList: (filters: TxFilters, limit: number, offset: number) =>
    api.get<{
      count: number; limit: number; offset: number;
      summary: TxSummary; results: Transaction[];
    }>('/transactions/admin/', { params: { ...clean(filters), limit, offset } }),

  adminExport: (filters: TxFilters) =>
    api.get('/transactions/admin/export/', {
      params: clean(filters),
      responseType: 'blob',
    }),
};
