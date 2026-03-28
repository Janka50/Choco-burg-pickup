import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonSpinner, IonRefresher, IonRefresherContent,
} from '@ionic/react';
import { orderService } from '../services/api';
import { Order, OrderStatus } from '../types';

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#E67E22', APPROVED: '#2D7A3A',
  REJECTED: '#C0392B', COMPLETED: '#1A5DB5', CANCELLED: '#666',
};
const STATUS_BG: Record<string, string> = {
  PENDING: '#FEF9E7', APPROVED: '#EAF7EC',
  REJECTED: '#FDEDEC', COMPLETED: '#EAF2FF', CANCELLED: '#F5F5F5',
};

const FILTERS = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'];

const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchOrders = async (status?: string) => {
    try {
      const { data } = await orderService.adminList(status || filterStatus);
      setOrders(data.results || data);
      setError('');
    } catch {
      setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(filterStatus); }, [filterStatus]);

  const handleReview = async (id: number, action: 'approve' | 'reject') => {
    const label = action === 'approve' ? 'Approve' : 'Reject';
    const msg = action === 'approve'
      ? 'Approve this order? Stock will be deducted.'
      : 'Reject this order?';
    if (!window.confirm(`${label} Order #${id}?\n\n${msg}`)) return;
    setProcessing(id);
    try {
      await orderService.review(id, action);
      await fetchOrders(filterStatus);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Action failed.');
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async (id: number) => {
    if (!window.confirm(`Mark Order #${id} as completed?`)) return;
    setProcessing(id);
    try {
      await orderService.complete(id);
      await fetchOrders(filterStatus);
    } catch {
      setError('Failed to complete order.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>🍫 Admin Dashboard</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await fetchOrders(filterStatus); (e.target as any).complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: 16, maxWidth: 640, margin: '0 auto' }}>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {FILTERS.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{
                  padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                  background: filterStatus === s ? '#3D1C02' : '#F5E6D3',
                  color: filterStatus === s ? '#FDF6EC' : '#6B3A1F',
                }}>
                {s}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: '#FDEDEC', color: '#C0392B', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7A5C45' }}>
              <div style={{ fontSize: 48 }}>✅</div>
              <p>No {filterStatus.toLowerCase()} orders yet.</p>
            </div>
          )}

          {orders.map(order => (
            <div key={order.id} style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontFamily: 'serif', margin: '0 0 2px', fontSize: 17 }}>Order #{order.id}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#7A5C45' }}>{order.user_email}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>
                    {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span style={{ background: STATUS_BG[order.status], color: STATUS_COLOR[order.status], padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div style={{ borderTop: '1px solid #E8D5BE', borderBottom: '1px solid #E8D5BE', padding: '8px 0', marginBottom: 12 }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{item.product_name} ×{item.quantity}</span>
                    <span style={{ color: '#7A5C45' }}>₦{parseFloat(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div style={{ background: '#FDF6EC', borderRadius: 8, padding: '6px 10px', marginBottom: 10, fontSize: 13, color: '#7A5C45' }}>
                  📝 {order.notes}
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#3D1C02' }}>
                  ₦{parseFloat(order.total_price).toLocaleString()}
                </span>

                <div style={{ display: 'flex', gap: 8 }}>
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleReview(order.id, 'approve')}
                        disabled={processing === order.id}
                        style={{ background: '#2D7A3A', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        {processing === order.id ? '...' : '✅ Approve'}
                      </button>
                      <button
                        onClick={() => handleReview(order.id, 'reject')}
                        disabled={processing === order.id}
                        style={{ background: 'transparent', color: '#C0392B', border: '2px solid #C0392B', borderRadius: 10, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        ❌ Reject
                      </button>
                    </>
                  )}
                  {order.status === 'APPROVED' && (
                    <button
                      onClick={() => handleComplete(order.id)}
                      disabled={processing === order.id}
                      style={{ background: '#1A5DB5', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      {processing === order.id ? '...' : '🎉 Mark Completed'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboardPage;
