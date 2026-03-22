import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonRefresher, IonRefresherContent, IonSpinner, IonBadge, IonIcon,
  IonFab, IonFabButton, useIonToast,
} from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { totalItems, addToCart } = useCart();
  const history = useHistory();
  const [present] = useIonToast();

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
      setFiltered(data);
    } catch {
      present({ message: 'Failed to load products', duration: 2000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)));
  }, [search, products]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    present({ message: `${product.name} added to cart 🛒`, duration: 1500, color: 'success', position: 'top' });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ fontFamily: 'Georgia, serif' }}>🍫 Our Menu</IonTitle>
        </IonToolbar>
        <IonToolbar style={{ '--background': 'white', '--border-color': '#e8d5c4' }}>
          <IonSearchbar value={search} onIonInput={(e) => setSearch(e.detail.value!)} placeholder="Search chocolates & ice cream..." style={{ '--background': '#f9f3ed', '--color': 'var(--choco-deep)' }} />
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ '--background': 'var(--choco-cream)' }}>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await loadProducts(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <IonSpinner name="crescent" style={{ color: 'var(--choco-dark)', transform: 'scale(1.5)' }} />
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <div style={{ fontSize: '48px' }}>🔍</div>
                <p>No products found</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </div>
        )}

        {totalItems > 0 && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => history.push('/cart')} style={{ '--background': 'var(--choco-dark)' }}>
              <IonIcon icon={cartOutline} />
              <IonBadge style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--choco-medium)', color: 'white', borderRadius: '50%', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' }}>
                {totalItems}
              </IonBadge>
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Shop;
