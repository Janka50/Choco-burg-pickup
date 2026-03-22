import React, { useState } from 'react';
import {
  IonContent, IonPage, IonButton, IonInput, IonItem,
  IonLabel, IonText, IonSpinner, IonRouterLink,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';
import './AuthPages.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const history = useHistory();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
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

  // Redirect after login based on role
  React.useEffect(() => {
    if (user) {
      history.replace(user.role === 'admin' ? '/admin' : '/shop');
    }
  }, [user, history]);

  return (
    <IonPage>
      <IonContent className="auth-content">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">🍫</div>
            <h1 className="auth-title">Choco Pickup</h1>
            <p className="auth-subtitle">Chocolates & Ice Cream</p>
          </div>

          <div className="auth-card">
            <h2>Welcome back</h2>

            {error && (
              <div className="auth-error">
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            <IonItem className="auth-input" lines="none">
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonChange={e => setEmail(e.detail.value!)}
                placeholder="you@example.com"
                autocomplete="email"
              />
            </IonItem>

            <IonItem className="auth-input" lines="none">
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={e => setPassword(e.detail.value!)}
                placeholder="••••••••"
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
              />
            </IonItem>

            <IonButton
              expand="block"
              className="auth-button"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Sign In'}
            </IonButton>

            <p className="auth-link-text">
              Don't have an account?{' '}
              <IonRouterLink routerLink="/register">Create one</IonRouterLink>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
