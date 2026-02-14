import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

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

 
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [statusRes, categoryRes, departmentRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/statuses/"),
          axios.get("http://127.0.0.1:8000/api/categories/"),
          axios.get("http://127.0.0.1:8000/api/departments/"),
        ]);

        setStatusOptions(
          statusRes.data.results.map((s) => ({ value: s.id, label: s.name }))
        );
        setCategoryOptions(
          categoryRes.data.results.map((c) => ({ value: c.id, label: c.name }))
        );
        setDepartmentOptions(
          departmentRes.data.results.map((d) => ({ value: d.id, label: d.name }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchFilters();
  }, []);

  
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(page), 400);
    return () => clearTimeout(timer);
  }, [filters, page]);

  const fetchProducts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = {
        search: filters.search || undefined,
        status: filters.status?.value,
        category: filters.category?.value,
        current_department: filters.department?.value,
        ordering: filters.ordering,
        page: pageNumber,
      };

      const res = await axios.get("http://127.0.0.1:8000/api/products/", {params,});
      setProducts(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(count / 10);

  const exportFile = async (type) => {
    try {
      const url =
        type === "excel" ? "http://127.0.0.1:8000/api/export/products/excel/" : "http://127.0.0.1:8000/api/export/products/pdf/";

      const res = await axios.post(url,
        {
          search: filters.search || "",
          status: filters.status?.value || null,
          category: filters.category?.value || null,
          department: filters.department?.value || null,
          ordering: filters.ordering,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `products.${type === "excel" ? "xlsx" : "pdf"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  const previousProducts = products;
  setProducts(products.filter(p => p.id !== id));

  try {
    await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`);
    toast.success("Product deleted successfully");


    if (products.length === 1 && page > 1) {
      setPage(prev => prev - 1);
    } else {
      fetchProducts(page);
    }

  } catch (error) {
    setProducts(previousProducts);
    toast.error("Failed to delete product");
  }
};




  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow-xl rounded-2xl p-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Products
              </h1>
              <p className="text-sm text-gray-500">Manage all products</p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Link to="/products/new" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow w-full sm:w-auto justify-center">
                <FaPlus size={14} /> Add Product
              </Link>

              <button
                onClick={() => exportFile("excel")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow w-full sm:w-auto"
              >
                Excel
              </button>
              <button
                onClick={() => exportFile("pdf")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow w-full sm:w-auto"
              >
                PDF
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="bg-white p-4 rounded-xl shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="border p-2 rounded border-gray-300"
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
              className="border p-2 rounded border-gray-300 text-gray-500"
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

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto w-full">
              {loading ? (
                <p className="p-6 text-center">Loading...</p>
              ) : (
                <table className="min-w-full text-[11px] sm:text-sm table-auto min-w-[900px] border border-gray-200 divide-y divide-gray-200">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-gray-600">
                      <th className="px-2 py-2 border-b sm:px-3 sm:py-3 w-[30px]">SL</th>
                      <th className="px-2 py-2 border-b sm:px-3 sm:py-3">Name</th>
                      <th className="hidden border-b sm:table-cell px-2 py-2 sm:px-3 sm:py-3">Category</th>
                      <th className="hidden border-b md:table-cell px-2 py-2 sm:px-3 sm:py-3">Department</th>
                      <th className="hidden border-b lg:table-cell px-2 py-2 sm:px-3 sm:py-3">Vendor</th>
                      <th className="px-2 py-2 border-b sm:px-3 sm:py-3 w-[80px]">Price</th>
                      <th className="px-1 py-2 border-b sm:px-2 sm:py-3 w-[70px]">Purchase</th>
                      <th className="hidden border-b sm:table-cell px-1 py-2 sm:px-2 sm:py-3 w-[60px]">Warranty</th>
                      <th className="hidden border-b md:table-cell px-1 py-2 sm:px-2 sm:py-3 w-[70px]">End</th>
                      <th className="px-2 py-2 border-b sm:px-3 sm:py-3 w-[70px]">Status</th>
                      <th className="px-2 py-2 border-b sm:px-3 sm:py-3 text-center w-[80px]">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((p, index) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-2 py-2 sm:px-3 sm:py-3 text-center">{(page - 1) * 10 + index + 1}</td>

                        {/* Name / Category / Department: wrap after 30 chars */}
                        <td className="px-2 py-2 sm:px-3 sm:py-3">
                          <div className="break-words max-w-[200px]">{p.name}</div>
                        </td>
                        <td className="hidden sm:table-cell px-2 py-2 sm:px-3 sm:py-3 break-words max-w-[120px]">{p.category_name}</td>
                        <td className="hidden md:table-cell px-2 py-2 sm:px-3 sm:py-3 break-words max-w-[130px]">{p.department_name}</td>
                        <td className="hidden lg:table-cell px-2 py-2 sm:px-3 sm:py-3 break-words max-w-[130px]">{p.vendor_name}</td>

                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">৳ {p.price}</td>
                        <td className="px-1 py-2 sm:px-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-xs">
                          {p.purchase_date ? new Date(p.purchase_date).toLocaleDateString("en-GB") : "N/A"}
                        </td>
                        <td className="hidden sm:table-cell px-1 py-2 sm:px-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-xs">
                          {p.warranty_years ? `${p.warranty_years}y` : "N/A"}
                        </td>
                        <td className="hidden md:table-cell px-1 py-2 sm:px-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-xs">
                          {p.warranty_end_date ? new Date(p.warranty_end_date).toLocaleDateString("en-GB") : "N/A"}
                        </td>

                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs bg-green-100 text-green-700">{p.status_name}</span>
                          </div>
                        </td>

                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Link to={`/products/edit/${p.id}`} className="p-1.5 sm:p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                              <HiOutlinePencilAlt />
                            </Link>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 sm:p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                              <HiOutlineTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>


          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
              <p className="text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

  );
}

export default Products;
