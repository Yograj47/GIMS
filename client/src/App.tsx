import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";

// Shadcn UI Components
import { Toaster } from "./components/ui/sonner";

// Auth Guard & Store
import { useAuthStore } from "./store/authStore";

// Layouts
import AuthLayout from "./layout/AuthLayout";
import AppLayout from "./layout/AppLayout";
import FocusedWorkspace from "./features/workspaces/FocusedWorkspace";
import { workspaceHome } from "./shared/constants/roles";
import SettingsLayout from "./layout/SettingLayout";

// Guards & Providers
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicRoute } from "./features/auth/components/PublicRoute";
import { SocketProvider } from "./features/socket/socket.context";
import { StartupSkeleton } from "./components/common/LoadingSkeleton";

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
const SupplierBilling = lazy(() => import("./features/suppliers/pages/SupplierBilling"));
const ManageSupplier = lazy(() => import("./features/suppliers/pages/Manage"));
const StockManagement = lazy(() => import("./features/MovementTransaction/pages/MovementHub"));
const ActivityLogs = lazy(() => import("./features/activityLogs/pages/ActivityLogs"));
const ReportsHub = lazy(() => import("./features/reports/pages/Report"));
const AccountingReport = lazy(() => import("./features/reports/pages/AccountingReport"));
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
const SupplierMovement = lazy(() => import("./features/MovementTransaction/pages/SupplierMovement"));
const ProductMovementHistory = lazy(() => import("./features/reports/pages/ProductMovementHistory"));
const TransactionViewPage = lazy(() => import("./features/reports/pages/TransactionViewPage"));
const ProductUnitPage = lazy(() => import("./features/ProductUnit/pages/ProductUnitPage"));
const ProfilePage = lazy(() => import("./features/OtherPages/Profile"));
const Unauthorized = lazy(() => import("./features/OtherPages/Unauthorized"));
const HelpPage = lazy(() => import("./features/OtherPages/Helper"));
const Shop = lazy(() => import("./features/checkout/Shop"));
const CheckoutStatus = lazy(() => import("./features/checkout/CheckoutStatus"));
const StaffWorkspace = lazy(() => import("./features/workspaces/StaffWorkspace"));
const AccountingWorkspace = lazy(() => import("./features/workspaces/AccountingWorkspace"));
const Customers = lazy(() => import("./features/workspaces/Customers"));
const StaffOrders = lazy(() => import("./features/checkout/StaffOrders"));

axios.defaults.withCredentials = true;

function WorkspaceLayout() {
  const role = useAuthStore((state) => state.user?.role);
  return role === "staff" || role === "accountant" ? <FocusedWorkspace /> : <AppLayout />;
}

function WorkspaceDashboard() {
  const role = useAuthStore((state) => state.user?.role);
  const home = workspaceHome(role);
  return home === "/dashboard" ? <Dashboard /> : <Navigate replace to={home} />;
}

function App() {
  useEffect(() => {
    void useAuthStore.getState().fetchUser();
  }, []);

  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="antialiased selection:bg-brand-100 selection:text-link">
          <Suspense fallback={<StartupSkeleton />}>
            <Routes>
              {/* --- Public / Auth Routes --- */}
              <Route element={<AuthLayout />}>
                <Route element={<PublicRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/forget-password" element={<ForgotPassword />} />
                </Route>
                <Route element={<ProtectedRoute requireVerified={false} />}>
                  <Route path="/verify" element={<VerifyAccount />} />
                </Route>
              </Route>

              {/* --- Protected Inventory/Admin Routes --- */}
              <Route element={<ProtectedRoute />}>
                <Route element={<WorkspaceLayout />}>
                  <Route path="/dashboard" element={<WorkspaceDashboard />} />
                  <Route path="/me" element={<ProfilePage />} />

                  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/reports/activity" element={<ActivityLogs />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                    <Route path="/alerts" element={<Navigate replace to="/reports/stock?level=low" />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/add" element={<ManageProduct />} />
                    <Route path="/products/edit/:productId" element={<ManageProduct />} />
                    <Route path="/suppliers/add" element={<ManageSupplier />} />
                    <Route path="/suppliers/edit/:id" element={<ManageSupplier />} />
                    <Route path="/suppliers/v/:id" element={<SupplierView />} />
                    <Route path="/suppliers/v/:id/catalog" element={<SupplierView section="catalog" />} />
                    <Route path="/stock-movements" element={<StockManagement />} />
                    <Route path="/reports/movement" element={<StockMovementReport />} />
                    <Route path="/reports/stock" element={<StockReport />} />
                    <Route path="/reports/stock/product-history/:productId" element={<ProductMovementHistory />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin", "owner", "accountant"]} />}>
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/suppliers/v/:id/billing" element={<SupplierBilling />} />
                    <Route path="/reports" element={<ReportsHub />} />
                    <Route path="/reports/accounting" element={<AccountingReport />} />
                    <Route path="/reports/transactions" element={<Transaction />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
                    <Route path="/staff" element={<StaffWorkspace />} />
                    <Route path="/staff/customers" element={<Customers />} />
                    <Route path="/stock-movements/orders" element={<StaffOrders />} />
                  </Route>
                  <Route path="/reports/transaction/:id" element={<TransactionViewPage />} />
                  <Route element={<ProtectedRoute allowedRoles={["admin", "owner", "accountant"]} />}>
                    <Route path="/accounting" element={<AccountingWorkspace />} />
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

              <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
                <Route path="/stock-movements/form" element={<StockMovementForm />} />
                <Route path="/stock-movements/sale" element={<StockMovementForm purpose="Sale" />} />
                <Route path="/stock-movements/customer-return" element={<StockMovementForm purpose="Return" />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                <Route path="/stock-movements/adjustment" element={<StockMovementForm purpose="Adjustment" />} />
                <Route path="/stock-movements/purchase" element={<SupplierMovement mode="purchase" />} />
                <Route path="/stock-movements/supplier-lots" element={<SupplierMovement mode="lots" />} />
                <Route path="/stock-movements/supplier-return" element={<SupplierMovement mode="return" />} />
              </Route>

              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout/return" element={<CheckoutStatus />} />
              {/* --- 404 Route --- */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          <Toaster position="top-right" closeButton richColors />
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
