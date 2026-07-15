import React from "react";
import {
  IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel, IonSpinner, setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect, useLocation } from "react-router-dom";
import {
  storefrontOutline, cartOutline, listOutline, personOutline,
  checkboxOutline, cubeOutline, terminalOutline,
} from "ionicons/icons";

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

// ── Splash screen shown while auth is restoring ───────────────────────────────
const SplashScreen: React.FC = () => (
  <div style={{
    display: "flex", justifyContent: "center", alignItems: "center",
    height: "100vh", background: "linear-gradient(160deg, #2C1200, #5C2E00)",
    flexDirection: "column", gap: 20,
  }}>
    <div style={{ fontSize: 72 }}>🍫</div>
    <p style={{ color: "#FDF6EC", fontFamily: "serif", fontSize: 22, margin: 0 }}>
      Chocoburg
    </p>
    <IonSpinner name="crescent" style={{ "--color": "#C8905A" } as any} />
  </div>
);

// ── Customer tabs ─────────────────────────────────────────────────────────────
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

// ── Admin tabs ────────────────────────────────────────────────────────────────
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

// ── Protected route guards ────────────────────────────────────────────────────
const CUSTOMER_PATHS = ["/shop", "/cart", "/orders", "/profile"];
const ADMIN_PATHS = ["/admin", "/admin/inventory", "/admin/profile", "/pos"];

const ProtectedRoute: React.FC<{
  path: string;
  role: "customer" | "admin";
  component: React.ComponentType;
  exact?: boolean;
}> = ({ path, role, component: Component, exact }) => {
  const { isAuthenticated, user, setIntendedPath } = useAuth();
  const location = useLocation();

  return (
    <Route
      path={path}
      exact={exact}
      render={() => {
        if (!isAuthenticated) {
          // Save where they were trying to go
          setIntendedPath(location.pathname);
          return <Redirect to="/login" />;
        }
        if (user?.role !== role) {
          // Wrong role - send to their home
          return (
            <Redirect to={user?.role === "admin" ? "/admin" : "/shop"} />
          );
        }
        return <Component />;
      }}
    />
  );
};

// ── App routes ────────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const { user, isLoading, isAuthenticated, intendedPath, setIntendedPath } =
    useAuth();

  // Block ALL rendering until auth state is resolved
  // This prevents the fallback 404 route from firing prematurely
  if (isLoading) {
    return <SplashScreen />;
  }

  const defaultHome = user?.role === "admin" ? "/admin" : "/shop";

  return (
    <IonRouterOutlet>
      {/* Landing page */}
      <Route path="/" component={LandingPage} exact />

      {/* Auth routes - redirect away if already logged in */}
      <Route
        path="/login"
        exact
        render={() => {
          if (isAuthenticated) {
            const dest = intendedPath || defaultHome;
            setIntendedPath(null);
            return <Redirect to={dest} />;
          }
          return <LoginPage />;
        }}
      />
      <Route
        path="/register"
        exact
        render={() =>
          isAuthenticated ? <Redirect to={defaultHome} /> : <RegisterPage />
        }
      />

      {/* Customer protected routes */}
      {CUSTOMER_PATHS.map((p) => (
        <ProtectedRoute
          key={p}
          path={p}
          exact
          role="customer"
          component={CustomerTabs}
        />
      ))}

      {/* Admin protected routes */}
      {ADMIN_PATHS.map((p) => (
        <ProtectedRoute
          key={p}
          path={p}
          exact={p === "/admin"}
          role="admin"
          component={AdminTabs}
        />
      ))}

      {/* Catch-all - only fires after isLoading=false */}
      <Route
        render={() =>
          isAuthenticated ? (
            <Redirect to={defaultHome} />
          ) : (
            <Redirect to="/login" />
          )
        }
      />
    </IonRouterOutlet>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
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
