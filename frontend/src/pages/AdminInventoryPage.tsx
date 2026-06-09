import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonSpinner, IonRefresher, IonRefresherContent,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { api } from '../services/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  is_available: boolean;
  image_url?: string;
}

const emptyForm = {
  name: '', description: '', price: '',
  stock_quantity: '', is_available: true,
};

const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const history = useHistory();

  const load = async () => {
    try {
      const { data } = await api.get('/products/admin/');
      setProducts(data.results || data);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setImageFile(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock_quantity: String(p.stock_quantity),
      is_available: p.is_available,
    });
    setImageFile(null);
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock_quantity) {
      setError('Name, price and stock quantity are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('stock_quantity', form.stock_quantity);
      fd.append('is_available', String(form.is_available));
      if (imageFile) fd.append('image', imageFile);

      if (editProduct) {
        await api.patch(`/products/admin/${editProduct.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/products/admin/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Product added successfully!');
      }
      setShowForm(false);
      await load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (p: Product) => {
    try {
      await api.patch(`/products/admin/${p.id}/`, { is_available: !p.is_available });
      await load();
    } catch { setError('Failed to update product.'); }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#3D1C02', '--color': '#FDF6EC' } as any}>
          <IonTitle>📦 Inventory</IonTitle>
          <div slot="end" style={{ paddingRight: 16, display: 'flex', gap: 8 }}>
            <button onClick={() => history.push('/admin')}
              style={{ background: 'transparent', color: '#FDF6EC', border: '1px solid rgba(255,255,255,0.4)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
              ← Admin
            </button>
            <button onClick={openAdd}
              style={{ background: '#C8905A', color: '#1A0800', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              + Add Product
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); (e.target as any).complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>

          {success && (
            <div style={{ background: '#EAF7EC', color: '#2D7A3A', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
              ✅ {success}
            </div>
          )}

          {error && !showForm && (
            <div style={{ background: '#FDEDEC', color: '#C0392B', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* ADD/EDIT FORM */}
          {showForm && (
            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontFamily: 'serif', margin: '0 0 16px', color: '#1A0800' }}>
                {editProduct ? `Edit: ${editProduct.name}` : '➕ Add New Product'}
              </h3>

              {error && (
                <div style={{ background: '#FDEDEC', color: '#C0392B', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Name */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', marginBottom: 4 }}>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Dark Chocolate Bar"
                    style={{ width: '100%', border: '2px solid #E8D5BE', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', marginBottom: 4 }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Product description..."
                    rows={2}
                    style={{ width: '100%', border: '2px solid #E8D5BE', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }} />
                </div>

                {/* Price */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', marginBottom: 4 }}>Price (₦) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0.00" step="0.01"
                    style={{ width: '100%', border: '2px solid #E8D5BE', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Stock */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', marginBottom: 4 }}>Stock Quantity *</label>
                  <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                    placeholder="0"
                    style={{ width: '100%', border: '2px solid #E8D5BE', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Image */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', marginBottom: 4 }}>Product Image</label>
                  <input type="file" accept="image/*"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    style={{ width: '100%', border: '2px solid #E8D5BE', borderRadius: 8, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', background: 'white' }} />
                  {editProduct?.image_url && !imageFile && (
                    <img src={editProduct.image_url} alt="current"
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                  )}
                </div>

                {/* Available toggle */}
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="available" checked={form.is_available}
                    onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  <label htmlFor="available" style={{ fontSize: 14, color: '#1A0800', cursor: 'pointer', fontWeight: 500 }}>
                    Available for purchase
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 1, background: '#3D1C02', color: '#FDF6EC', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : editProduct ? '💾 Update Product' : '✅ Add Product'}
                </button>
                <button onClick={() => { setShowForm(false); setError(''); }}
                  style={{ background: 'transparent', color: '#7A5C45', border: '2px solid #E8D5BE', borderRadius: 10, padding: '12px 20px', fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STATS ROW */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Products', value: products.length, color: '#6B3A1F' },
                { label: 'Low Stock (≤5)', value: products.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0).length, color: '#E67E22' },
                { label: 'Out of Stock', value: products.filter(p => p.stock_quantity === 0).length, color: '#C0392B' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontWeight: 800, fontSize: 28, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#7A5C45', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* PRODUCTS TABLE */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7A5C45' }}>
              <div style={{ fontSize: 48 }}>📦</div>
              <p>No products yet. Add your first product!</p>
              <button onClick={openAdd}
                style={{ background: '#3D1C02', color: '#FDF6EC', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                + Add Product
              </button>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} style={{ background: 'white', borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Image */}
                <div style={{ width: 56, height: 56, borderRadius: 10, background: '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28 }}>🍫</span>}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: 15, color: '#1A0800' }}>{product.name}</p>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#7A5C45' }}>₦{parseFloat(product.price).toLocaleString()}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: product.stock_quantity === 0 ? '#FDEDEC' : product.stock_quantity <= 5 ? '#FEF9E7' : '#EAF7EC',
                      color: product.stock_quantity === 0 ? '#C0392B' : product.stock_quantity <= 5 ? '#E67E22' : '#2D7A3A',
                    }}>
                      {product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} in stock`}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: product.is_available ? '#EAF7EC' : '#F5F5F5',
                      color: product.is_available ? '#2D7A3A' : '#666',
                    }}>
                      {product.is_available ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openEdit(product)}
                    style={{ background: '#3D1C02', color: '#FDF6EC', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => toggleAvailable(product)}
                    style={{ background: product.is_available ? '#F5F5F5' : '#EAF7EC', color: product.is_available ? '#666' : '#2D7A3A', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {product.is_available ? '🙈 Hide' : '👁️ Show'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminInventoryPage;
