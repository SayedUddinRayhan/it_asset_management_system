import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
function RepairStatuses() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", product_status: "" });
  const [statuses, setStatuses] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({ name: "", product_status: "" });

  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  const API = "http://127.0.0.1:8000/api";

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  // Fetch Repair Statuses
  const fetchRepairStatuses = async (p = page, search = searchTerm) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/repair-statuses/`, {
        params: { page: p, search, is_active: true },
      });
      setStatuses(res.data.results);
      setCount(res.data.count);
    } catch {
      toast.error("Failed to fetch repair statuses");
    } finally {
      setLoading(false);
    }
  };

  // Load Product Status dropdown
  const fetchProductStatuses = async () => {
    const res = await axios.get(`${API}/statuses/`, {
      params: { is_active: true },
    });
    setAllStatuses(res.data.results);
  };

  useEffect(() => {
    fetchRepairStatuses(page, searchTerm);
  }, [page, searchTerm]);

  useEffect(() => {
    fetchProductStatuses();
  }, []);

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning("Name required");

    setSaving(true);
    try {
      await axios.post(`${API}/repair-statuses/`, form);
      toast.success("Repair status added");
      setForm({ name: "", product_status: "" });
      fetchRepairStatuses(1, searchTerm);
      setPage(1);
    } catch {
      toast.error("Add failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this repair status?")) return;
    try {
      await axios.delete(`${API}/repair-statuses/${id}/`);
      toast.success("Deleted");
      setStatuses((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setEditValue({ name: s.name, product_status: s.product_status });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue({ name: "", product_status: "" });
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.name.trim()) return toast.warning("Name required");
    try {
      await axios.patch(`${API}/repair-statuses/${id}/`, editValue);
      toast.success("Updated");
  
      const statusObj = allStatuses.find(
        (s) => s.id === parseInt(editValue.product_status)
      );
  
      setStatuses((prev) =>
        prev.map((s) =>
          s.id === id
            ? { 
                ...s,
                name: editValue.name,
                product_status: editValue.product_status,
                product_status_name: statusObj ? statusObj.name : "-" 
              }
            : s
        )
      );
  
      handleCancelEdit();
    } catch {
      toast.error("Update failed");
    }
  };
  

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">

      {/* Add Repair Status */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          Add New Repair Status
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input
              type="text"
              required
              name="name"
              value={form.name}
              onChange={handleInput}
              className={inputStyle}
              placeholder="Enter repair status"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Product Status
            </label>
            <Select
              options={allStatuses.map(s => ({ value: s.id, label: s.name }))}
              placeholder="Select product status"
              value={allStatuses
                .map(s => ({ value: s.id, label: s.name }))
                .find(o => o.value === form.product_status) || null}
              onChange={(opt) =>
                setForm({ ...form, product_status: opt?.value || "" })
              }
            />
          </div>

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
              {saving ? "Saving..." : "Add Status"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">All Repair Statuses</h3>
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
        ) : (
          <>
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm">SL</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Name</th>
                  <th className="px-6 py-3 border-b text-left text-sm">
                    Product Status
                  </th>
                  <th className="px-6 py-3 border-b text-center text-sm">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {statuses.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {(page - 1) * pageSize + i + 1}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === s.id ? (
                        <input
                          value={editValue.name}
                          className={inputStyle}
                          onChange={(e) =>
                            setEditValue({ ...editValue, name: e.target.value })
                          }
                        />
                      ) : (
                        s.name
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === s.id ? (
                        <select
                          value={editValue.product_status}
                          onChange={(e) =>
                            setEditValue({
                              ...editValue,
                              product_status: e.target.value,
                            })
                          }
                          className={inputStyle}
                        >
                          {allStatuses.map((ps) => (
                            <option key={ps.id} value={ps.id}>
                              {ps.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        s.product_status_name || "-"
                      )}
                    </td>

                    <td className="px-6 py-4 flex gap-2 justify-center">
                      {editingId === s.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(s.id)} className="text-green-600">
                            <FaSave />
                          </button>
                          <button onClick={handleCancelEdit} className="text-gray-600">
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-2 bg-blue-100 rounded-full text-blue-600"
                          >
                            <HiOutlinePencilAlt />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 bg-red-100 rounded-full text-red-600"
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
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? "bg-indigo-600 text-white px-3" : "px-3"}
                    >
                      {i + 1}
                    </button>
                  ))}
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

export default RepairStatuses;
