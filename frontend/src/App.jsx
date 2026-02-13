import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Dashboard from "./components/pages/Dashboard"
import Products from "./components/pages/products/Products"
import Departments from "./components/pages/Departments"
import Vendors from "./components/pages/Vendors"
import Categories from "./components/pages/Categories"
import AddStatus from "./components/pages/status/AddStatus"
import ChangeStatus from "./components/pages/status/ChangeStatus"
import RepairStatus from "./components/pages/RapairStatus" 
import TransferLog from "./components/pages/TransferLog"
import RepairLog from "./components/pages/RepairLog"
import AddProduct from "./components/pages/products/AddProduct"
import EditProduct from "./components/pages/products/EditProduct"

function App() {
  

  return (
    <>
       <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/statuses/add" element={<AddStatus />} />
            <Route path="/statuses/change" element={<ChangeStatus />} />
            <Route path="/repair-statuses" element={<RepairStatus />} />
            <Route path="/transfers" element={<TransferLog />} />
            <Route path="/repairs" element={<RepairLog />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App
