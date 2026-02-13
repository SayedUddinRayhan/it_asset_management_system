import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSpinner, FaSearch } from "react-icons/fa";

function ChangeStatus() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ product: null, status: null });
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const API = "http://127.0.0.1:8000/api";

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  // ---------- Fetch dropdowns and all products ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, statusRes] = await Promise.all([
          axios.get(`${API}/products/`),
          axios.get(`${API}/statuses/`),
        ]);

        const productOptions = prodRes.data.results.map((p) => ({
          value: p.id,
          label: p.name,
        }));
        setProducts(productOptions);
        setAllProducts(prodRes.data.results);

        const statusOptions = statusRes.data.results.map((s) => ({
          value: s.id,
          label: s.name,
        }));
        setStatuses(statusOptions);

        if (location.state?.productId) {
          const found = productOptions.find(
            (p) => p.value === location.state.productId
          );
          if (found) handleSelect("product", found);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products or statuses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------- Handle select ----------
  const handleSelect = async (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "product" && value) {
      try {
        const res = await axios.get(`${API}/products/${value.value}/`);
        setProductDetails(res.data);
      } catch {
        setProductDetails(null);
      }
    }
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.status) {
      toast.warning("Please select a product and status");
      return;
    }

    setSaving(true);
    try {
      await axios.patch(`${API}/products/${form.product.value}/`, {
        status: form.status.value,
      });
      toast.success("Product status updated successfully");

      setAllProducts((prev) =>
        prev.map((p) =>
          p.id === form.product.value
            ? { ...p, status_name: form.status.label }
            : p
        )
      );

      setForm({ product: null, status: null });
      setProductDetails(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Filter products ----------
  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <FaSpinner className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* Form Card */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
          Change Product Status
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Select */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Product</label>
            <Select
              options={products}
              value={form.product}
              onChange={(v) => handleSelect("product", v)}
              placeholder="Select product..."
              isClearable
            />
          </div>

          {/* Status Select */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">New Status</label>
            <Select
              options={statuses}
              value={form.status}
              onChange={(v) => handleSelect("status", v)}
              placeholder="Select new status..."
              isClearable
            />
          </div>

          {/* Product Preview */}
          {productDetails && (
            <div className="md:col-span-2 border rounded-lg p-4 bg-gray-50 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <p><strong>Name:</strong> {productDetails.name}</p>
                <p><strong>Category:</strong> {productDetails.category_name || "-"}</p>
                <p>
                  <strong>Current Status:</strong>
                  <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                    {productDetails.status_name}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="bg-gray-300 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2"
            >
              {saving && <FaSpinner className="animate-spin text-white" />}
              {saving ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">All Products Status</h3>

          {/* Search Field */}
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-full"
            />
          </div>
        </div>

        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">SL</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Product</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Current Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, index) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b text-sm">{index + 1}</td>
                <td className="px-4 py-2 border-b text-sm">{p.name}</td>
                <td className="px-4 py-2 border-b text-sm">{p.category_name || "-"}</td>
                <td className="px-4 py-2 border-b text-sm">
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                    {p.status_name}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ChangeStatus;
