import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";

function Categories() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "" });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({ name: "" });

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  const API = "http://127.0.0.1:8000/api";

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";


  const fetchCategories = async (p = page, search = searchTerm) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/categories/`, {
        params: { page: p, search },
      });
      setCategories(res.data.results);
      setCount(res.data.count);
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page, searchTerm);
  }, [page, searchTerm]);

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning("Category name required");

    setSaving(true);
    try {
      await axios.post(`${API}/categories/`, form);
      toast.success("Category added");
      setForm({ name: "" });
      fetchCategories(1, searchTerm);
      setPage(1);
    } catch {
      toast.error("Failed to add category");
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API}/categories/${id}/`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };


  const handleEdit = (c) => {
    setEditingId(c.id);
    setEditValue({ name: c.name });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue({ name: "" });
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.name.trim()) return toast.warning("Name required");
    try {
      await axios.patch(`${API}/categories/${id}/`, editValue);
      toast.success("Category updated");
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...editValue } : c))
      );
      handleCancelEdit();
    } catch {
      toast.error("Update failed");
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">

      {/* Add Category */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Add New Category</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Category Name */}
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleInput}
              className={inputStyle}
              placeholder="Enter category name"
              required
            />
          </div>

        
          <div className="flex items-end justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <FaSpinner className="animate-spin" />}
              {saving ? "Saving..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">All Categories</h3>

          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search..."
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
        ) : categories.length === 0 ? (
          <p>No categories found</p>
        ) : (
          <>
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">SL</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Category ID</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 border-b text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((c, i) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(page - 1) * pageSize + i + 1}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {c.unique_code}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {editingId === c.id ? (
                        <input
                          value={editValue.name}
                          className={inputStyle}
                          onChange={(e) =>
                            setEditValue({ name: e.target.value })
                          }
                        />
                      ) : (
                        c.name
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm flex gap-2 justify-center">
                      {editingId === c.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(c.id)} className="text-green-600">
                            <FaSave />
                          </button>
                          <button onClick={handleCancelEdit} className="text-gray-600">
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200"
                          >
                            <HiOutlinePencilAlt />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                          >
                            <HiOutlineTrash />
                          </button>
                        </>
                      )}
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
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Categories;
