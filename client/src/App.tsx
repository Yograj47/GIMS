import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import axios from "axios";

// Shadcn UI Components
import { Toaster } from "./components/ui/sonner";

// Auth Guard & Store
import { useAuthStore } from "./store/authStore";

// Layouts
import AuthLayout from "./layout/AuthLayout";
import ShopLayout, { ShopAccountPage } from "./layout/ShopLayout";
import PublicInfoPage from "./features/OtherPages/PublicInfoPage";
import FocusedWorkspace from "./features/workspaces/FocusedWorkspace";
import { workspaceHome } from "./shared/constants/roles";
import SettingsLayout from "./layout/SettingLayout";

// Guards & Providers
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicRoute } from "./features/auth/components/PublicRoute";
import { SocketProvider } from "./features/socket/socket.context";
import { StartupSkeleton } from "./components/common/LoadingSkeleton";
import PageErrorBoundary from "./components/common/PageErrorBoundary";

// --- Lazy Loaded Pages ---
const Home = lazy(() => import("./features/OtherPages/Home"));
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
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
const TransactionViewPage = lazy(() => import("./features/reports/pages/TransactionViewPage"));
const ProductUnitPage = lazy(() => import("./features/ProductUnit/pages/ProductUnitPage"));
const ProfilePage = lazy(() => import("./features/OtherPages/Profile"));
const Unauthorized = lazy(() => import("./features/OtherPages/Unauthorized"));
const HelpPage = lazy(() => import("./features/OtherPages/Helper"));
const ShopCheckout = lazy(() => import("./features/checkout/ShopCheckout"));
const ShopOrders = lazy(() => import("./features/checkout/ShopOrders"));
const ShopProfile = lazy(() => import("./features/checkout/ShopProfile"));
const Shop = lazy(() => import("./features/checkout/Shop"));
const ShopProductDetail = lazy(() => import("./features/checkout/ShopProductDetail"));
const CheckoutStatus = lazy(() => import("./features/checkout/CheckoutStatus"));
const AccountingWorkspace = lazy(() => import("./features/workspaces/AccountingWorkspace"));
const Customers = lazy(() => import("./features/workspaces/Customers"));
const StaffOrders = lazy(() => import("./features/checkout/StaffOrders"));

axios.defaults.withCredentials = true;

function RegisterLayout() {
  const staff = useAuthStore((state) => state.user?.role === "staff");
  return staff ? <FocusedWorkspace /> : <Outlet />;
}

function WorkspaceDashboard() {
  const role = useAuthStore((state) => state.user?.role);
  const home = workspaceHome(role);
  return home === "/dashboard" ? <Dashboard /> : <Navigate replace to={home} />;
}

function App() {
  useEffect(() => {
    const expireSession = () => useAuthStore.getState().reset();
    window.addEventListener("session:expired", expireSession);
    void useAuthStore.getState().fetchUser();
    return () => window.removeEventListener("session:expired", expireSession);
  }, []);

  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="antialiased selection:bg-brand-100 selection:text-link">
          <PageErrorBoundary>
          <Suspense fallback={<StartupSkeleton />}>
            <Routes>
              {/* --- Public / Auth Routes --- */}
              <Route element={<AuthLayout />}>
                <Route element={<PublicRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Home />} />
                  <Route path="/register" element={<Navigate to="/shop/register" replace />} />
                  <Route path="/forget-password" element={<ForgotPassword />} />
                </Route>
                <Route path="/help" element={<HelpPage />} />
                <Route element={<ProtectedRoute requireVerified={false} />}>
                  <Route path="/verify" element={<VerifyAccount />} />
                </Route>
              </Route>
              <Route path="/about" element={<PublicInfoPage page="about" />} />
              <Route path="/contact" element={<PublicInfoPage page="contact" />} />
              <Route path="/terms" element={<PublicInfoPage page="terms" />} />
              <Route path="/privacy" element={<PublicInfoPage page="privacy" />} />

              {/* --- Protected Inventory/Admin Routes --- */}
              <Route element={<ProtectedRoute />}>
                <Route element={<FocusedWorkspace />}>
                  <Route path="/dashboard" element={<WorkspaceDashboard />} />
                  <Route path="/me" element={<ProfilePage />} />

                  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/reports/activity" element={<ActivityLogs />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                    <Route path="/alerts" element={<Navigate replace to="/reports/stock?level=low" />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/suppliers/v/:id" element={<SupplierView />} />
                    <Route path="/suppliers/v/:id/catalog" element={<SupplierView section="catalog" />} />
                    <Route path="/stock-movements" element={<StockManagement />} />
                    <Route path="/management/online-orders" element={<StaffOrders key="management" management />} />
                    <Route path="/reports/movement" element={<StockMovementReport />} />
                    <Route path="/reports/stock" element={<StockReport />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin", "owner", "accountant"]} />}>
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/suppliers/v/:id/billing" element={<SupplierBilling />} />
                    <Route path="/reports" element={<ReportsHub />} />
                    <Route path="/reports/accounting" element={<AccountingReport />} />
                    <Route path="/reports/transactions" element={<Transaction />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
                    <Route path="/staff" element={<Navigate replace to="/stock-movements/sale" />} />
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
                <Route element={<RegisterLayout />}>
                  <Route path="/stock-movements/sale" element={<StockMovementForm purpose="Sale" />} />
                  <Route path="/stock-movements/customer-return" element={<StockMovementForm purpose="Return" />} />
                </Route>
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["admin", "owner"]} />}>
                <Route path="/products/add" element={<ManageProduct />} />
                <Route path="/products/edit/:productId" element={<ManageProduct />} />
                <Route path="/suppliers/add" element={<ManageSupplier />} />
                <Route path="/suppliers/edit/:id" element={<ManageSupplier />} />
                <Route path="/stock-movements/adjustment" element={<StockMovementForm purpose="Adjustment" />} />
                <Route path="/stock-movements/purchase" element={<SupplierMovement mode="purchase" />} />
                <Route path="/stock-movements/supplier-lots" element={<SupplierMovement mode="lots" />} />
                <Route path="/stock-movements/supplier-return" element={<SupplierMovement mode="return" />} />
              </Route>

              <Route element={<ShopLayout />}>
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/all/" element={<Shop />} />
                <Route path="/shop/products/:id" element={<ShopProductDetail />} />
                <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
                  <Route path="/shop/cart" element={<ShopCheckout />} />
                  <Route path="/shop/checkout" element={<ShopCheckout checkout />} />
                  <Route path="/shop/orders" element={<ShopOrders key="history" />} />
                  <Route path="/shop/orders/:id" element={<ShopOrders key="tracking" />} />
                  <Route path="/shop/profile" element={<ShopProfile />} />
                </Route>
                <Route element={<PublicRoute />}>
                  <Route path="/shop/login" element={<ShopAccountPage><Login customer /></ShopAccountPage>} />
                  <Route path="/shop/register" element={<ShopAccountPage><Register /></ShopAccountPage>} />
                  <Route path="/shop/forget-password" element={<ShopAccountPage><ForgotPassword customer /></ShopAccountPage>} />
                </Route>
                <Route element={<ProtectedRoute requireVerified={false} />}>
                  <Route path="/shop/verify" element={<ShopAccountPage><VerifyAccount /></ShopAccountPage>} />
                </Route>
              </Route>
              <Route path="/checkout/return" element={<CheckoutStatus />} />
              {/* --- 404 Route --- */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </PageErrorBoundary>

          <Toaster position="top-right" closeButton richColors />
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
