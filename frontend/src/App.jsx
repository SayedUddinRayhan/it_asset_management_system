import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/context/AuthContext";

import Layout from "./components/layout/Layout";
import Navbar from "./components/layout/Navbar";
import Login from "./components/auth/pages/Login";
import Register from "./components/auth/pages/Register";

// Protected Pages
import Dashboard from "./components/pages/Dashboard";
import Products from "./components/pages/products/Products";
import AddProduct from "./components/pages/products/AddProduct";
import EditProduct from "./components/pages/products/EditProduct";
import Departments from "./components/pages/Departments";
import Vendors from "./components/pages/Vendors";
import Categories from "./components/pages/Categories";
import AddStatus from "./components/pages/status/AddStatus";
import ChangeStatus from "./components/pages/status/ChangeStatus";
import RepairStatuses from "./components/pages/RapairStatuses";
import TransferLog from "./components/pages/TransferLog";
import RepairLog from "./components/pages/RepairLog";

// Protected Route Wrapper
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes (all inside Layout for sidebar etc.) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="departments" element={<Departments />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="categories" element={<Categories />} />
            <Route path="statuses/add" element={<AddStatus />} />
            <Route path="statuses/change" element={<ChangeStatus />} />
            <Route path="repair-statuses" element={<RepairStatuses />} />
            <Route path="transfers" element={<TransferLog />} />
            <Route path="repairs" element={<RepairLog />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Dashboard />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={2000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;