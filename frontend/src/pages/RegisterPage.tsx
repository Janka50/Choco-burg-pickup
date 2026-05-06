import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', password: '', password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const history = useHistory();

  const update = (field: string, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.first_name || !form.last_name) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.');
      return;
    }
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
        setError(typeof first === 'string' ? first : 'Registration failed.');
      } else {
        setError('Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof typeof form; label: string; type: string; placeholder?: string }[] = [
    { key: 'first_name', label: 'First Name', type: 'text' },
    { key: 'last_name', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+234 XXX XXX XXXX' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { key: 'password_confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <IonPage>
      <IonContent>
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #2C1200, #5C2E00)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 48 }}>🍫</div>
            <h1 style={{ color: '#FDF6EC', fontFamily: 'serif', fontSize: 26, margin: '8px 0 4px' }}>Chocoburg</h1>
            <p style={{ color: 'rgba(253,246,236,0.7)', fontSize: 14, margin: 0 }}>Create your account</p>
          </div>

          <div style={{ background: '#FDF6EC', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
            {error && (
              <div style={{ background: '#FDEDEC', color: '#C0392B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                {error}
              </div>
            )}

            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#7A5C45', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => update(key, e.target.value)}
                  placeholder={placeholder || ''}
                  style={{ width: '100%', border: '2px solid #E8D5BE', borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{ width: '100%', background: '#3D1C02', color: '#FDF6EC', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#7A5C45' }}>
              Already have an account?{' '}
              <span onClick={() => history.push('/login')} style={{ color: '#6B3A1F', fontWeight: 600, cursor: 'pointer' }}>
                Sign in
              </span>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
