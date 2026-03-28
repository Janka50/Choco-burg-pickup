import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>My Profile</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#3D1C02', color: '#FDF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, margin: '0 auto 12px' }}>
              {user?.first_name?.[0]?.toUpperCase() || '?'}
            </div>
            <h2 style={{ fontFamily: 'serif', margin: '0 0 4px' }}>{user?.first_name} {user?.last_name}</h2>
            <span style={{ background: '#F5E6D3', color: '#6B3A1F', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
              {user?.role}
            </span>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            {[
              { label: 'Email', value: user?.email, icon: '✉️' },
              { label: 'Phone', value: user?.phone || 'Not provided', icon: '📞' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #E8D5BE' }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: '#7A5C45', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 15 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={logout}
            style={{ width: '100%', background: 'transparent', color: '#C0392B', border: '2px solid #C0392B', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            🚪 Sign Out
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
