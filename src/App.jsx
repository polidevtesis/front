import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductListPage from './pages/Products/ProductListPage';
import ProductFormPage from './pages/Products/ProductFormPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import ProviderListPage from './pages/Providers/ProviderListPage';
import ProviderFormPage from './pages/Providers/ProviderFormPage';
import CategoryListPage from './pages/Categories/CategoryListPage';
import SaleListPage from './pages/Sales/SaleListPage';
import SaleFormPage from './pages/Sales/SaleFormPage';
import SaleDetailPage from './pages/Sales/SaleDetailPage';
import MovementListPage from './pages/Movements/MovementListPage';
import MovementFormPage from './pages/Movements/MovementFormPage';
import AiOrderPage from './pages/AiOrder/AiOrderPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />

        <Route path="providers" element={<ProviderListPage />} />
        <Route path="providers/new" element={<ProviderFormPage />} />
        <Route path="providers/:id" element={<ProviderFormPage />} />

        <Route path="categories" element={<CategoryListPage />} />

        <Route path="sales" element={<SaleListPage />} />
        <Route path="sales/new" element={<SaleFormPage />} />
        <Route path="sales/:id" element={<SaleDetailPage />} />

        <Route path="movements" element={<MovementListPage />} />
        <Route path="movements/new" element={<MovementFormPage />} />

        <Route path="ai/order" element={<AiOrderPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
