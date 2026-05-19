import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonSpinner, IonTextarea, useIonToast, IonButtons, IonBackButton,
} from '@ionic/react';
import { trashOutline, addOutline, removeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [present] = useIonToast();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
      const order = await orderService.createOrder(orderItems, notes);
      clearCart();
      present({ message: `Order #${order.id} placed! Awaiting approval. 🎉`, duration: 3000, color: 'success', position: 'top' });
      history.push('/orders');
    } catch (e: any) {
      const msg = e.response?.data?.error || e.response?.data?.items || 'Failed to place order. Please try again.';
      present({ message: Array.isArray(msg) ? msg.join(', ') : msg, duration: 3000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/shop" /></IonButtons><IonTitle style={{ fontFamily: 'Georgia, serif' }}>Your Cart</IonTitle></IonToolbar></IonHeader>
        <IonContent style={{ '--background': 'var(--choco-cream)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
            <div style={{ fontSize: '64px' }}>🛒</div>
            <h3 style={{ color: 'var(--choco-dark)', fontFamily: 'Georgia, serif' }}>Your cart is empty</h3>
            <IonButton onClick={() => history.push('/shop')} style={{ '--background': 'var(--choco-dark)', '--border-radius': '12px', marginTop: '16px' }}>Browse Menu</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/shop" /></IonButtons>
          <IonTitle style={{ fontFamily: 'Georgia, serif' }}>Your Cart</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ '--background': 'var(--choco-cream)' }}>
        <div style={{ padding: '16px', paddingBottom: '120px' }}>
          {items.map(item => (
            <div key={item.product.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 12px var(--choco-shadow)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: item.product.image_url ? `url(${item.product.image_url}) center/cover` : 'var(--choco-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                {!item.product.image_url && '🍫'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: '600', color: 'var(--choco-deep)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                <p style={{ margin: '2px 0 0', color: 'var(--choco-medium)', fontWeight: '700' }}>${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid var(--choco-light)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--choco-dark)' }}>
                  <IonIcon icon={removeOutline} style={{ fontSize: '14px' }} />
                </button>
                <span style={{ fontWeight: '700', color: 'var(--choco-deep)', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock_quantity} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid var(--choco-dark)', background: 'var(--choco-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <IonIcon icon={addOutline} style={{ fontSize: '14px' }} />
                </button>
                <button onClick={() => removeFromCart(item.product.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e74c3c', marginLeft: '4px' }}>
                  <IonIcon icon={trashOutline} style={{ fontSize: '14px' }} />
                </button>
              </div>
            </div>
          ))}

          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 12px var(--choco-shadow)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--choco-deep)', fontSize: '0.875rem' }}>Order Notes (optional)</label>
            <IonTextarea value={notes} onIonInput={(e) => setNotes(e.detail.value!)} placeholder="Any special requests or notes..." rows={3} style={{ '--background': '#f9f3ed', '--padding-start': '12px', '--border-radius': '10px' }} />
          </div>
        </div>

        {/* Sticky Bottom Checkout */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px 20px', borderTop: '1px solid var(--choco-light)', boxShadow: '0 -4px 20px var(--choco-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--choco-deep)', fontWeight: '600' }}>Total</span>
            <span style={{ color: 'var(--choco-dark)', fontWeight: '800', fontSize: '1.4rem', fontFamily: 'Georgia, serif' }}>${totalPrice.toFixed(2)}</span>
          </div>
          <IonButton expand="block" onClick={handleCheckout} disabled={loading}
            style={{ '--background': 'var(--choco-dark)', '--border-radius': '14px', '--box-shadow': 'none', height: '52px', fontWeight: '700', fontSize: '1rem' }}>
            {loading ? <IonSpinner name="crescent" /> : `Place Order · $${totalPrice.toFixed(2)}`}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Cart;
