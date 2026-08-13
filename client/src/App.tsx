import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

// Shadcn UI Components
import { Toaster } from "sonner";

// Auth Guard & Store
import { useAuthStore } from "./store/authStore";

// Layouts
import AuthLayout from "./layout/AuthLayout";
import AppLayout from "./layout/AppLayout";
import SettingsLayout from "./layout/SettingLayout";

// Guards & Providers
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicRoute } from "./features/auth/components/PublicRoute";
import { SocketProvider } from "./features/socket/socket.context";

// --- Lazy Loaded Pages ---
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
const Home = lazy(() => import("./features/OtherPages/Home"));
const VerifyAccount = lazy(() => import("./features/auth/pages/VerifyAccount"));
const NotFound = lazy(() => import("./features/OtherPages/NotFound"));
const Products = lazy(() => import("./features/products/pages/Products"));
const ManageProduct = lazy(() => import("./features/products/pages/Manage"));
const Suppliers = lazy(() => import("./features/suppliers/pages/Suppliers"));
const SupplierView = lazy(() => import("./features/suppliers/pages/ViewSupplier"));
const ManageSupplier = lazy(() => import("./features/suppliers/pages/Manage"));
const StockManagement = lazy(() => import("./features/MovementTransaction/pages/MovementHub"));
const Alert = lazy(() => import("./features/alerts/pages/Alert"));
const ActivityLogs = lazy(() => import("./features/activityLogs/pages/ActivityLogs"));
const ReportsHub = lazy(() => import("./features/reports/pages/Report"));
const Transaction = lazy(() => import("./features/reports/pages/TransactionReport"));
const StockReport = lazy(() => import("./features/reports/pages/StockReport"));
const StockMovementReport = lazy(() => import("./features/reports/pages/MovementReport"));
const UserManagement = lazy(() => import("./features/auth/pages/UserManagement"));
const Dashboard = lazy(() => import("./features/dashboard/pages/Dashboard"));
const GeneralSettings = lazy(() => import("./features/settings/pages/General"));
const CategoryPage = lazy(() => import("./features/category/pages/CategoryPage"));
const UnitPage = lazy(() => import("./features/unit/pages/UnitPage"));
const ForgotPassword = lazy(() => import("./features/auth/pages/ForgetPassword"));
const StockMovementForm = lazy(() => import("./features/MovementTransaction/components/MovementTransactionForm"));
const ProductMovementHistory = lazy(() => import("./features/reports/pages/ProductMovementHistory"));
const TransactionViewPage = lazy(() => import("./features/reports/pages/TransactionViewPage"));
const ProductUnitPage = lazy(() => import("./features/ProductUnit/pages/ProductUnitPage"));
const ProfilePage = lazy(() => import("./features/OtherPages/Profile"));
const Unauthorized = lazy(() => import("./features/OtherPages/Unauthorized"));
const HelpPage = lazy(() => import("./features/OtherPages/Helper"));

axios.defaults.withCredentials = true;

// Page Loading Fallback Spinner
const PageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  useEffect(() => {
    void useAuthStore.getState().fetchUser();
  }, []);

  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="antialiased selection:bg-blue-100 selection:text-blue-700">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* --- Public / Auth Routes --- */}
              <Route element={<AuthLayout />}>
                <Route element={<PublicRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/help" element={<HelpPage />} />
                </Route>
                <Route path="/verify" element={<VerifyAccount />} />
                <Route path="/forget-password" element={<ForgotPassword />} />
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

                  {/* 2. Admin/Owner/Staff: Products & Suppliers */}
                  <Route path="/products">
                    <Route index element={<Products />} />
                    <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                      <Route path="add" element={<ManageProduct />} />
                      <Route path="edit/:productId" element={<ManageProduct />} />
                    </Route>
                  </Route>

                  <Route path="/suppliers">
                    <Route index element={<Suppliers />} />
                    <Route path="v/:id" element={<SupplierView />} />
                    <Route path="add" element={<ManageSupplier />} />
                    <Route path="edit/:id" element={<ManageSupplier />} />
                  </Route>

                  {/* 3. Admin/Staff Only: Stock Movements */}
                  <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
                    <Route path="/stock-movements">
                      <Route index element={<StockManagement />} />
                      <Route path="form" element={<StockMovementForm />} />
                    </Route>
                  </Route>

                  {/* 4. Reports routes */}
                  <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="activity" element={<ActivityLogs />} />
                  </Route>

                  <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                    <Route path="movement" element={<StockMovementReport />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin", "owner", "staff"]} />}>
                    <Route path="/reports">
                      <Route index element={<ReportsHub />} />
                      <Route path="transactions" element={<Transaction />} />
                      <Route path="transaction/:id" element={<TransactionViewPage />} />
                      <Route path="stock" element={<StockReport />} />
                      <Route path="stock/product-history/:productId" element={<ProductMovementHistory />} />
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
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          <Toaster position="top-right" theme="light" closeButton richColors />
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;