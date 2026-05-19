import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonSpinner, IonText, IonButton, IonSegment, IonSegmentButton,
  IonLabel, IonRefresher, IonRefresherContent, IonAlert, IonBadge,
} from '@ionic/react';
import { orderService } from '../services/api';
import { Order, OrderStatus } from '../types';
import './AdminDashboardPage.css';

const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [actionOrder, setActionOrder] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchOrders = async (status?: string) => {
    try {
      const { data } = await orderService.adminList(status || filterStatus);
      setOrders(data.results || data);
      setError('');
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(filterStatus); }, [filterStatus]);

  const handleReview = async () => {
    if (!actionOrder) return;
    setProcessing(actionOrder.id);
    try {
      await orderService.review(actionOrder.id, actionOrder.action);
      await fetchOrders(filterStatus);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Action failed.';
      setError(msg);
    } finally {
      setProcessing(null);
      setActionOrder(null);
    }
  };

  const handleComplete = async (id: number) => {
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
        <IonToolbar>
          <IonTitle>🍫 Admin Dashboard</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            value={filterStatus}
            onIonChange={e => setFilterStatus(e.detail.value as string)}
            className="admin-segment"
          >
            {['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map(s => (
              <IonSegmentButton key={s} value={s}>
                <IonLabel>{s}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await fetchOrders(filterStatus); (e.target as any).complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {error && <div className="admin-error"><IonText color="danger">{error}</IonText></div>}

        {loading && <div className="admin-loading"><IonSpinner name="crescent" color="primary" /></div>}

        {!loading && orders.length === 0 && (
          <div className="admin-empty">
            <p>No {filterStatus.toLowerCase()} orders.</p>
          </div>
        )}

        <div className="admin-orders-list">
          {orders.map(order => (
            <div key={order.id} className="admin-order-card">
              <div className="admin-order-header">
                <div>
                  <span className="admin-order-id">Order #{order.id}</span>
                  <span className="admin-order-user">{order.user_email}</span>
                </div>
                <span className="admin-order-time">
                  {new Date(order.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="admin-order-items">
                {order.items.map(item => (
                  <div key={item.id} className="admin-item-row">
                    <span className="admin-item-name">{item.product_name}</span>
                    <span className="admin-item-qty">×{item.quantity}</span>
                    <span className="admin-item-price">₦{parseFloat(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="admin-order-notes">📝 {order.notes}</div>
              )}

              <div className="admin-order-footer">
                <span className="admin-order-total">₦{parseFloat(order.total_price).toLocaleString()}</span>

                {order.status === 'PENDING' && (
                  <div className="admin-actions">
                    <IonButton
                      size="small"
                      color="success"
                      className="admin-btn"
                      disabled={processing === order.id}
                      onClick={() => setActionOrder({ id: order.id, action: 'approve' })}
                    >
                      {processing === order.id ? <IonSpinner name="crescent" /> : '✅ Approve'}
                    </IonButton>
                    <IonButton
                      size="small"
                      color="danger"
                      fill="outline"
                      className="admin-btn"
                      disabled={processing === order.id}
                      onClick={() => setActionOrder({ id: order.id, action: 'reject' })}
                    >
                      ❌ Reject
                    </IonButton>
                  </div>
                )}

                {order.status === 'APPROVED' && (
                  <IonButton
                    size="small"
                    color="primary"
                    className="admin-btn"
                    disabled={processing === order.id}
                    onClick={() => handleComplete(order.id)}
                  >
                    {processing === order.id ? <IonSpinner name="crescent" /> : '🎉 Mark Completed'}
                  </IonButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </IonContent>

      <IonAlert
        isOpen={!!actionOrder}
        onDidDismiss={() => setActionOrder(null)}
        header={`${actionOrder?.action === 'approve' ? 'Approve' : 'Reject'} Order #${actionOrder?.id}`}
        message={actionOrder?.action === 'approve'
          ? 'Stock will be deducted. This cannot be undone.'
          : 'Are you sure you want to reject this order?'}
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Confirm', handler: handleReview },
        ]}
      />
    </IonPage>
  );
};

export default AdminDashboardPage;
