import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";

function Departments() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", location: "", responsible_person: "" });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({ name: "", location: "", responsible_person: "" });

  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  const API = "http://127.0.0.1:8000/api";

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  // Fetch departments
  const fetchDepartments = async (p = page, search = searchTerm) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/departments/`, {
        params: { page: p, search, is_active: true },
      });
      setDepartments(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(page, searchTerm);
  }, [page, searchTerm]);

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning("Please enter a department name");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API}/departments/`, form);
      toast.success("Department added");
      setForm({ name: "", location: "", responsible_person: "" });
      fetchDepartments(1, searchTerm);
      setPage(1);
    } catch (err) {
      toast.error("Failed to add department");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await axios.delete(`${API}/departments/${id}/`);
      toast.success("Department deleted");
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (d) => {
    setEditingId(d.id);
    setEditValue({ name: d.name, location: d.location, responsible_person: d.responsible_person });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue({ name: "", location: "", responsible_person: "" });
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.name.trim()) return toast.warning("Name required");
    try {
      await axios.patch(`${API}/departments/${id}/`, editValue);
      toast.success("Department updated");
      setDepartments(prev =>
        prev.map(d => (d.id === id ? { ...d, ...editValue } : d))
      );
      handleCancelEdit();
    } catch {
      toast.error("Update failed");
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">

      {/* Add Department */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Add New Department</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleInput}
              className={inputStyle}
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleInput}
              className={inputStyle}
              placeholder="Enter location"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Responsible Person</label>
            <input
              name="responsible_person"
              value={form.responsible_person}
              onChange={handleInput}
              className={inputStyle}
              placeholder="Enter person"
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-3 pt-4">
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
              {saving ? "Saving..." : "Add Department"}
            </button>
          </div>
        </form>
      </div>

      {/* Departments Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">All Departments</h3>
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
        ) : departments.length === 0 ? (
          <p>No departments found</p>
        ) : (
          <>
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">SL</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Location</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">Responsible Person</th>
                  <th className="px-6 py-3 border-b text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingId === d.id ? (
                        <input
                          value={editValue.name}
                          className={inputStyle}
                          onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                        />
                      ) : (
                        d.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingId === d.id ? (
                        <input
                          value={editValue.location}
                          className={inputStyle}
                          onChange={(e) => setEditValue({ ...editValue, location: e.target.value })}
                        />
                      ) : (
                        d.location || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingId === d.id ? (
                        <input
                          value={editValue.responsible_person}
                          className={inputStyle}
                          onChange={(e) => setEditValue({ ...editValue, responsible_person: e.target.value })}
                        />
                      ) : (
                        d.responsible_person || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2 justify-center">
                      {editingId === d.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(d.id)} className="text-green-600">
                            <FaSave />
                          </button>
                          <button onClick={handleCancelEdit} className="text-gray-600">
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200"
                          >
                            <HiOutlinePencilAlt />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
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

export default Departments;
