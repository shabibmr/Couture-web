import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import logRocketService from './utils/logrocketService';
import firebaseAnalytics from './utils/firebaseAnalytics';
import { ShopProvider } from './context/ShopContext';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import ProductDetail from './pages/ProductDetail';
import ShopPage from './pages/ShopPage';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CartPage from './pages/CartPage';
import UserProfilePage from './pages/UserProfilePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';

// Navigation tracker component
const NavigationTracker: React.FC = () => {
  const location = useLocation();
  const prevLocationRef = React.useRef<string>('/');

  useEffect(() => {
    const from = prevLocationRef.current;
    const to = location.pathname;

    if (from !== to) {
      logRocketService.logNavigation({
        from,
        to,
        page: to,
      });

      firebaseAnalytics.logPageView(to);

      prevLocationRef.current = to;
    }
  }, [location]);

  return null;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <ShopProvider>
      <div className="relative overflow-hidden bg-beige-bg min-h-screen">
        <AnimatePresence>
          {loading && <SplashScreen onComplete={() => setLoading(false)} />}
        </AnimatePresence>

        {!loading && (
          <BrowserRouter>
            <ScrollToTop />
            <NavigationTracker />
            <WhatsAppButton />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="orders" element={<OrderHistoryPage />} />
                <Route path="orders/:id" element={<OrderTrackingPage />} />
                <Route path="track-order" element={<OrderTrackingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="search" element={<SearchResultsPage />} />
                <Route path="shipping" element={<ShippingReturnsPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
              </Route>

              {/* Standalone Pages (No Navbar/Footer) */}
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
            </Routes>
          </BrowserRouter>
        )}
      </div>
    </ShopProvider>
  );
};

export default App;
