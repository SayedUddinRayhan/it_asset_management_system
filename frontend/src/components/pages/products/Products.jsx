import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0); 
  const [filters, setFilters] = useState({
    search: "",
    status: null,
    category: null,
    department: null,
    ordering: "-created_at",
  });

  const [statusOptions, setStatusOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  // ---------------- FETCH FILTER OPTIONS ----------------
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [statusRes, categoryRes, departmentRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/statuses/'),
          axios.get('http://127.0.0.1:8000/api/categories/'),
          axios.get('http://127.0.0.1:8000/api/departments/'),
        ]);

        setStatusOptions(statusRes.data.results.map((s) => ({ value: s.id, label: s.name })));
        setCategoryOptions(categoryRes.data.results.map((c) => ({ value: c.id, label: c.name })));
        setDepartmentOptions(departmentRes.data.results.map((d) => ({ value: d.id, label: d.name })));
      } catch (err) {
        console.error("Failed to load filter data", err);
      }
    };

    fetchFilters();
  }, []);

  // ---------------- FETCH PRODUCTS ----------------
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(page), 400);
    return () => clearTimeout(timer);
  }, [filters, page]);

  const fetchProducts = async (pageNumber = 1) => {
    setLoading(true);

    const params = {
      search: filters.search || undefined,
      status: filters.status?.value,
      category: filters.category?.value,
      current_department: filters.department?.value,
      ordering: filters.ordering,
      page: pageNumber,
    };

    try {
      const res = await axios.get('http://127.0.0.1:8000/api/products/', { params });
      setProducts(res.data.results); 
      setCount(res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(count / 10); 

  // EXPORT
  const exportFile = async (type) => {
    try {
      const url =
        type === "excel"
          ? "http://127.0.0.1:8000/api/export/products/excel/"
          : "http://127.0.0.1:8000/api/export/products/pdf/";

      const res = await axios.post(
        url,
        {
          search: filters.search || "",
          status: filters.status?.value || null,
          category: filters.category?.value || null,
          department: filters.department?.value || null,
          ordering: filters.ordering,
        },
        {
          responseType: "blob", 
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Create download link
      const blob = new Blob([res.data], { type: type === "excel" ? 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `products.${type === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export file");
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">Manage all products</p>
        </div>

        <div className="flex flex-wrap gap-2">
        <button
          onClick={() => alert("Open Add Product Modal")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <FaPlus size={14} />
          Add Product
        </button>

          <button
            onClick={() => exportFile("excel")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Excel
          </button>
          <button
            onClick={() => exportFile("pdf")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
          >
            PDF
          </button>
        </div>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white p-4 rounded-xl shadow grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Search name or model..."
          className="border p-2 rounded"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <Select
          placeholder="Category"
          options={categoryOptions}
          value={filters.category}
          onChange={(v) => setFilters({ ...filters, category: v })}
          isClearable
        />

        <Select
          placeholder="Department"
          options={departmentOptions}
          value={filters.department}
          onChange={(v) => setFilters({ ...filters, department: v })}
          isClearable
        />

        <Select
          placeholder="Status"
          options={statusOptions}
          value={filters.status}
          onChange={(v) => setFilters({ ...filters, status: v })}
          isClearable
        />

        <select
          className="border p-2 rounded"
          value={filters.ordering}
          onChange={(e) => setFilters({ ...filters, ordering: e.target.value })}
        >
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
          <option value="price">Price Low</option>
          <option value="-price">Price High</option>
        </select>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No products found</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Department</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.category_name}</td>
                  <td className="p-3">{p.department_name}</td>
                  <td className="p-3">{p.vendor_name}</td>
                  <td className="p-3">৳ {p.price}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      {p.status_name}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => alert("Edit " + p.id)}
                      className="inline-flex items-center justify-center p-2 rounded-full
                                bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                      title="Edit"
                    >
                      <HiOutlinePencilAlt size={16} />
                    </button>

                    <button
                      onClick={() => alert("Soft delete " + p.id)}
                      className="inline-flex items-center justify-center p-2 rounded-full
                                bg-red-100 text-red-600 hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-500">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
