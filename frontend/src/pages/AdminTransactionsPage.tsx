import React, { useEffect, useRef, useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonSpinner, IonButton, IonRefresher, IonRefresherContent,
} from '@ionic/react';
import {
  transactionService, EMPTY_FILTERS,
  Transaction, TxFilters, TxSummary,
} from '../services/transactions';

const PAGE_SIZE = 20;

const naira = (v: string | number | null | undefined) =>
  '₦' + (parseFloat(String(v ?? 0)) || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  PENDING: { bg: '#FEF9E7', fg: '#E67E22' },
  APPROVED: { bg: '#EAF7EC', fg: '#2D7A3A' },
  REJECTED: { bg: '#FDEDEC', fg: '#C0392B' },
  COMPLETED: { bg: '#EAF2FF', fg: '#1A5DB5' },
  CANCELLED: { bg: '#F5F5F5', fg: '#666666' },
  VOIDED: { bg: '#FDEDEC', fg: '#C0392B' },
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PAID: 'Paid', UNPAID: 'Unpaid', NOT_REQUIRED: 'No payment', VOIDED: 'Voided',
};

const METHOD_LABEL: Record<string, string> = {
  PAY_AT_PICKUP: 'Pay at pickup', CASH: 'Cash', CARD: 'Card', TRANSFER: 'Transfer',
};

const box: React.CSSProperties = {
  background: 'white', borderRadius: 14, padding: 14,
  boxShadow: '0 2px 8px rgba(9,107,172,0.10)',
};

const input: React.CSSProperties = {
  width: '100%', padding: '9px 10px', borderRadius: 8,
  border: '1px solid #cfe0ee', background: 'white', fontSize: 14,
  boxSizing: 'border-box',
};

const AdminTransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState<TxFilters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<Transaction[]>([]);
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState<TxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const requestId = useRef(0);

  const fetchPage = async (offset: number) => {
    const id = ++requestId.current;
    offset === 0 ? setLoading(true) : setLoadingMore(true);
    try {
      const { data } = await transactionService.adminList(filters, PAGE_SIZE, offset);
      if (id !== requestId.current) return; // a newer request replaced this one
      setRows(prev => (offset === 0 ? data.results : [...prev, ...data.results]));
      setCount(data.count);
      if (offset === 0) setSummary(data.summary);
      setError('');
    } catch (e: any) {
      if (id !== requestId.current) return;
      setError(e?.response?.data?.detail || 'Failed to load transactions.');
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  // Reload from the top whenever a filter changes (small delay while typing)
  useEffect(() => {
    const t = window.setTimeout(() => fetchPage(0), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const setFilter = (key: keyof TxFilters, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleRefresh = async (event: CustomEvent) => {
    await fetchPage(0);
    (event.target as HTMLIonRefresherElement).complete();
  };

  const downloadCsv = async () => {
    setExporting(true);
    try {
      const res = await transactionService.adminExport(filters);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not download the CSV.');
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Transactions</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent style={{ '--background': '#f4f8fb' } as React.CSSProperties}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
          {/* Totals */}
          {summary && (
            <>
              <div style={{
                display: 'grid', gap: 10, marginBottom: 6,
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              }}>
                <div style={{ ...box, background: '#096bac', color: 'white' }}>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>Revenue</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{naira(summary.revenue)}</div>
                </div>
                <div style={box}>
                  <div style={{ fontSize: 12, color: '#4f6b80' }}>Online orders (completed)</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#096bac' }}>{naira(summary.online_orders.total)}</div>
                  <div style={{ fontSize: 12, color: '#4f6b80' }}>{summary.online_orders.count} order(s)</div>
                </div>
                <div style={box}>
                  <div style={{ fontSize: 12, color: '#4f6b80' }}>POS sales</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#096bac' }}>{naira(summary.pos_sales.total)}</div>
                  <div style={{ fontSize: 12, color: '#4f6b80' }}>{summary.pos_sales.count} sale(s)</div>
                </div>
                <div style={box}>
                  <div style={{ fontSize: 12, color: '#4f6b80' }}>Needs attention</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>⏳ {summary.pending_orders} pending order(s)</div>
                  <div style={{ fontSize: 13 }}>🚫 {summary.voided_sales} voided sale(s)</div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#7a93a5', margin: '0 0 14px' }}>
                Revenue counts completed online orders and POS sales that were not voided. Totals follow the filters below.
              </p>
            </>
          )}

          {/* Filters */}
          <div style={{ ...box, marginBottom: 14 }}>
            <input
              type="search" placeholder="Search reference, customer or cashier"
              value={filters.q} onChange={e => setFilter('q', e.target.value)}
              style={{ ...input, marginBottom: 10 }}
            />
            <div style={{
              display: 'grid', gap: 10,
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            }}>
              <select value={filters.type} onChange={e => setFilter('type', e.target.value)} style={input}>
                <option value="">All types</option>
                <option value="ONLINE_ORDER">Online orders</option>
                <option value="POS_SALE">POS sales</option>
              </select>
              <select value={filters.status} onChange={e => setFilter('status', e.target.value)} style={input}>
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="VOIDED">Voided</option>
              </select>
              <select value={filters.payment_method} onChange={e => setFilter('payment_method', e.target.value)} style={input}>
                <option value="">All payment methods</option>
                <option value="PAY_AT_PICKUP">Pay at pickup</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="TRANSFER">Transfer</option>
              </select>
              <input type="date" aria-label="From date" value={filters.date_from}
                onChange={e => setFilter('date_from', e.target.value)} style={input} />
              <input type="date" aria-label="To date" value={filters.date_to}
                onChange={e => setFilter('date_to', e.target.value)} style={input} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <IonButton size="small" fill="outline" disabled={!hasFilters}
                onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear filters
              </IonButton>
              <IonButton size="small" disabled={exporting || count === 0} onClick={downloadCsv}>
                {exporting ? 'Preparing…' : 'Download CSV'}
              </IonButton>
            </div>
          </div>

          {error && (
            <div style={{ color: '#C0392B', background: '#FDEDEC', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          )}

          {!loading && rows.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#4f6b80' }}>
              <div style={{ fontSize: 48 }}>🧾</div>
              <h3 style={{ margin: '8px 0 4px' }}>No transactions found</h3>
              <p style={{ margin: 0 }}>{hasFilters ? 'Try changing or clearing the filters.' : 'Orders and sales will appear here.'}</p>
            </div>
          )}

          {/* Records */}
          {!loading && rows.map(tx => {
            const st = STATUS_STYLE[tx.status] || STATUS_STYLE.CANCELLED;
            const isOpen = open === tx.key;
            return (
              <div key={tx.key} style={{ ...box, marginBottom: 10, cursor: 'pointer' }}
                onClick={() => setOpen(isOpen ? null : tx.key)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, wordBreak: 'break-all' }}>{tx.reference}</div>
                    <div style={{ fontSize: 12, color: '#4f6b80' }}>{when(tx.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: '#096bac', fontSize: 16 }}>{naira(tx.total)}</div>
                    <span style={{ background: st.bg, color: st.fg, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {tx.status}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#4f6b80', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
                  <span>{tx.type === 'ONLINE_ORDER' ? '📱 Online order' : '🏪 POS sale'}</span>
                  <span>{METHOD_LABEL[tx.payment_method] || tx.payment_method}</span>
                  <span>{PAYMENT_STATUS_LABEL[tx.payment_status] || tx.payment_status}</span>
                  <span>👤 {tx.customer}</span>
                  {tx.handled_by && <span>🧑‍💼 {tx.handled_by}</span>}
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #cfe0ee', marginTop: 10, paddingTop: 8 }}>
                    {tx.items.map((it, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span>{it.name} × {it.quantity}</span>
                        <span style={{ color: '#4f6b80' }}>{naira(it.subtotal)}</span>
                      </div>
                    ))}
                    {tx.amount_paid !== null && (
                      <div style={{ fontSize: 12, color: '#4f6b80', marginTop: 6 }}>
                        Paid {naira(tx.amount_paid)}
                        {tx.change_given !== null && ` · Change ${naira(tx.change_given)}`}
                      </div>
                    )}
                    {tx.notes && (
                      <div style={{ fontSize: 12, color: '#4f6b80', marginTop: 6 }}>
                        {tx.status === 'VOIDED' ? 'Void reason: ' : 'Note: '}{tx.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!loading && rows.length < count && (
            <div style={{ textAlign: 'center', margin: '10px 0 30px' }}>
              <IonButton fill="outline" disabled={loadingMore} onClick={() => fetchPage(rows.length)}>
                {loadingMore ? 'Loading…' : `Load more (${count - rows.length} left)`}
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminTransactionsPage;
