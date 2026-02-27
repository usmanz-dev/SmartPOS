import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Products from './pages/inventory/Products';
import AddProduct from './pages/inventory/AddProduct';
import Categories from './pages/inventory/Categories';
import LowStock from './pages/inventory/LowStock';
import Adjustment from './pages/inventory/Adjustment';
import POS from './pages/cashier/POS';
import Orders from './pages/cashier/Orders';
import TodaySales from './pages/cashier/TodaySales';

function Protected({ children, roles }) {
  const { isLoggedIn, hasRole } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { isLoggedIn } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Protected><DashboardLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<Protected roles={['super_admin','store_admin','inventory_manager']}><AddProduct /></Protected>} />
        <Route path="products/edit/:id" element={<Protected roles={['super_admin','store_admin','inventory_manager']}><AddProduct /></Protected>} />
        <Route path="categories" element={<Categories />} />
        <Route path="inventory/low-stock" element={<LowStock />} />
        <Route path="inventory/adjustment" element={<Protected roles={['inventory_manager']}><Adjustment /></Protected>} />
        <Route path="orders" element={<Orders />} />
        <Route path="today-sales" element={<TodaySales />} />
        <Route path="reports" element={<Protected roles={['super_admin','store_admin']}><Reports /></Protected>} />
        <Route path="users" element={<Protected roles={['super_admin','store_admin']}><Users /></Protected>} />
        <Route path="settings" element={<Protected roles={['super_admin']}><Settings /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
