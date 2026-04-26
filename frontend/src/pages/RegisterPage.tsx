import React, { useState } from 'react';
import {
  IonContent, IonPage, IonButton, IonInput, IonItem,
  IonLabel, IonText, IonSpinner, IonRouterLink, IonBackButton, IonButtons, IonHeader, IonToolbar, IonTitle,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';
import './AuthPages.css';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', password: '', password_confirm: '',
  });
  const [error, setError] = useState<string | Record<string, string[]>>('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const history = useHistory();

  const update = (field: string, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await register(form);
      history.replace('/shop');
    } catch (err) {
      const axiosErr = err as AxiosError<Record<string, string[]>>;
      const data = axiosErr.response?.data;
      if (data) {
        const first = Object.values(data).flat()[0];
        setError(first || 'Registration failed.');
      } else {
        setError('Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="auth-content">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">🍫</div>
            <h1 className="auth-title">Choco Pickup</h1>
            <p className="auth-subtitle">Create your account</p>
          </div>

          <div className="auth-card">
            {error && (
              <div className="auth-error">
                <IonText color="danger">{typeof error === 'string' ? error : JSON.stringify(error)}</IonText>
              </div>
            )}

            {(['first_name', 'last_name', 'email', 'phone', 'password', 'password_confirm'] as const).map(field => (
              <IonItem key={field} className="auth-input" lines="none">
                <IonLabel position="stacked">
                  {field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </IonLabel>
                <IonInput
                  type={field.includes('password') && field !== 'password_confirm' || field === 'password_confirm' ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  onIonChange={e => update(field, e.detail.value!)}
                  placeholder={field === 'phone' ? 'Optional' : ''}
                />
              </IonItem>
            ))}

            <IonButton
              expand="block"
              className="auth-button"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Create Account'}
            </IonButton>

            <p className="auth-link-text">
              Already have an account?{' '}
              <IonRouterLink routerLink="/login">Sign in</IonRouterLink>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
