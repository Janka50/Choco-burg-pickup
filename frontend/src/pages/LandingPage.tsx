import React from 'react';
import { useHistory } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const history = useHistory();

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#FDF6EC', color: '#1A0800', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#3D1C02', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ color: '#FDF6EC', fontSize: 22, fontWeight: 700, textDecoration: 'none' }}>
          Choco<span style={{ color: '#C8905A' }}>burg</span>
        </a>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => history.push('/login')}
            style={{ color: '#FDF6EC', background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Login
          </button>
          <button onClick={() => history.push('/register')}
            style={{ background: '#C8905A', color: '#1A0800', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Register
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1A0800 0%, #3D1C02 60%, #6B3A1F 100%)', color: '#FDF6EC', padding: '100px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🍫</div>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
          Premium <span style={{ color: '#C8905A' }}>Chocolate</span><br />& Ice Cream
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(253,246,236,0.8)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Handcrafted chocolates and artisan ice cream made with love.
          Order online and pick up fresh at our shop.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => history.push('/login')}
            style={{ background: '#C8905A', color: '#1A0800', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            🛒 Order Now
          </button>
          <a href="#info"
            style={{ background: 'transparent', color: '#FDF6EC', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 600, border: '2px solid rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            Find Us
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 32px', background: '#FDF6EC', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Why Choose Us?</h2>
        <p style={{ color: '#7A5C45', marginBottom: 48, fontSize: 16 }}>Quality you can taste in every bite</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: '🍫', title: 'Premium Ingredients', desc: 'Only the finest cocoa and dairy sourced from trusted local suppliers.' },
            { icon: '🤝', title: 'Easy Pickup', desc: 'Order online, get approved, then come pick up your treats fresh from our shop.' },
            { icon: '⚡', title: 'Fast Approval', desc: 'Our team reviews every order quickly so you never wait long.' },
            { icon: '❤️', title: 'Made With Love', desc: 'Every piece is handcrafted daily with care and passion for chocolate.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: 'white', borderRadius: 16, padding: '32px 24px', boxShadow: '0 2px 16px rgba(61,28,2,0.08)' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#7A5C45', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BUSINESS INFO */}
      <section id="info" style={{ background: '#3D1C02', color: '#FDF6EC', padding: '80px 32px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Visit Us</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: '📍', label: 'Address', value: 'No. XX, Street Name\nCity, Nigeria' },
            { icon: '📞', label: 'Phone', value: '+234 XXX XXX XXXX' },
            { icon: '✉️', label: 'Email', value: 'info@chocoburg.com' },
            { icon: '🕐', label: 'Opening Hours', value: 'Mon – Sun\n9:00 AM – 9:00 PM' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
              <div>
                <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#C8905A', marginBottom: 6, margin: '0 0 6px' }}>{label}</h4>
                <p style={{ fontSize: 15, color: 'rgba(253,246,236,0.85)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL */}
      <section style={{ background: '#F5E6D3', padding: '60px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Follow Us</h2>
        <p style={{ color: '#7A5C45', marginBottom: 28 }}>Stay updated with our latest flavours and offers</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', background: '#E1306C', color: 'white' }}>📸 Instagram</a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', background: '#1DA1F2', color: 'white' }}>🐦 Twitter / X</a>
          <a href="https://wa.me/234XXXXXXXXXX" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', background: '#25D366', color: 'white' }}>💬 WhatsApp</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1A0800', color: 'rgba(253,246,236,0.6)', textAlign: 'center', padding: '28px 32px', fontSize: 13 }}>
        <p><strong style={{ color: '#C8905A' }}>Chocoburg</strong> — Premium Chocolate & Ice Cream</p>
        <p style={{ marginTop: 6 }}>&copy; 2026 Chocoburg. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
