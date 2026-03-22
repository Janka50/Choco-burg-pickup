import React from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonIcon, IonItem, IonLabel,
} from '@ionic/react';
import { logOutOutline, personOutline, callOutline, mailOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>My Profile</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.first_name?.[0]?.toUpperCase() || '?'}
          </div>
          <h2 className="profile-name">{user?.first_name} {user?.last_name}</h2>
          <span className="profile-role">{user?.role}</span>
        </div>

        <div className="profile-info">
          <div className="profile-item">
            <IonIcon icon={mailOutline} />
            <div>
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
          </div>
          {user?.phone && (
            <div className="profile-item">
              <IonIcon icon={callOutline} />
              <div>
                <label>Phone</label>
                <p>{user?.phone}</p>
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <IonButton expand="block" fill="outline" color="danger" onClick={logout} className="logout-btn">
            <IonIcon icon={logOutOutline} slot="start" />
            Sign Out
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
