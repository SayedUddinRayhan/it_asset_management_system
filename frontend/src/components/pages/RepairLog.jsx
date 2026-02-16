import { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { FaSpinner, FaSearch } from "react-icons/fa";

function RepairLog() {
  const [form, setForm] = useState({
    product: null,
    fault_description: "",
    repair_vendor: "",
    sent_date: "",
    received_date: "",
    repair_cost: "",
    status: null,
  });

  const [logs, setLogs] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
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
      const [prodRes, statusRes, logRes] = await Promise.all([
        axios.get(`${API}/products/`, { params: { is_active: true } }),
        axios.get(`${API}/repair-statuses/`),
        axios.get(`${API}/repairs/`, { params: { page, search: searchTerm } }),
      ]);

      setAllProducts(prodRes.data.results);
      setAllStatuses(statusRes.data.results);
      setLogs(logRes.data.results);
      setCount(logRes.data.count);
    } catch (err) {
      console.error(err.response?.data);
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
    if (!form.product || !form.status) return;

    setSaving(true);
    try {
      await axios.post(`${API}/repairs/`, {
        product: form.product.value,
        fault_description: form.fault_description,
        repair_vendor: form.repair_vendor,
        sent_date: form.sent_date,
        received_date: form.received_date || null,
        repair_cost: form.repair_cost || null,
        status: form.status.value,
      });

      setForm({
        product: null,
        fault_description: "",
        repair_vendor: "",
        sent_date: "",
        received_date: "",
        repair_cost: "",
        status: null,
      });

      fetchAllData();
    } catch (err) {
      console.error(err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const productOptions = allProducts.map((p) => ({
    value: p.id,
    label: `${p.unique_code} - ${p.name}`,
  }));

  const statusOptions = allStatuses.map((s) => ({
    value: s.id,
    label: s.product_status_name,
  }));

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Add Repair Log */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          Product Repair Log
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product */}
          <div>
            <label className="text-sm font-medium mb-1 block">Product</label>
            <Select
              options={productOptions}
              value={form.product}
              onChange={(v) => setForm({ ...form, product: v })}
              placeholder="Select Product"
            />
          </div>

          {/* Repair Status */}
          <div>
            <label className="text-sm font-medium mb-1 block">Repair Status</label>
            <Select
              options={statusOptions}
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              placeholder="Select Status"
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="text-sm font-medium mb-1 block">Repair Vendor</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.repair_vendor}
              onChange={(e) => setForm({ ...form, repair_vendor: e.target.value })}
            />
          </div>

          {/* Cost */}
          <div>
            <label className="text-sm font-medium mb-1 block">Repair Cost</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.repair_cost}
              onChange={(e) => setForm({ ...form, repair_cost: e.target.value })}
            />
          </div>

          {/* Sent Date */}
          <div>
            <label className="text-sm font-medium mb-1 block">Sent Date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.sent_date}
              onChange={(e) => setForm({ ...form, sent_date: e.target.value })}
            />
          </div>

          {/* Received Date */}
          <div>
            <label className="text-sm font-medium mb-1 block">Received Date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.received_date}
              onChange={(e) => setForm({ ...form, received_date: e.target.value })}
            />
          </div>

          {/* Fault Description */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Fault Description</label>
            <textarea
              className="border rounded-lg px-3 py-2 w-full"
              rows={2}
              value={form.fault_description}
              onChange={(e) => setForm({ ...form, fault_description: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() =>
                setForm({
                  product: null,
                  fault_description: "",
                  repair_vendor: "",
                  sent_date: "",
                  received_date: "",
                  repair_cost: "",
                  status: null,
                })
              }
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
              {saving ? "Saving..." : "Add Repair Log"}
            </button>
          </div>
        </form>
      </div>

      {/* Search + Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">All Repair Logs</h3>
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by product"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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
                  <th className="px-6 py-3 border-b text-left text-sm">Product ID</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Product</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Status</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Vendor</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Sent</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Received</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No repair log data
                    </td>
                  </tr>
                ) : (
                  logs.map((l, i) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{(page - 1) * pageSize + i + 1}</td>
                      <td className="px-6 py-4">{l.product_code || "-"}</td>
                      <td className="px-6 py-4">{l.product_name || "-"}</td>
                      <td className="px-6 py-4">{l.status_name || "-"}</td>
                      <td className="px-6 py-4">{l.repair_vendor || "-"}</td>
                      <td className="px-6 py-4">{l.sent_date || "-"}</td>
                      <td className="px-6 py-4">{l.received_date || "-"}</td>
                      <td className="px-6 py-4">{l.repair_cost || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">
                Page {page} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RepairLog;
