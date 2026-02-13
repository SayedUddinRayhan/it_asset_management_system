import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaTrash, FaEdit, FaSave, FaTimes, FaSearch } from "react-icons/fa";

function AddStatus() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "" });
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API = "http://127.0.0.1:8000/api";

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/statuses/`);
      setStatuses(res.data.results);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch statuses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleInput = (e) => setForm({ name: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning("Please enter a status name");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(`${API}/statuses/`, form);
      toast.success("Status added successfully");
      setStatuses((prev) => [res.data, ...prev]);
      setForm({ name: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add status");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this status?")) return;
    try {
      await axios.delete(`${API}/statuses/${id}/`);
      toast.success("Status deleted successfully");
      setStatuses((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete status");
    }
  };

  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) {
      toast.warning("Status name cannot be empty");
      return;
    }
    try {
      await axios.patch(`${API}/statuses/${id}/`, { name: editValue });
      toast.success("Status updated successfully");
      setStatuses((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: editValue } : s))
      );
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const filteredStatuses = statuses.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Add Status Form */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
          Add New Status
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Status Name
            </label>
            <input
              name="name"
              value={form.name}
              placeholder="Enter status name"
              onChange={handleInput}
              className={inputStyle}
              disabled={saving}
            />
          </div>

          <div className="md:col-span-2 flex justify-end items-center gap-3 pt-4">
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
              {saving ? "Saving..." : "Add Status"}
            </button>
          </div>
        </form>
      </div>

      {/* Status Table  */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">All Statuses</h3>
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center text-gray-500">
            <FaSpinner className="animate-spin mr-2" /> Loading...
          </div>
        ) : filteredStatuses.length === 0 ? (
          <p className="text-gray-500">No status found</p>
        ) : (
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">SL</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Status Name</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatuses.map((s, index) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b text-sm">{index + 1}</td>
                  <td className="px-4 py-2 border-b text-sm">
                    {editingId === s.id ? (
                      <input
                        className={inputStyle}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(s.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                    ) : (
                      s.name
                    )}
                  </td>
                  <td className="px-4 py-2 border-b text-sm flex gap-2">
                    {editingId === s.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(s.id)}
                          className="text-green-500 hover:text-green-700 focus:ring-2 focus:ring-green-300 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-gray-300 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(s.id, s.name)}
                          className="text-blue-500 hover:text-blue-700 focus:ring-2 focus:ring-blue-300 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-500 hover:text-red-700 focus:ring-2 focus:ring-red-300 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AddStatus;
