import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    ordering: "",
  });

  const API_BASE = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, statusesRes] = await Promise.all([
          axios.get(`${API_BASE}/products/`),
          axios.get(`${API_BASE}/categories/`),
          axios.get(`${API_BASE}/statuses/`),
        ]);

        setProducts(productsRes.data.results || productsRes.data);
        setCategories(categoriesRes.data);
        setStatuses(statusesRes.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

 
  const filteredProducts = products
    .filter((p) =>
      filters.search
        ? p.name.toLowerCase().includes(filters.search.toLowerCase())
        : true
    )
    .filter((p) => (filters.category ? p.category === filters.category : true))
    .filter((p) => (filters.status ? p.status === filters.status : true))
    .sort((a, b) => {
      if (!filters.ordering) return 0;
      const key = filters.ordering.replace("-", "");
      const desc = filters.ordering.startsWith("-");
      if (a[key] < b[key]) return desc ? 1 : -1;
      if (a[key] > b[key]) return desc ? -1 : 1;
      return 0;
    });

  
  const statusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const s = status.toLowerCase();
    if (s.includes("damaged")) return "bg-red-100 text-red-700";
    if (s.includes("in use")) return "bg-green-100 text-green-700";
    if (s.includes("repairing")) return "bg-yellow-100 text-yellow-700";
    if (s.includes("scrapped")) return "bg-gray-100 text-gray-700";
    if (s.includes("warranty")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
          Add Product
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search product..."
            className="w-full border rounded-lg pl-10 pr-3 py-2"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No products found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        ordering:
                          filters.ordering === "name" ? "-name" : "name",
                      })
                    }
                  >
                    Name
                  </th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        ordering:
                          filters.ordering === "quantity"
                            ? "-quantity"
                            : "quantity",
                      })
                    }
                  >
                    Qty
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        ordering:
                          filters.ordering === "price" ? "-price" : "price",
                      })
                    }
                  >
                    Price
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product, idx) => (
                  <tr
                    key={product.id}
                    className={`border-t hover:bg-gray-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {product.name}
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">{product.vendor}</td>
                    <td className="px-4 py-3">
                      {product.current_department}
                    </td>
                    <td className="px-4 py-3">{product.quantity}</td>
                    <td className="px-4 py-3">৳{product.price}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        <FaEdit />
                      </button>
                      <button className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
