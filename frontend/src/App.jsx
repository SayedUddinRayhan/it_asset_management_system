// App.jsx
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/context/AuthContext";

import Layout from "./components/layout/Layout";
import Login from "./components/auth/pages/Login";
import Register from "./components/auth/pages/Register";

import Dashboard from "./components/pages/Dashboard";
import Products from "./components/pages/products/Products";
import AddProduct from "./components/pages/products/AddProduct";
import EditProduct from "./components/pages/products/EditProduct";
import Departments from "./components/pages/Departments";
import Vendors from "./components/pages/Vendors";
import Categories from "./components/pages/Categories";
import AddStatus from "./components/pages/status/AddStatus";
import ChangeStatus from "./components/pages/status/ChangeStatus";
import RepairStatuses from "./components/pages/RapairStatuses"; // fixed: was RapairStatuses
import TransferLog from "./components/pages/TransferLog";
import RepairLog from "./components/pages/RepairLog";
import Users from "./components/pages/Users";
import UserPermissions from "./components/pages/UserPermissions";

import ProtectedRoute from "./components/common/ProtectedRoute";
import Forbidden from "./components/pages/Forbidden";
import NotFound from "./components/pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes ───────────────────────────────────────────── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/403"      element={<Forbidden />} />
          <Route path="/404"      element={<NotFound />} />

          {/* ── Protected routes (all inside Layout) ────────────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard — visible to all logged-in users */}
            <Route index element={<Dashboard />} />

            {/* Users */}
            <Route
              path="users"
              element={
                <ProtectedRoute permission="view_user">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="users/:id/permissions"
              element={
                <ProtectedRoute permission="view_permission">
                  <UserPermissions />
                </ProtectedRoute>
              }
            />

            {/* Products */}
            <Route
              path="products"
              element={
                <ProtectedRoute permission="view_product">
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="products/new"
              element={
                <ProtectedRoute permission="add_product">
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="products/edit/:id"
              element={
                <ProtectedRoute permission="change_product">
                  <EditProduct />
                </ProtectedRoute>
              }
            />

            {/* Other pages */}
            <Route
              path="departments"
              element={
                <ProtectedRoute permission="view_department">
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="vendors"
              element={
                <ProtectedRoute permission="view_vendor">
                  <Vendors />
                </ProtectedRoute>
              }
            />
            <Route
              path="categories"
              element={
                <ProtectedRoute permission="view_category">
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="statuses/add"
              element={
                <ProtectedRoute permission="add_status">
                  <AddStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="statuses/change"
              element={
                <ProtectedRoute permission="change_status">
                  <ChangeStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="repair-statuses"
              element={
                <ProtectedRoute permission="view_repairstatus">
                  <RepairStatuses />
                </ProtectedRoute>
              }
            />
            <Route
              path="transfers"
              element={
                <ProtectedRoute permission="view_transfer">
                  <TransferLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="repairs"
              element={
                <ProtectedRoute permission="view_repair">
                  <RepairLog />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ── Catch-all → 404 (not 403) ───────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>

        <ToastContainer position="top-right" autoClose={2000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
