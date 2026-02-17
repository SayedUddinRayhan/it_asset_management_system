import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
function Vendors() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  const API = "http://127.0.0.1:8000/api";

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  const fetchVendors = async (p = page, search = searchTerm) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/vendors/`, {
        params: { page: p, search, is_active: true },
      });
      setVendors(res.data.results);
      setCount(res.data.count);
    } catch {
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(page, searchTerm);
  }, [page, searchTerm]);

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning("Vendor name required");

    setSaving(true);
    try {
      await axios.post(`${API}/vendors/`, form);
      toast.success("Vendor added");
      setForm({ name: "", phone: "", email: "", address: "" });
      fetchVendors(1, searchTerm);
      setPage(1);
    } catch {
      toast.error("Failed to add vendor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this vendor?")) return;
    try {
      await axios.delete(`${API}/vendors/${id}/`);
      toast.success("Vendor deleted");
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (v) => {
    setEditingId(v.id);
    setEditValue({
      name: v.name,
      phone: v.phone,
      email: v.email,
      address: v.address,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue({ name: "", phone: "", email: "", address: "" });
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.name.trim()) return toast.warning("Name required");
    try {
      await axios.patch(`${API}/vendors/${id}/`, editValue);
      toast.success("Vendor updated");
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...editValue } : v))
      );
      handleCancelEdit();
    } catch {
      toast.error("Update failed");
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">

      {/* Add Vendor */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Add New Vendor</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Name */}
        <div>
          <label className="text-sm font-medium mb-1 block">Vendor Name</label>
          <input
            type="text"
            required
            name="name"
            value={form.name}
            onChange={handleInput}
            className={inputStyle}
            placeholder="Enter vendor name"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium mb-1 block">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleInput}
            className={inputStyle}
            placeholder="Enter phone number"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInput}
            className={inputStyle}
            placeholder="Enter email address"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-medium mb-1 block">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleInput}
            className={inputStyle}
            placeholder="Enter address"
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-4 flex justify-end gap-3 pt-4">
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
            {saving ? "Saving..." : "Add Vendor"}
          </button>
        </div>

        </form>

      </div>

      {/* Vendors Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">All Vendors</h3>
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
        ) : vendors.length === 0 ? (
          <p>No vendors found</p>
        ) : (
          <>
            <table className="min-w-full text-[11px] sm:text-sm table-auto min-w-[900px] border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["SL", "Vendor ID", "Name", "Phone", "Email", "Address", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 border-b text-sm text-left font-medium text-gray-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, i) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-6 py-4">{v.unique_code}</td>
                    {["name", "phone", "email", "address"].map((f) => (
                      <td key={f} className="px-6 py-4">
                        {editingId === v.id ? (
                          <input
                            value={editValue[f]}
                            className={inputStyle}
                            onChange={(e) =>
                              setEditValue({ ...editValue, [f]: e.target.value })
                            }
                          />
                        ) : (
                          v[f] || "-"
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 flex gap-2 justify-center">
                      {editingId === v.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(v.id)} className="text-green-600">
                            <FaSave />
                          </button>
                          <button onClick={handleCancelEdit} className="text-gray-600">
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(v)} className="p-2 bg-blue-100 rounded-full text-blue-600">
                            <HiOutlinePencilAlt />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-2 bg-red-100 rounded-full text-red-600">
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

export default Vendors;
