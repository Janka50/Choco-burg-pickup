import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/react';
import { logOutOutline, personOutline, mailOutline, callOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle style={{ fontFamily: 'Georgia, serif' }}>👤 Profile</IonTitle></IonToolbar></IonHeader>
      <IonContent style={{ '--background': 'var(--choco-cream)' }}>
        <div style={{ padding: '32px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--choco-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '32px', color: 'white' }}>
              {user?.first_name?.[0]?.toUpperCase() || '👤'}
            </div>
            <h2 style={{ margin: 0, color: 'var(--choco-deep)', fontFamily: 'Georgia, serif' }}>{user?.first_name} {user?.last_name}</h2>
            <span style={{ background: user?.role === 'admin' ? 'var(--choco-dark)' : 'var(--choco-medium)', color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{user?.role}</span>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '8px', boxShadow: '0 2px 12px var(--choco-shadow)', marginBottom: '24px' }}>
            {[
              { icon: mailOutline, label: 'Email', value: user?.email },
              { icon: personOutline, label: 'Name', value: `${user?.first_name} ${user?.last_name}`.trim() || 'Not set' },
              { icon: callOutline, label: 'Phone', value: user?.phone || 'Not set' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--choco-light)' }}>
                <IonIcon icon={row.icon} style={{ color: 'var(--choco-medium)', fontSize: '20px', marginRight: '14px', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>{row.label}</p>
                  <p style={{ margin: 0, color: 'var(--choco-deep)', fontWeight: '500' }}>{row.value}</p>
                </div>
              </div>
            ))}
          </div>

          <IonButton expand="block" fill="outline" onClick={logout}
            style={{ '--color': '#eb445a', '--border-color': '#eb445a', '--border-radius': '12px', '--box-shadow': 'none', height: '50px', fontWeight: '600' }}>
            <IonIcon icon={logOutOutline} slot="start" />
            Sign Out
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
