import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/react';
import { productsAPI } from '../services/api';

interface InventoryItem { id: number; name: string; price: string; stock_quantity: number; is_available: boolean; }

const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try { const res = await productsAPI.inventory(); setItems(res.data.results || res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const refresh = async (e: CustomEvent) => { await fetch(); e.detail.complete(); };

  const getStockColor = (qty: number) => qty === 0 ? '#c0392b' : qty <= 5 ? '#E8A000' : '#2E7D4F';

  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle>📦 Inventory</IonTitle></IonToolbar></IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refresh}><IonRefresherContent /></IonRefresher>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><IonSpinner /></div>
        ) : (
          <div style={{ padding: '12px 16px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ background: '#FDF9F4', border: '1px solid #EDE5D8', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1a0a00', fontSize: 14 }}>{item.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8b6347' }}>${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: getStockColor(item.stock_quantity) }}>{item.stock_quantity}</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#8b6347', textTransform: 'uppercase' }}>in stock</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};
export default AdminInventory;
