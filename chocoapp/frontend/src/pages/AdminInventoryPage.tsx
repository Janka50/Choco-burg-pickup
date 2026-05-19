import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonSpinner, IonText, IonRefresher, IonRefresherContent,
} from '@ionic/react';
import { productService } from '../services/api';
import { Product } from '../types';
import './AdminInventoryPage.css';

const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await productService.inventory();
      setProducts(data.results || data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const getStockClass = (qty: number) => {
    if (qty === 0) return 'stock-empty';
    if (qty <= 5) return 'stock-low';
    return 'stock-ok';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>📦 Inventory</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await fetch(); (e.target as any).complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && <div className="inv-loading"><IonSpinner name="crescent" color="primary" /></div>}

        <div className="inv-list">
          {products.map(p => (
            <div key={p.id} className="inv-item">
              <div className="inv-item-info">
                <span className="inv-item-name">{p.name}</span>
                <span className="inv-item-price">₦{parseFloat(p.price).toLocaleString()}</span>
              </div>
              <div className={`inv-stock ${getStockClass(p.stock_quantity)}`}>
                <span className="inv-qty">{p.stock_quantity}</span>
                <span className="inv-label">
                  {p.stock_quantity === 0 ? 'OUT' : p.stock_quantity <= 5 ? 'LOW' : 'IN STOCK'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminInventoryPage;
