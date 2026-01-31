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
            <Route path="/dashboard" element={<div className="p-4">Dashboard Page</div>} />
            
            {/* Product Management */}
            <Route path="/products">
              <Route index element={<Products />} />
              <Route path="add" element={<ManageProduct />} />
              <Route path="edit/:productId" element={<ManageProduct />} />
            </Route>

            {/* Supplier Management */}
             <Route path="/suppliers">
              <Route index element={<Suppliers />} />
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