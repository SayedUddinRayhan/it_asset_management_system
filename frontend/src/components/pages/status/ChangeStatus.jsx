import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSpinner, FaSearch, FaSave } from "react-icons/fa";

function ChangeStatus() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ product: null, status: null });
  const [statuses, setStatuses] = useState([]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  const API = "http://127.0.0.1:8000/api";

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  // ---------- Fetch statuses ----------
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await axios.get(`${API}/statuses/`);
        const statusOptions = res.data.results.map((s) => ({
          value: s.id,
          label: s.name,
        }));
        setStatuses(statusOptions);
      } catch {
        toast.error("Failed to fetch statuses");
      }
    };
    fetchStatuses();
  }, []);

  // ---------- Fetch products with server-side search & pagination ----------
  const fetchProducts = async (p = page, search = searchTerm) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products/`, {
        params: { page: p, search },
      });
      setProducts(res.data.results);
      setCount(res.data.count);

      // Pre-select if redirected
      if (location.state?.productId) {
        const found = res.data.results.find(
          (p) => p.id === location.state.productId
        );
        if (found)
          handleSelect("product", { value: found.id, label: found.name });
      }
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, searchTerm);
  }, [page, searchTerm]);

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

  // ---------- Handle submit ----------
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

      fetchProducts(page, searchTerm);
      setForm({ product: null, status: null });
      setProductDetails(null);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* ---------- Change Status Form ---------- */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Change Product Status</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Select */}
          <div>
            <label className="text-sm font-medium mb-1 block">Product</label>
            <Select
              options={products.map(p => ({ value: p.id, label: p.name }))}
              value={form.product}
              onChange={(v) => handleSelect("product", v)}
              placeholder="Select product..."
              isClearable
            />
          </div>

          {/* Status Select */}
          <div>
            <label className="text-sm font-medium mb-1 block">New Status</label>
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
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
            >
              {saving && <FaSpinner className="animate-spin" />}
              {saving ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>

      {/* ---------- Products Table ---------- */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">All Products Status</h3>

          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center">
            <FaSpinner className="animate-spin mr-2" /> Loading...
          </div>
        ) : products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <>
           <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700 w-[80px]">SL</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700 w-[80px]">Product ID</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Product</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Current Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.unique_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.category_name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                        {p.status_name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>


            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded">Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-indigo-600 text-white" : ""}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ChangeStatus;
