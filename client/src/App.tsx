import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

// Shadcn UI Components
import { Toaster } from "sonner";

// Auth Guard & Store
import { useAuthStore } from "./store/useAuth";

// Layouts
import AuthLayout from "./layout/AuthLayout";
import AppLayout from "./layout/AppLayout";
import SettingsLayout from "./layout/SettingLayout";

// Pages
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./features/StaticPage/Home";
import VerifyAccount from "./features/auth/pages/VerifyAccount";
import NotFound from "./features/StaticPage/NotFound";
import Products from "./features/products/pages/Products";
import ManageProduct from "./features/products/pages/Manage";
import Suppliers from "./features/suppliers/pages/Suppliers";
import SupplierView from "./features/suppliers/pages/ViewSupplier";
import ManageSupplier from "./features/suppliers/pages/Manage";
import StockManagement from "./features/MovementTransaction/pages/MovementHub";
import Alert from "./features/alerts/pages/Alert";
import ActivityLogs from "./features/activityLogs/pages/ActivityLogs";
import ReportsHub from "./features/reports/pages/Report";
import Transaction from "./features/reports/pages/TransactionReport";
import StockReport from "./features/reports/pages/StockReport";
import StockMovementReport from "./features/reports/pages/MovementReport";
import UserManagement from "./features/auth/pages/UserManagement";
import Dashboard from "./features/dashboard/pages/Dashboard";
import GeneralSettings from "./features/settings/pages/General";
import CategoryPage from "./features/category/pages/CategoryPage";
import UnitPage from "./features/unit/pages/UnitPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicRoute } from "./features/auth/components/PublicRoute";
import ForgotPassword from "./features/auth/pages/ForgetPassword";
import StockMovementForm from "./features/MovementTransaction/components/MovementTransactionForm";
import ProductMovementHistory from "./features/reports/pages/ProductMovementHistory";
import TransactionViewPage from "./features/reports/pages/TransactionViewPage";
import ProductUnitPage from "./features/ProductUnit/pages/ProductUnitPage";
import ProfilePage from "./features/StaticPage/Profile";
import Unauthorized from "./features/StaticPage/Unauthorized";
import HelpPage from "./features/StaticPage/Helper";

axios.defaults.withCredentials = true;

function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <div className="antialiased selection:bg-blue-100 selection:text-blue-700">
        <Routes>
          {/* --- Public / Auth Routes --- */}
          <Route element={<AuthLayout />}>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/help" element={<HelpPage/>} />
            </Route>
            <Route path="/verify" element={<VerifyAccount />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* --- Protected Inventory/Admin Routes --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/me" element={<ProfilePage />} />
              <Route path="/alerts" element={<Alert />} />

              {/* 1. Admin/Owner Only: User Management */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>

              {/* 2. Admin/Owner/Staff: Products & Suppliers (Internal logic hides buttons) */}
              <Route path="/products">
                <Route index element={<Products />} />
                <Route path="add" element={<ManageProduct />} />
                <Route path="edit/:productId" element={<ManageProduct />} />
              </Route>

              <Route path="/suppliers">
                <Route index element={<Suppliers />} />
                <Route path="v/:id" element={<SupplierView />} />
                <Route path="add" element={<ManageSupplier />} />
                <Route path="edit/:id" element={<ManageSupplier />} />
              </Route>

              {/* 3. Admin/Staff Only: Stock Movements (Owner blocked) */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
                <Route path="/stock-movements">
                  <Route index element={<StockManagement />} />
                  <Route path="form" element={<StockMovementForm />} />
                </Route>
              </Route>

              {/* 4. Admin/Owner Only: Reports */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                <Route path="/reports">
                  <Route index element={<ReportsHub />} />
                  <Route path="activity" element={<ActivityLogs />} />
                  <Route path="transactions" element={<Transaction />} />
                  <Route path="transaction/:id" element={<TransactionViewPage />} />
                  <Route path="stock" element={<StockReport />} />
                  <Route path="stock/product-history/:productId" element={<ProductMovementHistory />} />
                  <Route path="movement" element={<StockMovementReport />} />
                </Route>


              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
              <Route element={<SettingsLayout />}>
                <Route path="/settings">
                  <Route index element={<GeneralSettings />} />
                  <Route path="categories" element={<CategoryPage />} />
                  <Route path="units" element={<UnitPage />} />
                  <Route path="uoms" element={<ProductUnitPage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* --- 404 Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster position="top-right" theme="dark" closeButton richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;