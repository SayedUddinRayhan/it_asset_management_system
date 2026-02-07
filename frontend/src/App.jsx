import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Dashboard from "./components/pages/Dashboard"
import Products from "./components/pages/Products"

function App() {
  

  return (
    <>
       <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path
          </Route>
        </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App
