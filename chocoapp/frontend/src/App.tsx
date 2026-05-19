import React from 'react';
import {
  IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel, IonSpinner, setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';
import {
  storefrontOutline, cartOutline, listOutline, personOutline,
  checkboxOutline, cubeOutline,
} from 'ionicons/icons';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminInventoryPage from './pages/AdminInventoryPage';

setupIonicReact();

const CustomerTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/shop" component={ShopPage} exact />
      <Route path="/cart" component={CartPage} exact />
      <Route path="/orders" component={OrderHistoryPage} exact />
      <Route path="/profile" component={ProfilePage} exact />
      <Redirect from="/customer" to="/shop" />
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="shop" href="/shop">
        <IonIcon icon={storefrontOutline} />
        <IonLabel>Shop</IonLabel>
      </IonTabButton>
      <IonTabButton tab="cart" href="/cart">
        <IonIcon icon={cartOutline} />
        <IonLabel>Cart</IonLabel>
      </IonTabButton>
      <IonTabButton tab="orders" href="/orders">
        <IonIcon icon={listOutline} />
        <IonLabel>Orders</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/profile">
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const AdminTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/admin" component={AdminDashboardPage} exact />
      <Route path="/admin/inventory" component={AdminInventoryPage} exact />
      <Route path="/admin/profile" component={ProfilePage} exact />
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="admin" href="/admin">
        <IonIcon icon={checkboxOutline} />
        <IonLabel>Orders</IonLabel>
      </IonTabButton>
      <IonTabButton tab="inventory" href="/admin/inventory">
        <IonIcon icon={cubeOutline} />
        <IonLabel>Inventory</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/admin/profile">
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const AppRoutes: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: 'linear-gradient(160deg, #2C1200, #5C2E00)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🍫</div>
          <IonSpinner name="crescent" style={{ '--color': '#FFF8F0' } as any} />
        </div>
      </div>
    );
  }

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/login" component={LoginPage} exact />
        <Route path="/register" component={RegisterPage} exact />

        {isAuthenticated && user?.role === 'customer' && (
          <Route path="/" render={() => <CustomerTabs />} />
        )}
        {isAuthenticated && user?.role === 'admin' && (
          <Route path="/" render={() => <AdminTabs />} />
        )}

        <Route exact path="/">
          {isAuthenticated
            ? <Redirect to={user?.role === 'admin' ? '/admin' : '/shop'} />
            : <Redirect to="/login" />}
        </Route>
        <Redirect to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/shop') : '/login'} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  </IonApp>
);

export default App;
