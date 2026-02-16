import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner, FaSearch } from "react-icons/fa";
import Select from "react-select";

function TransferLogs() {
  const [form, setForm] = useState({
    product: null,
    from_department: null,
    to_department: null,
    note: "",
  });

  const [logs, setLogs] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  const API = "http://127.0.0.1:8000/api";

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [prodRes, depRes, logRes] = await Promise.all([
        axios.get(`${API}/products/`, { params: { is_active: true } }),
        axios.get(`${API}/departments/`, { params: { is_active: true } }),
        axios.get(`${API}/transfers/`, { params: { page, search: searchTerm } }),
      ]);

      setAllProducts(prodRes.data.results);
      setAllDepartments(depRes.data.results);
      setLogs(logRes.data.results);
      setCount(logRes.data.count);
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Failed to fetch data");
      setLogs([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [page, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.to_department) {
      return toast.warning("All required fields must be filled");
    }

    setSaving(true);
    try {
      await axios.post(`${API}/transfers/`, {
        product: form.product.value,
        to_department: form.to_department.value,
        note: form.note || "",
      });
      toast.success("Transfer added");
      setForm({ product: null, from_department: null, to_department: null, note: "" });
      fetchAllData();
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Add failed");
    } finally {
      setSaving(false);
    }
  };

  const productOptions = allProducts.map((p) => ({
    value: p.id,
    label: p.name,
    current_department: p.current_department,
  }));
  const departmentOptions = allDepartments.map((d) => ({ value: d.id, label: d.name }));

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Add Transfer Log */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Product Department Transfer</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product */}
          <div>
            <label className="text-sm font-medium mb-1 block">Product</label>
            <Select
              options={productOptions}
              value={form.product}
              onChange={(selected) => {
                setForm({
                  ...form,
                  product: selected,
                  from_department: selected?.current_department
                    ? departmentOptions.find(d => d.value === selected.current_department)
                    : null,
                });
              }}
              placeholder="Select Product"
            />
          </div>

          {/* From Department */}
          <div>
            <label className="text-sm font-medium mb-1 block">From Department</label>
            <Select
              value={form.from_department}
              isDisabled
              options={departmentOptions}
              placeholder="From Department"
            />
          </div>

          {/* To Department */}
          <div>
            <label className="text-sm font-medium mb-1 block">To Department</label>
            <Select
              options={departmentOptions}
              value={form.to_department}
              onChange={(selected) => setForm({ ...form, to_department: selected })}
              placeholder="Select To Department"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium mb-1 block">Note</label>
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              placeholder="Write note"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setForm({ product: null, from_department: null, to_department: null, note: "" })}
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
              {saving ? "Saving..." : "Add Transfer"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">All Transfer Logs</h3>
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading...</div>
        ) : (
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 border-b text-left text-sm">SL</th>
                <th className="px-6 py-3 border-b text-left text-sm">Product ID</th>
                <th className="px-6 py-3 border-b text-left text-sm">Product</th>
                <th className="px-6 py-3 border-b text-left text-sm">From Dept</th>
                <th className="px-6 py-3 border-b text-left text-sm">To Dept</th>
                <th className="px-6 py-3 border-b text-left text-sm">Transfer Date</th>
                <th className="px-6 py-3 border-b text-left text-sm">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    No transfer log data
                  </td>
                </tr>
              ) : (
                logs.map((l, i) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-6 py-4">{l.unique_code || "-"}</td>
                    <td className="px-6 py-4">{l.product_name || "-"}</td>
                    <td className="px-6 py-4">{l.from_department_name || "-"}</td>
                    <td className="px-6 py-4">{l.to_department_name || "-"}</td>
                    <td className="px-6 py-4">{l.transfer_date || "-"}</td>
                    <td className="px-6 py-4">{l.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TransferLogs;
