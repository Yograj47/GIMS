import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

// Shadcn UI Components
import { Toaster } from "sonner";

// Layouts
import AuthLayout from "./layout/AuthLayout";
import AppLayout from "./layout/AppLayout";

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
import StockManagement from "./features/stock/pages/StockHub";
import StockMovementForm from "./features/stock/components/StockForm";
import Alert from "./features/alerts/pages/Alert";
import ActivityLogs from "./features/activityLogs/pages/ActivityLogs";
import ReportsHub from "./features/reports/pages/Report";
import Transaction from "./features/transactions/pages/Transaction";
import StockReport from "./features/stock/pages/Stock";
import StockMovementReport from "./features/stock/pages/StockMovement";
import UserManagement from "./features/auth/pages/User";
import Dashboard from "./features/dashboard/pages/Dashboard";
import SettingsPage from "./features/settings/pages/Setting";

// Configure Axios outside the component to prevent re-runs on render
axios.defaults.withCredentials = true;

function App() {
  return (
    <BrowserRouter>
      {/* Standardizing the font and text rendering for the whole app.
          Antialiased helps fonts look "sharper" on modern screens.
      */}
      <div className="antialiased selection:bg-blue-100 selection:text-blue-700">
        
        <Routes>
          {/* --- Public / Marketing / Auth Routes --- */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyAccount />} />
          </Route>

          {/* --- Protected Inventory/Admin Routes --- */}
          <Route element={<AppLayout />}>
            {/* Dashboard placeholder - suggest creating a dedicated Dashboard feature soon */}
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/users" element={<UserManagement/>} />
            

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
              <Route path="form" element={<StockMovementForm/>} />
            </Route>

            {/* Alerts */}
             <Route path="/alerts">
              <Route index element={<Alert />} />
            </Route>

            {/* Setting */}
             <Route path="/settings">
              <Route index element={<SettingsPage />} />
            </Route>


            {/* Reports */}
             <Route path="/reports">
              <Route index element={<ReportsHub />} />
              <Route path="activity" element={<ActivityLogs />} />
              <Route path="transactions" element={<Transaction />} />
              <Route path="stock" element={<StockReport />} />
              <Route path="movement" element={<StockMovementReport />} />
            </Route>

          </Route>

          {/* --- 404 Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster position="top-right" richColors closeButton expand={false} />
        
      </div>
    </BrowserRouter>
  );
}

export default App;