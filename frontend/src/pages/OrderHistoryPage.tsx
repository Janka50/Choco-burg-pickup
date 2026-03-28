import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonSpinner, IonRefresher, IonRefresherContent, IonButton,
} from '@ionic/react';
import { orderService } from '../services/api';
import { Order, OrderStatus } from '../types';

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: '#E67E22',
  APPROVED: '#2D7A3A',
  REJECTED: '#C0392B',
  COMPLETED: '#1A5DB5',
  CANCELLED: '#666',
};

const STATUS_BG: Record<OrderStatus, string> = {
  PENDING: '#FEF9E7',
  APPROVED: '#EAF7EC',
  REJECTED: '#FDEDEC',
  COMPLETED: '#EAF2FF',
  CANCELLED: '#F5F5F5',
};

const STATUS_ICON: Record<OrderStatus, string> = {
  PENDING: '⏳',
  APPROVED: '✅',
  REJECTED: '❌',
  COMPLETED: '🎉',
  CANCELLED: '🚫',
};

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pollRef = useRef<number | null>(null);

  const fetchOrders = async () => {
    try {
      const { data } = await orderService.list();
      setOrders(data.results || data);
      setError('');
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    pollRef.current = window.setInterval(fetchOrders, 20000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchOrders();
    (event.target as HTMLIonRefresherElement).complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>My Orders</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          )}

          {error && (
            <div style={{ color: '#C0392B', background: '#FDEDEC', padding: '10px 14px', borderRadius: 8 }}>
              {error}
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A5C45' }}>
              <div style={{ fontSize: 56 }}>📦</div>
              <h3 style={{ fontFamily: 'serif' }}>No orders yet</h3>
              <p>Place your first order!</p>
              <IonButton routerLink="/shop">Browse Menu</IonButton>
            </div>
          )}

          {orders.map(order => (
            <div key={order.id} style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontFamily: 'serif', margin: '0 0 4px', fontSize: 17 }}>Order #{order.id}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#7A5C45' }}>
                    {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span style={{ background: STATUS_BG[order.status], color: STATUS_COLOR[order.status], padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {STATUS_ICON[order.status]} {order.status}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #E8D5BE', borderBottom: '1px solid #E8D5BE', padding: '8px 0', marginBottom: 10 }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{item.product_name} x{item.quantity}</span>
                    <span style={{ color: '#7A5C45' }}>₦{parseFloat(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ color: '#7A5C45', fontSize: 13 }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                <span style={{ color: '#6B3A1F', fontSize: 16 }}>₦{parseFloat(order.total_price).toLocaleString()}</span>
              </div>

              {order.status === 'APPROVED' && (
                <div style={{ marginTop: 10, background: '#EAF7EC', color: '#2D7A3A', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>
                  🎉 Your order is ready! Come pick it up.
                </div>
              )}
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrderHistoryPage;
