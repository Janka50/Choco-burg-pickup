import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent, IonSpinner, IonSegment, IonSegmentButton,
  IonLabel, IonButton, IonIcon, useIonToast, useIonAlert,
} from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline, eyeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Order } from '../types';
import { orderService } from '../services/orderService';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PENDING');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const history = useHistory();
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();

  const loadOrders = async () => {
    try {
      const data = await orderService.getAdminOrders(filter);
      setOrders(data);
    } catch {
      present({ message: 'Failed to load orders', duration: 2000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); loadOrders(); }, [filter]);

  const handleApprove = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      await orderService.approveOrder(orderId);
      present({ message: `Order #${orderId} approved ✅`, duration: 2000, color: 'success', position: 'top' });
      loadOrders();
    } catch (e: any) {
      present({ message: e.response?.data?.error || 'Failed to approve order', duration: 3000, color: 'danger' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (orderId: number) => {
    presentAlert({
      header: `Reject Order #${orderId}`,
      message: 'Please provide a reason for rejection.',
      inputs: [{ name: 'reason', type: 'textarea', placeholder: 'e.g. Out of stock, pickup window closed...' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reject',
          cssClass: 'alert-danger',
          handler: async ({ reason }) => {
            if (!reason?.trim()) { present({ message: 'Please provide a rejection reason', duration: 2000, color: 'warning' }); return false; }
            setActionLoading(orderId);
            try {
              await orderService.rejectOrder(orderId, reason);
              present({ message: `Order #${orderId} rejected`, duration: 2000, color: 'warning', position: 'top' });
              loadOrders();
            } finally { setActionLoading(null); }
          },
        },
      ],
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ fontFamily: 'Georgia, serif' }}>👨‍💼 Admin Orders</IonTitle>
        </IonToolbar>
        <IonToolbar style={{ '--background': 'white' }}>
          <IonSegment value={filter} onIonChange={(e) => setFilter(e.detail.value as string)}>
            {['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map(s => (
              <IonSegmentButton key={s} value={s}><IonLabel style={{ fontSize: '0.75rem' }}>{s}</IonLabel></IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
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
            <div style={{ fontSize: '60px' }}>📭</div>
            <h3 style={{ color: 'var(--choco-dark)', fontFamily: 'Georgia, serif' }}>No {filter.toLowerCase()} orders</h3>
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 12px var(--choco-shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', color: 'var(--choco-deep)' }}>Order #{order.id}</p>
                    <p style={{ margin: '2px 0', color: '#666', fontSize: '0.85rem' }}>👤 {order.customer_name || order.customer_email}</p>
                    <p style={{ margin: 0, color: '#999', fontSize: '0.78rem' }}>{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <span style={{ fontWeight: '800', color: 'var(--choco-dark)', fontSize: '1.2rem', fontFamily: 'Georgia, serif' }}>${parseFloat(order.total_price).toFixed(2)}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--choco-light)', paddingTop: '10px', marginBottom: '10px' }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#555', marginBottom: '4px' }}>
                      <span>{item.quantity}× {item.product_name}</span>
                      <span>${(parseFloat(item.price_snapshot) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.notes && <p style={{ margin: '0 0 10px', padding: '8px', background: '#f9f3ed', borderRadius: '8px', fontSize: '0.8rem', color: '#666' }}>📝 {order.notes}</p>}

                {filter === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IonButton expand="block" fill="solid" onClick={() => handleApprove(order.id)} disabled={actionLoading === order.id}
                      style={{ flex: 1, '--background': '#2dd36f', '--border-radius': '10px', '--box-shadow': 'none', height: '42px' }}>
                      {actionLoading === order.id ? <IonSpinner name="crescent" style={{ color: 'white' }} /> : <><IonIcon icon={checkmarkCircleOutline} slot="start" />Approve</>}
                    </IonButton>
                    <IonButton expand="block" fill="solid" onClick={() => handleReject(order.id)} disabled={actionLoading === order.id}
                      style={{ flex: 1, '--background': '#eb445a', '--border-radius': '10px', '--box-shadow': 'none', height: '42px' }}>
                      <IonIcon icon={closeCircleOutline} slot="start" />Reject
                    </IonButton>
                  </div>
                )}
                {filter === 'APPROVED' && (
                  <IonButton expand="block" onClick={async () => { setActionLoading(order.id); await orderService.completeOrder(order.id); setActionLoading(null); loadOrders(); }}
                    style={{ '--background': 'var(--choco-dark)', '--border-radius': '10px', '--box-shadow': 'none', height: '42px' }}>
                    Mark Completed ✓
                  </IonButton>
                )}
              </div>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
