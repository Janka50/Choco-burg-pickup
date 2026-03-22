import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonList, IonItem, IonLabel, IonButton, IonIcon, IonText,
  IonSpinner, IonAlert, IonThumbnail, IonInput,
} from '@ionic/react';
import { trashOutline, addOutline, removeOutline } from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';
import { useHistory } from 'react-router-dom';
import './CartPage.css';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const orderItems = items.map(i => ({ product_id: i.product.id, quantity: i.quantity }));
      await orderService.create(orderItems, notes);
      clearCart();
      history.replace('/orders');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.items?.[0] || 'Order failed. Try again.';
      setError(msg);
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
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some chocolates from the shop!</p>
            <IonButton routerLink="/shop" className="cart-shop-btn">
              Browse Menu
            </IonButton>
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
        {error && (
          <div className="cart-error">
            <IonText color="danger">{error}</IonText>
          </div>
        )}

        <IonList className="cart-list">
          {items.map(item => (
            <div key={item.product.id} className="cart-item">
              <div className="cart-item-image">
                {item.product.image_url
                  ? <img src={item.product.image_url} alt={item.product.name} />
                  : <span>🍫</span>}
              </div>
              <div className="cart-item-info">
                <p className="cart-item-name">{item.product.name}</p>
                <p className="cart-item-price">
                  ₦{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                </p>
                <p className="cart-item-unit">₦{parseFloat(item.product.price).toLocaleString()} each</p>
              </div>
              <div className="cart-item-controls">
                <IonButton
                  fill="clear" size="small"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  <IonIcon icon={removeOutline} />
                </IonButton>
                <span className="cart-qty">{item.quantity}</span>
                <IonButton
                  fill="clear" size="small"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock_quantity}
                >
                  <IonIcon icon={addOutline} />
                </IonButton>
                <IonButton
                  fill="clear" size="small" color="danger"
                  onClick={() => removeItem(item.product.id)}
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </div>
            </div>
          ))}
        </IonList>

        <div className="cart-notes">
          <label>Order Notes (optional)</label>
          <IonItem lines="none" className="notes-input">
            <IonInput
              value={notes}
              onIonChange={e => setNotes(e.detail.value!)}
              placeholder="Any special requests..."
              multiple={true}
            />
          </IonItem>
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            <span>Total</span>
            <span className="cart-total-price">₦{totalPrice.toLocaleString()}</span>
          </div>
          <p className="cart-note">⏳ Orders are reviewed & approved by our team</p>
          <IonButton
            expand="block"
            className="checkout-btn"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
          >
            {loading ? <IonSpinner name="crescent" /> : 'Place Order'}
          </IonButton>
        </div>
      </IonContent>

      <IonAlert
        isOpen={showConfirm}
        onDidDismiss={() => setShowConfirm(false)}
        header="Confirm Order"
        message={`Place order for ₦${totalPrice.toLocaleString()}? You'll be notified once it's approved.`}
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Place Order', handler: handleCheckout },
        ]}
      />
    </IonPage>
  );
};

export default CartPage;
