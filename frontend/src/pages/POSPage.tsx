import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { api } from '../services/api';

interface Product { id: number; name: string; price: string; stock_quantity: number; }
interface CartItem { product: Product; quantity: number; }

const POSPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [error, setError] = useState('');
  const history = useHistory();

  useEffect(() => {
    Promise.all([
      api.get('/products/'),
      api.get('/pos/session/current/'),
    ]).then(([prodRes, sessionRes]) => {
      setProducts(prodRes.data.results || prodRes.data);
      setSession(sessionRes.data.session || sessionRes.data);
    }).catch((e) => { console.error(e); setError('Failed to load POS data. Check console.'); })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock_quantity === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== id));
    else setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const total = cart.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0);
  const change = parseFloat(amountPaid || '0') - total;

  const openSession = async () => {
    try {
      const { data } = await api.post('/pos/session/open/', { opening_float: 0 });
      setSession(data);
    } catch { setError('Failed to open session.'); }
  };

  const processSale = async () => {
    if (cart.length === 0) { setError('Add items to cart.'); return; }
    if (total <= 0) { setError('Cart is empty.'); return; }
    if (paymentMethod === 'CASH' && (!amountPaid || parseFloat(amountPaid) < total)) {
      setError('Amount paid must be at least ₦' + total.toLocaleString());
      return;
    }
    let activeSession = session;
    if (!activeSession || activeSession.is_active === false) {
      try {
        const { data } = await api.post('/pos/session/open/', { opening_float: 0 });
        activeSession = data;
        setSession(data);
      } catch {
        setError('Failed to open session. Try again.');
        return;
      }
    }
    setProcessing(true);
    setError('');
    try {
      const paid = paymentMethod === 'CASH' ? parseFloat(amountPaid) : total;
      const { data } = await api.post('/pos/sales/create/', {
        items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        payment_method: paymentMethod,
        amount_paid: paid,
      });
      setLastReceipt(data);
      setCart([]);
      setAmountPaid('');
      // Refresh products to update stock
      const prodRes = await api.get('/products/');
      setProducts(prodRes.data.results || prodRes.data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Sale failed.');
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = () => {
    if (!lastReceipt) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body{font-family:monospace;max-width:300px;margin:0 auto;padding:16px}
        h2{text-align:center}
        .line{display:flex;justify-content:space-between}
        .total{font-weight:bold;font-size:18px;border-top:1px dashed #000;margin-top:8px;padding-top:8px}
        .center{text-align:center}
      </style></head><body>
      <h2>🍫 Chocoburg</h2>
      <p class="center">Receipt #${lastReceipt.receipt_number}</p>
      <p class="center">${new Date(lastReceipt.created_at).toLocaleString()}</p>
      <hr/>
      ${lastReceipt.items.map((i: any) => `
        <div class="line"><span>${i.product_name} x${i.quantity}</span><span>₦${parseFloat(i.subtotal).toLocaleString()}</span></div>
      `).join('')}
      <div class="line total"><span>TOTAL</span><span>₦${parseFloat(lastReceipt.total_amount).toLocaleString()}</span></div>
      <div class="line"><span>PAID (${lastReceipt.payment_method})</span><span>₦${parseFloat(lastReceipt.amount_paid).toLocaleString()}</span></div>
      <div class="line"><span>CHANGE</span><span>₦${parseFloat(lastReceipt.change_given).toLocaleString()}</span></div>
      <hr/>
      <p class="center">Thank you! Come again 🍫</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  if (loading) return (
    <IonPage><IonContent>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <IonSpinner name="crescent" />
      </div>
    </IonContent></IonPage>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#3D1C02', '--color': '#FDF6EC' } as any}>
          <IonTitle>🍫 Chocoburg POS</IonTitle>
          <div slot="end" style={{ paddingRight: 16 }}>
            <button onClick={() => history.push('/admin')}
              style={{ background: 'transparent', color: '#FDF6EC', border: '1px solid rgba(255,255,255,0.4)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              ← Admin
            </button>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

          {/* LEFT — Products */}
          <div style={{ padding: 16, overflowY: 'auto', background: '#FDF6EC' }}>
            {!session?.is_active && (
              <div style={{ background: '#FEF9E7', border: '2px solid #E67E22', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px', color: '#E67E22', fontWeight: 600 }}>⚠️ No active session</p>
                <button onClick={openSession}
                  style={{ background: '#E67E22', color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>
                  Open Session
                </button>
              </div>
            )}

            <h3 style={{ fontFamily: 'serif', margin: '0 0 16px', color: '#1A0800' }}>Products</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {products.map(product => (
                <button key={product.id} onClick={() => addToCart(product)}
                  disabled={product.stock_quantity === 0}
                  style={{
                    background: product.stock_quantity === 0 ? '#F5F5F5' : 'white',
                    border: '2px solid #E8D5BE', borderRadius: 12, padding: 14,
                    cursor: product.stock_quantity === 0 ? 'not-allowed' : 'pointer',
                    textAlign: 'left', opacity: product.stock_quantity === 0 ? 0.6 : 1,
                    transition: 'transform 0.1s',
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🍫</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1A0800', marginBottom: 4 }}>{product.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#6B3A1F' }}>₦{parseFloat(product.price).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: product.stock_quantity <= 5 ? '#C0392B' : '#7A5C45', marginTop: 4 }}>
                    {product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} left`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Cart & Checkout */}
          <div style={{ background: '#3D1C02', color: '#FDF6EC', display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Cart items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <h3 style={{ margin: '0 0 14px', fontFamily: 'serif' }}>
                Cart {cart.length > 0 && `(${cart.reduce((s, i) => s + i.quantity, 0)} items)`}
              </h3>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(253,246,236,0.5)' }}>
                  <div style={{ fontSize: 40 }}>🛒</div>
                  <p>Tap products to add</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{item.product.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#C8905A' }}>₦{parseFloat(item.product.price).toLocaleString()} each</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontSize: 16 }}>-</button>
                      <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, item.quantity + 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#C8905A', color: 'white', cursor: 'pointer', fontSize: 16 }}>+</button>
                    </div>
                    <span style={{ fontWeight: 700, minWidth: 70, textAlign: 'right' }}>
                      ₦{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Checkout panel */}
            <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {error && (
                <div style={{ background: '#FDEDEC', color: '#C0392B', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 800, marginBottom: 14 }}>
                <span>TOTAL</span>
                <span style={{ color: '#C8905A' }}>₦{total.toLocaleString()}</span>
              </div>

              {/* Payment method */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {['CASH', 'CARD', 'TRANSFER'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: paymentMethod === m ? '#C8905A' : 'rgba(255,255,255,0.15)', color: paymentMethod === m ? '#1A0800' : '#FDF6EC' }}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Amount paid */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'rgba(253,246,236,0.7)', display: 'block', marginBottom: 4 }}>Amount Received (₦)</label>
                <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 18, fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              {/* Change */}
              {parseFloat(amountPaid) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 16 }}>
                  <span style={{ color: 'rgba(253,246,236,0.7)' }}>Change</span>
                  <span style={{ fontWeight: 700, color: change >= 0 ? '#2ECC71' : '#E74C3C' }}>
                    ₦{Math.max(0, change).toLocaleString()}
                  </span>
                </div>
              )}

              <button onClick={processSale} disabled={processing || cart.length === 0}
                style={{ width: '100%', padding: '14px', background: '#C8905A', color: '#1A0800', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 8, opacity: processing || cart.length === 0 ? 0.6 : 1 }}>
                {processing ? 'Processing...' : '✅ Complete Sale'}
              </button>

              {lastReceipt && (
                <button onClick={printReceipt}
                  style={{ width: '100%', padding: '10px', background: 'transparent', color: '#FDF6EC', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>
                  🖨️ Print Last Receipt #{lastReceipt.receipt_number}
                </button>
              )}

              {cart.length > 0 && (
                <button onClick={() => setCart([])}
                  style={{ width: '100%', padding: '8px', background: 'transparent', color: 'rgba(253,246,236,0.5)', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 4 }}>
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Last Receipt Preview */}
        {lastReceipt && (
          <div style={{ position: 'fixed', top: 70, right: 400, background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', minWidth: 260, zIndex: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <strong style={{ color: '#1A0800' }}>✅ Sale Complete!</strong>
              <button onClick={() => setLastReceipt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#7A5C45' }}>Receipt #{lastReceipt.receipt_number}</p>
            <p style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#3D1C02' }}>₦{parseFloat(lastReceipt.total_amount).toLocaleString()}</p>
            <button onClick={printReceipt}
              style={{ width: '100%', background: '#3D1C02', color: 'white', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 600 }}>
              🖨️ Print Receipt
            </button>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default POSPage;
