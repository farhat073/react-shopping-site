import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { useServiceWorker } from './hooks/useServiceWorker';

const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));

const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout.tsx'));

function App() {
  useServiceWorker();

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Helmet>
          <title>Wear Inn</title>
          <meta name="description" content="Quality products at great prices" />
        </Helmet>
        <AuthProvider>
          <BrowserRouter>
            <CartProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="product/:slug" element={
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                    <ProductDetail />
                  </Suspense>
                } />
                <Route path="cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="checkout" element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                      <Checkout />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="payment-success" element={
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                    <PaymentSuccess />
                  </Suspense>
                } />
                <Route path="orders" element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                      <OrderHistory />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="admin/orders" element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                      <AdminOrders />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="about" element={<About />} />
              </Route>
              <Route path="/login" element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } />
              <Route path="/signup" element={
                <ProtectedRoute requireAuth={false}>
                  <Signup />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
            </CartProvider>
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
