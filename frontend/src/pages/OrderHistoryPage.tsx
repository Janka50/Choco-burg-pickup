import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonSpinner, IonText, IonRefresher, IonRefresherContent,
  IonBadge, IonButton,
} from '@ionic/react';
import { orderService } from '../services/api';
import { Order, OrderStatus } from '../types';
import './OrderHistoryPage.css';

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'primary',
  CANCELLED: 'medium',
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
    // Poll every 20 seconds for live status updates
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
        <IonToolbar>
          <IonTitle>My Orders</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="poll-indicator">
          <span>🔄 Auto-refreshing every 20s</span>
        </div>

        {loading && (
          <div className="orders-loading"><IonSpinner name="crescent" color="primary" /></div>
        )}

        {error && <div className="orders-error"><IonText color="danger">{error}</IonText></div>}

        {!loading && orders.length === 0 && (
          <div className="orders-empty">
            <div>📦</div>
            <p>No orders yet. Place your first order!</p>
            <IonButton routerLink="/shop" className="orders-shop-btn">Browse Menu</IonButton>
          </div>
        )}

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <span className="order-id">Order #{order.id}</span>
                <IonBadge color={STATUS_COLOR[order.status]}>
                  {STATUS_ICON[order.status]} {order.status}
                </IonBadge>
              </div>

              <div className="order-items-list">
                {order.items.map(item => (
                  <div key={item.id} className="order-item-row">
                    <span>{item.product_name}</span>
                    <span className="order-item-qty">x{item.quantity}</span>
                    <span className="order-item-price">₦{parseFloat(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <span className="order-total">₦{parseFloat(order.total_price).toLocaleString()}</span>
              </div>

              {order.status === 'APPROVED' && (
                <div className="order-pickup-notice">
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
