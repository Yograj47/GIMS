import { BrowserRouter, Route, Routes } from "react-router-dom"

// Layouts
import AuthLayout from "./layout/AuthLayout"
import AppLayout from "./layout/AppLayout"

// Pages
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Home from "./features/Home"
import VerifyAccount from "./features/auth/pages/VerifyAccount"
import NotFound from "./features/NotFound"
import Products from "./features/products/pages/Products"

import { ToastContainer } from "react-toastify"
import axios from "axios"
import AddProduct from "./features/products/pages/AddProduct"
import EditProduct from "./features/products/pages/EditProduct"


function App() {
  axios.defaults.withCredentials = true;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes Here */}
        <Route element={<AuthLayout />}>
          {/* Example Public Route */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyAccount />} />

        </Route>

        {/* Protected Routes Here */}
        <Route element={<AppLayout />}>
          {/* Example Protected Route */}
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
        </Route>

        {/* Not Found Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App