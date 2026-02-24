import { useEffect } from "react"; // Added
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
import Home from "./features/Home";
import VerifyAccount from "./features/auth/pages/VerifyAccount";
import NotFound from "./features/NotFound";
import Products from "./features/products/pages/Products";
import ManageProduct from "./features/products/pages/Manage";
import Suppliers from "./features/suppliers/pages/Suppliers";
import SupplierView from "./features/suppliers/pages/ViewSupplier";
import ManageSupplier from "./features/suppliers/pages/Manage";
import StockManagement from "./features/MovementTransaction/pages/movements/MovementHub";
import Alert from "./features/alerts/pages/Alert";
import ActivityLogs from "./features/activityLogs/pages/ActivityLogs";
import ReportsHub from "./features/reports/pages/Report";
import Transaction from "./features/MovementTransaction/pages/transaction/TransactionReport";
import StockReport from "./features/MovementTransaction/pages/movements/StockReport";
import StockMovementReport from "./features/MovementTransaction/pages/movements/MovementReport";
import UserManagement from "./features/auth/pages/User";
import Dashboard from "./features/dashboard/pages/Dashboard";
import GeneralSettings from "./features/settings/pages/General";
import CategoryPage from "./features/category/pages/CategoryPage";
import UnitPage from "./features/unit/pages/UnitPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicRoute } from "./features/auth/components/PublicRoute";
import ForgotPassword from "./features/auth/pages/ForgetPassword";
import StockMovementForm from "./features/MovementTransaction/components/MovementTransactionForm";
import ProductMovementHistory from "./features/MovementTransaction/pages/movements/ProductMovementHistory";
import TransactionViewPage from "./features/MovementTransaction/pages/transaction/TransactionViewPage";
import ProductUnitPage from "./features/ProductUnit/pages/ProductUnitPage";

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
            <Route element={<PublicRoute />} >
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route path="/verify" element={<VerifyAccount />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
          </Route>


          {/* --- Protected Inventory/Admin Routes --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Only Admin/Owner can manage users */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>

              {/* Product Management */}
              <Route path="/products">
                <Route index element={<Products />} />
                <Route path="add" element={<ManageProduct />} />
                <Route path="edit/:productId" element={<ManageProduct />} />
              </Route>

              {/* Supplier Management */}
              <Route path="/suppliers">
                <Route index element={<Suppliers />} />
                <Route path="v/:id" element={<SupplierView />} />
                <Route path="add" element={<ManageSupplier />} />
                <Route path="edit/:id" element={<ManageSupplier />} />
              </Route>

              {/* Stock Management */}
              <Route path="/stock-movements">
                <Route index element={<StockManagement />} />
                <Route path="form" element={<StockMovementForm />} />
              </Route>

              {/* Alerts */}
              <Route path="/alerts" element={<Alert />} />

              {/* Reports */}
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

            {/* Nested Settings with Layout */}
            <Route element={<SettingsLayout />}>
              <Route path="/settings">
                <Route index element={<GeneralSettings />} />
                <Route path="categories" element={<CategoryPage />} />
                <Route path="units" element={<UnitPage />} />
                <Route path="uoms" element={<ProductUnitPage />} />
              </Route>
            </Route>
          </Route>

          {/* --- 404 Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster position="top-right" richColors closeButton />
      </div>
    </BrowserRouter>
  );
}

export default App;