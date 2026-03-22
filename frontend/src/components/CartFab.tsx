import React from 'react';
import { IonFab, IonFabButton, IonIcon, IonBadge } from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import { useHistory } from 'react-router-dom';
import './CartFab.css';

const CartFab: React.FC = () => {
  const { totalItems } = useCart();
  const history = useHistory();

  if (totalItems === 0) return null;

  return (
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
      <div className="cart-fab-wrapper" onClick={() => history.push('/cart')}>
        <IonFabButton className="cart-fab-btn">
          <IonIcon icon={cartOutline} />
        </IonFabButton>
        <IonBadge className="cart-badge">{totalItems}</IonBadge>
      </div>
    </IonFab>
  );
};

export default CartFab;
