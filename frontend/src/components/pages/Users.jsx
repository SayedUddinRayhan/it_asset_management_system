import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { usePermissions } from "../hooks/usePermissions";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const inputStyle = "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

function Users() {
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [editValue, setEditValue]   = useState({ phone: "", first_name: "", last_name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage]             = useState(1);
  const [count, setCount]           = useState(0);
  const pageSize = 10;

  const fetchUsers = async (p = page, search = searchTerm) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/auth/users/`, {
        params: { page: p, search },
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setUsers(res.data.results);
      setCount(res.data.count);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(page, searchTerm); }, [page, searchTerm]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API}/auth/users/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setCount((c) => c - 1);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setEditValue({ phone: u.phone, first_name: u.first_name, last_name: u.last_name });
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      await axios.patch(`${API}/auth/users/${id}/`, editValue, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      toast.success("User updated");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...editValue } : u)));
      setEditingId(null);
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">

        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-xl">All Users</h3>
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by phone or name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 py-8">
            <FaSpinner className="animate-spin" /> Loading...
          </div>
        ) : (
          <>
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">SL</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">First Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Last Name</th>
                  {can("view_permission") && (
                    <th className="px-6 py-3 text-center text-sm font-medium">Permissions</th>
                  )}
                  {(can("change_user") || can("delete_user")) && (
                    <th className="px-6 py-3 text-center text-sm font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{(page - 1) * pageSize + i + 1}</td>

                    <td className="px-6 py-4 text-sm">
                      {editingId === u.id
                        ? <input className={inputStyle} value={editValue.phone}
                            onChange={(e) => setEditValue({ ...editValue, phone: e.target.value })} />
                        : u.phone}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {editingId === u.id
                        ? <input className={inputStyle} value={editValue.first_name}
                            onChange={(e) => setEditValue({ ...editValue, first_name: e.target.value })} />
                        : u.first_name}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {editingId === u.id
                        ? <input className={inputStyle} value={editValue.last_name}
                            onChange={(e) => setEditValue({ ...editValue, last_name: e.target.value })} />
                        : u.last_name}
                    </td>

                    {can("view_permission") && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/users/${u.id}/permissions`)}
                          className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-sm hover:bg-indigo-200"
                        >
                          Manage
                        </button>
                      </td>
                    )}

                    {(can("change_user") || can("delete_user")) && (
                      <td className="px-6 py-4 text-sm flex gap-2 justify-center">
                        {editingId === u.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(u.id)} disabled={saving} className="text-green-600 disabled:opacity-50">
                              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-gray-600">
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            {can("change_user") && (
                              <button onClick={() => handleEdit(u)} className="p-2 bg-blue-100 rounded-full text-blue-600">
                                <HiOutlinePencilAlt />
                              </button>
                            )}
                            {can("delete_user") && (
                              <button onClick={() => handleDelete(u.id)} className="p-2 bg-red-100 rounded-full text-red-600">
                                <HiOutlineTrash />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, count)} of {count}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded border ${p === page ? "bg-indigo-600 text-white" : "hover:bg-gray-50"}`}>
                      {p}
                    </button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Users;