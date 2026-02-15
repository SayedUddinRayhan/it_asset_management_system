import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";

function AddStatus() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "" });
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  const API = "http://127.0.0.1:8000/api";

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  const fetchStatuses = async (p = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/statuses/`, {
        params: { page: p, search },
      });
      setStatuses(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch statuses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses(page, searchTerm);
  }, [page, searchTerm]);

  // Add new status
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning("Please enter a status name");

    setSaving(true);
    try {
      const res = await axios.post(`${API}/statuses/`, form);
      toast.success("Status added successfully");
      setForm({ name: "" });
      // refetch first page to include new status
      setPage(1);
      fetchStatuses(1, searchTerm);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add status");
    } finally {
      setSaving(false);
    }
  };

  // Delete status
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this status?")) return;
    try {
      await axios.delete(`${API}/statuses/${id}/`);
      toast.success("Status deleted successfully");
      fetchStatuses(page, searchTerm);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete status");
    }
  };

  // Inline edit
  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditValue(name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) return toast.warning("Status name cannot be empty");
    try {
      await axios.patch(`${API}/statuses/${id}/`, { name: editValue });
      toast.success("Status updated successfully");
      // Update local state instantly
      setStatuses((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: editValue } : s))
      );
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Add Status */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Add New Status</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Status Name */}
          <div>
            <label className="text-sm font-medium mb-1 block">Status Name</label>
            <input
              name="name"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder="Enter status name"
              className={inputStyle}
              disabled={saving}
              required
            />
          </div>

          {/* Buttons – right aligned in 2nd column */}
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
              {saving ? "Saving..." : "Add Status"}
            </button>
          </div>
        </form>
      </div>

      {/* Status Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">All Statuses</h3>
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search status..."
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
          <div className="flex items-center text-gray-500">
            <FaSpinner className="animate-spin mr-2" /> Loading...
          </div>
        ) : statuses.length === 0 ? (
          <p className="text-gray-500">No statuses found</p>
        ) : (
          <>
           <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700 w-[80px]">SL</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Status Name</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statuses.map((s, index) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {editingId === s.id ? (
                        <input
                          className={inputStyle}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        s.name
                      )}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {editingId === s.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(s.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(s.id, s.name)}
                            className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
                          >
                            <HiOutlinePencilAlt />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
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
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? "bg-indigo-600 text-white px-3" : "px-3"}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AddStatus;
