import { BrowserRouter, Route, Routes } from "react-router-dom"

// Layouts
import AuthLayout from "./layout/AuthLayout"
import AppLayout from "./layout/AppLayout"

// Pages
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes Here */}
        <Route element={<AuthLayout />}>
          {/* Example Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes Here */}
        <Route element={<AppLayout />}>
          {/* Example Protected Route */}
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App