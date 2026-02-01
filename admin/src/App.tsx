import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import logRocketService from './utils/logrocketService';
import AdminLayout from './layouts/AdminLayout';
import { SettingsProvider } from './contexts/SettingsContext';
import Dashboard from './pages/Dashboard';
import { ProductList, ProductEditor } from './pages/Products';
import { CustomerList, CustomerDetail } from './pages/Customers';
import { CategoryList, CategoryEditor } from './pages/Categories';
import { OrderList, OrderDetail } from './pages/Orders';
import { PaymentList, PaymentDetail } from './pages/Payments';
import { StockList } from './pages/Stock';
import { CouponList, CouponEditor } from './pages/Coupons';
import { BannerList, BannerEditor } from './pages/Banners';
import Settings from './pages/Settings';

// Navigation tracker component
const NavigationTracker = () => {
  const location = useLocation();
  const prevLocationRef = { current: '/' };

  useEffect(() => {
    const from = prevLocationRef.current;
    const to = location.pathname;

    if (from !== to) {
      logRocketService.logNavigation({
        from,
        to,
        page: to,
      });

      prevLocationRef.current = to;
    }
  }, [location]);

  return null;
};

function App() {
  return (
    <SettingsProvider>
      <NavigationTracker />
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          {/* Products Module */}
          <Route path="products">
            <Route index element={<ProductList />} />
            <Route path="new" element={<ProductEditor />} />
            <Route path=":id" element={<ProductEditor />} />
          </Route>

          {/* Orders Module */}
          <Route path="orders">
            <Route index element={<OrderList />} />
            <Route path=":id" element={<OrderDetail />} />
          </Route>

          {/* Categories Module */}
          <Route path="categories">
            <Route index element={<CategoryList />} />
            <Route path="new" element={<CategoryEditor />} />
            <Route path=":id" element={<CategoryEditor />} />
          </Route>

          {/* Customers Module */}
          <Route path="customers">
            <Route index element={<CustomerList />} />
            <Route path=":id" element={<CustomerDetail />} />
          </Route>

          {/* Payments Module */}
          <Route path="payments">
            <Route index element={<PaymentList />} />
            <Route path=":id" element={<PaymentDetail />} />
          </Route>

          {/* Stock Module */}
          <Route path="stock" element={<StockList />} />

          {/* Coupons Module */}
          <Route path="coupons">
            <Route index element={<CouponList />} />
            <Route path="new" element={<CouponEditor />} />
            <Route path=":id" element={<CouponEditor />} />
          </Route>

          {/* Banners Module */}
          <Route path="banners">
            <Route index element={<BannerList />} />
            <Route path="new" element={<BannerEditor />} />
            <Route path=":id" element={<BannerEditor />} />
          </Route>

          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes >
    </SettingsProvider>
  );
}

export default App;
