import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonSpinner,
} from '@ionic/react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';
import { useHistory } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleCheckout = async () => {
    if (!window.confirm(`Place order for ₦${totalPrice.toLocaleString()}?`)) return;
    setLoading(true);
    setError('');
    try {
      const orderItems = items.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
      await orderService.create(orderItems, notes || undefined);
      clearCart();
      history.replace('/orders');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Order failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar><IonTitle>My Cart</IonTitle></IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A5C45' }}>
            <div style={{ fontSize: 64 }}>🛒</div>
            <h2 style={{ fontFamily: 'serif' }}>Your cart is empty</h2>
            <p>Add some chocolates from the shop!</p>
            <IonButton routerLink="/shop">Browse Menu</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Cart ({items.length} items)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
          {error && (
            <div style={{ background: '#FDEDEC', color: '#C0392B', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {items.map(item => (
            <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 14, padding: 14, marginBottom: 12, gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                🍫
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: 15 }}>{item.product.name}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#7A5C45' }}>₦{(parseFloat(item.product.price) * item.quantity).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #6B3A1F', background: 'transparent', color: '#6B3A1F', fontSize: 18, cursor: 'pointer' }}>
                  -
                </button>
                <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock_quantity}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#6B3A1F', color: 'white', fontSize: 18, cursor: 'pointer' }}>
                  +
                </button>
                <button onClick={() => removeItem(item.product.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#C0392B', padding: 4 }}>
                  🗑
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special requests..."
              style={{ width: '100%', borderRadius: 10, border: '2px solid #E8D5BE', padding: '10px 12px', fontFamily: 'inherit', fontSize: 14, marginTop: 6, resize: 'none', outline: 'none' }}
            />
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 20, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, color: '#1A0800', borderTop: '2px solid #E8D5BE', paddingTop: 12 }}>
              <span>Total</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{ width: '100%', background: '#3D1C02', color: '#FDF6EC', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 16 }}>
            {loading ? 'Placing Order...' : `Place Order • ₦${totalPrice.toLocaleString()}`}
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CartPage;
