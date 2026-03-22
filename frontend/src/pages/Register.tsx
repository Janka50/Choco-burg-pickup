import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonSpinner } from '@ionic/react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface FormData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  password_confirm: string;
}

const Register: React.FC = () => {
  const { register } = useAuth();
  const history = useHistory();
  const [form, setForm] = useState<FormData>({ email: '', first_name: '', last_name: '', phone: '', password: '', password_confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | Record<string, string>>('');
  const [success, setSuccess] = useState(false);

  const update = (field: keyof FormData) => (e: any) => setForm(prev => ({ ...prev, [field]: e.detail.value! }));

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => history.push('/login'), 2000);
    } catch (e: any) {
      setError(e.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { '--background': '#f9f3ed', '--padding-start': '14px', '--border-radius': '10px', '--color': 'var(--choco-deep)', fontSize: '1rem', height: '48px', marginBottom: '12px' };
  const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '600' as const, color: 'var(--choco-deep)' };

  const renderErrors = () => {
    if (!error) return null;
    if (typeof error === 'string') return <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#c0392b', fontSize: '0.875rem' }}>{error}</div>;
    return (
      <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
        {Object.entries(error).map(([k, v]) => <p key={k} style={{ margin: '2px 0', color: '#c0392b', fontSize: '0.875rem' }}><strong>{k}:</strong> {Array.isArray(v) ? v.join(', ') : v}</p>)}
      </div>
    );
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--choco-cream)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '50px' }}>🍦</div>
            <h1 style={{ margin: '4px 0 0', color: 'var(--choco-dark)', fontFamily: 'Georgia, serif', fontSize: '1.8rem' }}>Create Account</h1>
          </div>

          <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '24px', padding: '32px 28px', boxShadow: '0 8px 40px var(--choco-shadow)' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px' }}>✅</div>
                <h3 style={{ color: 'var(--choco-dark)' }}>Account created!</h3>
                <p style={{ color: '#666' }}>Redirecting to login...</p>
              </div>
            ) : (
              <>
                {renderErrors()}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                  <div><label style={labelStyle}>First Name</label><IonInput value={form.first_name} onIonInput={update('first_name')} placeholder="John" style={fieldStyle} /></div>
                  <div><label style={labelStyle}>Last Name</label><IonInput value={form.last_name} onIonInput={update('last_name')} placeholder="Doe" style={fieldStyle} /></div>
                </div>
                <label style={labelStyle}>Email</label>
                <IonInput type="email" value={form.email} onIonInput={update('email')} placeholder="john@example.com" style={fieldStyle} />
                <label style={labelStyle}>Phone (optional)</label>
                <IonInput type="tel" value={form.phone} onIonInput={update('phone')} placeholder="+1 234 567 8900" style={fieldStyle} />
                <label style={labelStyle}>Password</label>
                <IonInput type="password" value={form.password} onIonInput={update('password')} placeholder="Minimum 8 characters" style={fieldStyle} />
                <label style={labelStyle}>Confirm Password</label>
                <IonInput type="password" value={form.password_confirm} onIonInput={update('password_confirm')} placeholder="Repeat password" style={{ ...fieldStyle, marginBottom: '24px' }} />
                <IonButton expand="block" onClick={handleRegister} disabled={loading}
                  style={{ '--background': 'var(--choco-dark)', '--border-radius': '12px', '--box-shadow': 'none', height: '50px', fontWeight: '600', marginBottom: '16px' }}>
                  {loading ? <IonSpinner name="crescent" /> : 'Create Account'}
                </IonButton>
                <p style={{ textAlign: 'center', margin: 0, color: '#666', fontSize: '0.875rem' }}>
                  Already have an account? <Link to="/login" style={{ color: 'var(--choco-medium)', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
