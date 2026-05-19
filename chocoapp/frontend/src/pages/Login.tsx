import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonButton, IonText, IonSpinner,
  IonIcon, IonItem, IonLabel, IonNote,
} from '@ionic/react';
import { eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login, isAdmin } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
      // Redirect based on role handled in App.tsx
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--choco-cream)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          
          {/* Logo / Branding */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '60px', marginBottom: '8px' }}>🍫</div>
            <h1 style={{ margin: 0, color: 'var(--choco-dark)', fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: '700' }}>ChocoScoop</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--choco-medium)', fontSize: '0.9rem' }}>Chocolate & Ice Cream Shop</p>
          </div>

          {/* Card */}
          <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '24px', padding: '32px 28px', boxShadow: '0 8px 40px var(--choco-shadow)' }}>
            <h2 style={{ margin: '0 0 24px', color: 'var(--choco-deep)', fontFamily: 'Georgia, serif' }}>Welcome back</h2>

            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#c0392b', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: 'var(--choco-deep)' }}>Email</label>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                placeholder="you@example.com"
                style={{ '--background': '#f9f3ed', '--padding-start': '14px', '--padding-end': '14px', '--border-radius': '10px', '--color': 'var(--choco-deep)', fontSize: '1rem', height: '48px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: 'var(--choco-deep)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <IonInput
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value!)}
                  placeholder="••••••••"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  style={{ '--background': '#f9f3ed', '--padding-start': '14px', '--padding-end': '48px', '--border-radius': '10px', '--color': 'var(--choco-deep)', fontSize: '1rem', height: '48px' }}
                />
                <IonIcon
                  icon={showPass ? eyeOffOutline : eyeOutline}
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--choco-medium)', fontSize: '20px', zIndex: 10 }}
                />
              </div>
            </div>

            <IonButton expand="block" onClick={handleLogin} disabled={loading}
              style={{ '--background': 'var(--choco-dark)', '--border-radius': '12px', '--box-shadow': 'none', height: '50px', fontWeight: '600', fontSize: '1rem', marginBottom: '16px' }}>
              {loading ? <IonSpinner name="crescent" /> : 'Sign In'}
            </IonButton>

            <p style={{ textAlign: 'center', margin: 0, color: '#666', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--choco-medium)', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
