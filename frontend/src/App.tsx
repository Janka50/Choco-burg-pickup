import React from 'react';
import {
  IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel, IonSpinner, setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';
import {
  storefrontOutline, cartOutline, listOutline, personOutline,
  checkboxOutline, cubeOutline, terminalOutline,
} from 'ionicons/icons';

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "./theme/variables.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import POSPage from "./pages/POSPage";

setupIonicReact();

// ── Customer tab layout ──────────────────────────────────────────────────────
const CustomerTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/shop" component={ShopPage} exact />
      <Route path="/cart" component={CartPage} exact />
      <Route path="/orders" component={OrderHistoryPage} exact />
      <Route path="/profile" component={ProfilePage} exact />
      <Redirect exact from="/customer" to="/shop" />
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

// ── Admin tab layout ─────────────────────────────────────────────────────────
const AdminTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/admin" component={AdminDashboardPage} exact />
      <Route path="/admin/inventory" component={AdminInventoryPage} exact />
      <Route path="/admin/profile" component={ProfilePage} exact />
      <Route path="/pos" component={POSPage} exact />
      <Redirect exact from="/admin/home" to="/admin" />
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
      <IonTabButton tab="pos" href="/pos">
        <IonIcon icon={terminalOutline} />
        <IonLabel>POS</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/admin/profile">
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

// ── Route guard components ───────────────────────────────────────────────────
const CustomerRoute: React.FC<{ path: string; exact?: boolean }> = ({ path, exact }) => {
  const { isAuthenticated, user } = useAuth();
  return (
    <Route path={path} exact={exact} render={() =>
      isAuthenticated && user?.role === "customer"
        ? <CustomerTabs />
        : <Redirect to="/login" />
    } />
  );
};

const AdminRoute: React.FC<{ path: string; exact?: boolean }> = ({ path, exact }) => {
  const { isAuthenticated, user } = useAuth();
  return (
    <Route path={path} exact={exact} render={() =>
      isAuthenticated && user?.role === "admin"
        ? <AdminTabs />
        : <Redirect to="/login" />
    } />
  );
};

// ── Main routes ──────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", background: "linear-gradient(160deg, #2C1200, #5C2E00)",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontSize: 64 }}>🍫</div>
        <IonSpinner name="crescent" style={{ "--color": "#FFF8F0" } as any} />
      </div>
    );
  }

  return (
    <IonRouterOutlet>
      {/* Public routes */}
      <Route path="/" component={LandingPage} exact />
      <Route path="/login" render={() =>
        isAuthenticated
          ? <Redirect to={user?.role === "admin" ? "/admin" : "/shop"} />
          : <LoginPage />
      } exact />
      <Route path="/register" render={() =>
        isAuthenticated
          ? <Redirect to={user?.role === "admin" ? "/admin" : "/shop"} />
          : <RegisterPage />
      } exact />

      {/* Customer routes */}
      <CustomerRoute path="/shop" exact />
      <CustomerRoute path="/cart" exact />
      <CustomerRoute path="/orders" exact />
      <CustomerRoute path="/profile" exact />

      {/* Admin routes - all handled by AdminTabs */}
      <AdminRoute path="/admin" exact />
      <AdminRoute path="/admin/inventory" exact />
      <AdminRoute path="/admin/profile" exact />
      <AdminRoute path="/pos" exact />

      {/* Fallback */}
      <Route render={() =>
        isAuthenticated
          ? <Redirect to={user?.role === "admin" ? "/admin" : "/shop"} />
          : <Redirect to="/" />
      } />
    </IonRouterOutlet>
  );
};

// ── App root ─────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <CartProvider>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </CartProvider>
    </AuthProvider>
  </IonApp>
);

export default App;
