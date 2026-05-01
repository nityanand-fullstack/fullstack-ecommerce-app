import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import Categories from "./pages/Categories.jsx";
import ProductList from "./pages/ProductList.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Loader from "./components/Loader.jsx";

import AdminRoute from "./admin/AdminRoute.jsx";
import AdminLayout from "./admin/components/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import Users from "./admin/pages/Users.jsx";
import AdminCategories from "./admin/pages/Categories.jsx";
import Products from "./admin/pages/Products.jsx";
import ProductForm from "./admin/pages/ProductForm.jsx";
import Orders from "./admin/pages/Orders.jsx";

function PublicOnly({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Loader fullscreen label="Loading..." />;
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />;
  }
  return children;
}

function SiteShell({ children }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!isAuthenticated && <Footer />}
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-full">
      <Routes>
        <Route
          path="/"
          element={
            <SiteShell>
              <Home />
            </SiteShell>
          }
        />
        <Route
          path="/categories"
          element={
            <SiteShell>
              <Categories />
            </SiteShell>
          }
        />
        <Route
          path="/products"
          element={
            <SiteShell>
              <ProductList />
            </SiteShell>
          }
        />
        <Route
          path="/products/:id"
          element={
            <SiteShell>
              <ProductDetail />
            </SiteShell>
          }
        />
        <Route
          path="/login"
          element={
            <SiteShell>
              <PublicOnly>
                <Login />
              </PublicOnly>
            </SiteShell>
          }
        />
        <Route
          path="/register"
          element={
            <SiteShell>
              <PublicOnly>
                <Register />
              </PublicOnly>
            </SiteShell>
          }
        />
        <Route
          path="/cart"
          element={
            <SiteShell>
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            </SiteShell>
          }
        />
        <Route
          path="/checkout"
          element={
            <SiteShell>
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            </SiteShell>
          }
        />
        <Route
          path="/orders"
          element={
            <SiteShell>
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            </SiteShell>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <SiteShell>
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            </SiteShell>
          }
        />
        <Route
          path="/orders/:id/success"
          element={
            <SiteShell>
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            </SiteShell>
          }
        />
        <Route
          path="/profile"
          element={
            <SiteShell>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </SiteShell>
          }
        />
        <Route
          path="/change-password"
          element={
            <SiteShell>
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            </SiteShell>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        <Route
          path="*"
          element={
            isAdminArea ? (
              <NotFound />
            ) : (
              <SiteShell>
                <NotFound />
              </SiteShell>
            )
          }
        />
      </Routes>
    </div>
  );
}

function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center px-4">
      <div>
        <p className="text-7xl font-bold text-brand-500">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}
