import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent, IonSpinner, IonBadge,
} from '@ionic/react';
import { productService } from '../services/productService';
import { InventorySummary } from '../types';

const Inventory: React.FC = () => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setSummary(await productService.getInventory()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const statCards = summary ? [
    { label: 'Total Products', value: summary.total_products, color: 'var(--choco-dark)', emoji: '📦' },
    { label: 'Available', value: summary.available_products, color: '#2dd36f', emoji: '✅' },
    { label: 'Out of Stock', value: summary.out_of_stock, color: '#eb445a', emoji: '❌' },
    { label: 'Low Stock', value: summary.low_stock, color: '#ffc409', emoji: '⚠️' },
  ] : [];

  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle style={{ fontFamily: 'Georgia, serif' }}>📊 Inventory</IonTitle></IonToolbar></IonHeader>
      <IonContent style={{ '--background': 'var(--choco-cream)' }}>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <IonSpinner name="crescent" style={{ color: 'var(--choco-dark)', transform: 'scale(1.5)' }} />
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {statCards.map(card => (
                <div key={card.label} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px var(--choco-shadow)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>{card.emoji}</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: card.color, fontFamily: 'Georgia, serif' }}>{card.value}</div>
                  <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '2px' }}>{card.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ color: 'var(--choco-deep)', fontFamily: 'Georgia, serif', marginBottom: '12px' }}>All Products</h3>
            {summary?.items.map(product => (
              <div key={product.id} style={{ background: 'white', borderRadius: '14px', padding: '14px', marginBottom: '10px', boxShadow: '0 2px 8px var(--choco-shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--choco-deep)' }}>{product.name}</p>
                  <p style={{ margin: '2px 0 0', color: 'var(--choco-medium)', fontSize: '0.9rem' }}>${parseFloat(product.price).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: product.stock_quantity === 0 ? '#eb445a' : product.stock_quantity <= 5 ? '#ffc409' : '#2dd36f' }}>
                    {product.stock_quantity} left
                  </span>
                  <IonBadge color={product.is_available ? 'success' : 'medium'} style={{ fontSize: '0.7rem' }}>
                    {product.is_available ? 'Active' : 'Hidden'}
                  </IonBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Inventory;
