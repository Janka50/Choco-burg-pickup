import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonSearchbar, IonGrid, IonRow, IonCol, IonSpinner, IonText,
  IonRefresher, IonRefresherContent, IonBadge,
} from '@ionic/react';
import { Product } from '../types';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import CartFab from '../components/CartFab';
import './ShopPage.css';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { addItem } = useCart();

  const fetchProducts = async (q?: string) => {
    try {
      setError('');
      const { data } = await productService.list(q);
      setProducts(data.results || data);
    } catch {
      setError('Failed to load products. Pull to refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchProducts(search || undefined), 400);
    return () => clearTimeout(delay);
  }, [search]);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchProducts(search || undefined);
    (event.target as HTMLIonRefresherElement).complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>🍫 Our Menu</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={search}
            onIonChange={e => setSearch(e.detail.value!)}
            placeholder="Search chocolates & ice cream..."
            className="shop-search"
          />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && (
          <div className="shop-loading">
            <IonSpinner name="crescent" color="primary" />
          </div>
        )}

        {error && (
          <div className="shop-error">
            <IonText color="danger">{error}</IonText>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="shop-empty">
            <p>🍫 No products available right now.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <IonGrid className="product-grid">
            <IonRow>
              {products.map(product => (
                <IonCol key={product.id} size="6" sizeMd="4">
                  <ProductCard
                    product={product}
                    onAddToCart={() => addItem(product)}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </IonContent>

      <CartFab />
    </IonPage>
  );
};

export default ShopPage;
