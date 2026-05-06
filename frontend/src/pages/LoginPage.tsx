import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const history = useHistory();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setError(axiosErr.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) history.replace(user.role === 'admin' ? '/admin' : '/shop');
  }, [user, history]);

  return (
    <IonPage>
      <IonContent>
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #2C1200, #5C2E00)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 56 }}>🍫</div>
            <h1 style={{ color: '#FDF6EC', fontFamily: 'serif', fontSize: 28, margin: '8px 0 4px' }}>Chocoburg</h1>
            <p style={{ color: 'rgba(253,246,236,0.7)', fontSize: 14, margin: 0 }}>Chocolates & Ice Cream</p>
          </div>

          <div style={{ background: '#FDF6EC', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontFamily: 'serif', color: '#1A0800', margin: '0 0 20px', fontSize: 22 }}>Welcome back</h2>

            {error && (
              <div style={{ background: '#FDEDEC', color: '#C0392B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', border: '2px solid #E8D5BE', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', border: '2px solid #E8D5BE', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ width: '100%', background: '#3D1C02', color: '#FDF6EC', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#7A5C45' }}>
              Don't have an account?{' '}
              <span onClick={() => history.push('/register')} style={{ color: '#6B3A1F', fontWeight: 600, cursor: 'pointer' }}>
                Create one
              </span>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
