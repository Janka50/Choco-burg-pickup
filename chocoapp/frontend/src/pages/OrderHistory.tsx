import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent, IonSpinner, IonChip,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/orderService';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#856404',
  APPROVED: '#0a3622',
  REJECTED: '#58151c',
  COMPLETED: '#0c5460',
  CANCELLED: '#383d41',
};

const STATUS_BG: Record<OrderStatus, string> = {
  PENDING: '#fff3cd',
  APPROVED: '#d1e7dd',
  REJECTED: '#f8d7da',
  COMPLETED: '#d1ecf1',
  CANCELLED: '#e2e3e5',
};

const POLL_INTERVAL = 20000; // 20 seconds

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const pollingRef = useRef<ReturnType<typeof setInterval>>();

  const loadOrders = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(true);
    // Poll for updates every 20 seconds
    pollingRef.current = setInterval(() => loadOrders(), POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, []);

  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle style={{ fontFamily: 'Georgia, serif' }}>📋 My Orders</IonTitle></IonToolbar></IonHeader>
      <IonContent style={{ '--background': 'var(--choco-cream)' }}>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await loadOrders(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <IonSpinner name="crescent" style={{ color: 'var(--choco-dark)', transform: 'scale(1.5)' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
            <div style={{ fontSize: '60px' }}>📦</div>
            <h3 style={{ color: 'var(--choco-dark)', fontFamily: 'Georgia, serif' }}>No orders yet</h3>
            <p>Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {orders.map(order => (
              <div key={order.id} onClick={() => history.push(`/orders/${order.id}`)} style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 12px var(--choco-shadow)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', color: 'var(--choco-deep)', fontSize: '1rem' }}>Order #{order.id}</p>
                    <p style={{ margin: '2px 0 0', color: '#999', fontSize: '0.8rem' }}>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span style={{ background: STATUS_BG[order.status], color: STATUS_COLORS[order.status], padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--choco-light)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666', fontSize: '0.875rem' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  <span style={{ fontWeight: '800', color: 'var(--choco-dark)', fontSize: '1.1rem', fontFamily: 'Georgia, serif' }}>${parseFloat(order.total_price).toFixed(2)}</span>
                </div>
                {order.rejection_reason && (
                  <p style={{ margin: '8px 0 0', padding: '8px', background: '#fff0f0', borderRadius: '8px', fontSize: '0.8rem', color: '#c0392b' }}>
                    ❌ {order.rejection_reason}
                  </p>
                )}
              </div>
            ))}
            <p style={{ textAlign: 'center', color: '#bbb', fontSize: '0.75rem', marginTop: '8px' }}>Auto-refreshes every 20 seconds</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrderHistory;
