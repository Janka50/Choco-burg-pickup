import React, { useState } from 'react';
import { IonCard, IonCardContent, IonButton, IonBadge, IonIcon } from '@ionic/react';
import { addOutline, checkmarkOutline } from 'ionicons/icons';
import { Product } from '../types';
import './ProductCard.css';

interface Props {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <IonCard className={`product-card ${!product.in_stock ? 'out-of-stock' : ''}`}>
      <div className="product-image-wrap">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="product-image" />
        ) : (
          <div className="product-image-placeholder">🍫</div>
        )}
        {!product.in_stock && (
          <div className="product-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <IonCardContent className="product-content">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}
        <div className="product-footer">
          <span className="product-price">₦{parseFloat(product.price).toLocaleString()}</span>
          <IonButton
            size="small"
            className={`add-btn ${added ? 'added' : ''}`}
            disabled={!product.in_stock || added}
            onClick={handleAdd}
          >
            <IonIcon icon={added ? checkmarkOutline : addOutline} />
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default ProductCard;
