import { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { FaSpinner, FaSearch } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

function RepairLog() {
  const [form, setForm] = useState({
    product: null,
    fault_description: "",
    repair_vendor: null,
    sent_date: null,
    received_date: null,
    repair_cost: "",
    status: null,
  });

  const [logs, setLogs] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({}); 

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;

  const API = "http://127.0.0.1:8000/api";

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [prodRes, statusRes, vendorRes, logRes] = await Promise.all([
        axios.get(`${API}/products/`, { params: { is_active: true } }),
        axios.get(`${API}/repair-statuses/`),
        axios.get(`${API}/vendors/`, { params: { is_active: true } }),
        axios.get(`${API}/repairs/`, { params: { page, search: searchTerm } }),
      ]);

      setAllProducts(prodRes.data.results);
      setAllStatuses(statusRes.data.results);
      setAllVendors(vendorRes.data.results);
      setLogs(logRes.data.results);
      setCount(logRes.data.count);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setLogs([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [page, searchTerm]);

  // Product / status / vendor options
  const productOptions = allProducts.map((p) => ({
    value: p.id,
    label: `${p.unique_code} - ${p.name}`,
  }));

  const statusOptions = allStatuses.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const vendorOptions = allVendors.map((v) => ({
    value: v.id,
    label: v.name,
  }));

  // Handle create repair log
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!form.product) newErrors.product = "Product is required";
    if (!form.status) newErrors.status = "Status is required";
    if (!form.fault_description) newErrors.fault_description = "Fault description is required";
    if (!form.repair_vendor) newErrors.repair_vendor = "Repair vendor is required";
    if (!form.sent_date) newErrors.sent_date = "Sent date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        product: form.product.value,
        fault_description: form.fault_description,
        repair_vendor: form.repair_vendor.value,
        sent_date: format(form.sent_date, "yyyy-MM-dd"),
        received_date: form.received_date ? format(form.received_date, "yyyy-MM-dd") : null,
        repair_cost: form.repair_cost || null,
        status: form.status.value,
      };

      const res = await axios.post(`${API}/repairs/`, payload);

      // Update logs locally
      setLogs([res.data, ...logs]);

      setForm({
        product: null,
        fault_description: "",
        repair_vendor: null,
        sent_date: null,
        received_date: null,
        repair_cost: "",
        status: null,
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      if (err.response?.data) setErrors(err.response.data);
    } finally {
      setSaving(false);
    }
  };

  // Handle "Mark as Received"
  const handleMarkReceived = async (log) => {
    const receivedDate = log.received_date ? new Date(log.received_date) : new Date();
    const cost = log.repair_cost || 0;

    const statusObj = allStatuses.find((s) => s.name === "Done");
    if (!statusObj) return alert("Please create 'Done' status first.");

    const payload = {
      received_date: format(receivedDate, "yyyy-MM-dd"),
      repair_cost: cost,
      status: statusObj.id,
    };

    try {
      const res = await axios.patch(`${API}/repairs/${log.id}/`, payload);
      // Update local logs
      setLogs(logs.map((l) => (l.id === log.id ? { ...l, ...res.data } : l)));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error updating repair log.");
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Form */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Product Repair Log</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Product</label>
            <Select
              options={productOptions}
              value={form.product}
              onChange={(v) => setForm({ ...form, product: v })}
              placeholder="Select Product"
            />
            {errors.product && <p className="text-red-500 text-sm mt-1">{errors.product}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Repair Status</label>
            <Select
              options={statusOptions}
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              placeholder="Select Status"
            />
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Repair Vendor</label>
            <Select
              options={vendorOptions}
              value={form.repair_vendor}
              onChange={(v) => setForm({ ...form, repair_vendor: v })}
              placeholder="Select Vendor"
            />
            {errors.repair_vendor && <p className="text-red-500 text-sm mt-1">{errors.repair_vendor}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Repair Cost</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.repair_cost}
              onChange={(e) => setForm({ ...form, repair_cost: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Sent Date</label>
            <DatePicker
              selected={form.sent_date}
              onChange={(date) => setForm({ ...form, sent_date: date })}
              dateFormat="dd/MM/yyyy"
              className="border rounded-lg px-3 py-2 w-full"
            />
            {errors.sent_date && <p className="text-red-500 text-sm mt-1">{errors.sent_date}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Received Date</label>
            <DatePicker
              selected={form.received_date}
              onChange={(date) => setForm({ ...form, received_date: date })}
              dateFormat="dd/MM/yyyy"
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Fault Description</label>
            <textarea
              className="border rounded-lg px-3 py-2 w-full"
              rows={2}
              value={form.fault_description}
              onChange={(e) => setForm({ ...form, fault_description: e.target.value })}
            />
            {errors.fault_description && <p className="text-red-500 text-sm mt-1">{errors.fault_description}</p>}
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setForm({
                product: null, fault_description: "", repair_vendor: null,
                sent_date: null, received_date: null, repair_cost: "", status: null
              })}
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

      {/* Logs Table */}
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
          <div className="flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading...</div>
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
                  <th className="px-6 py-3 border-b text-left text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-6 text-gray-500">No repair log data</td></tr>
                ) : (
                  logs.map((l, i) => {
                    const isReceived = l.received_date && l.repair_cost && l.status_name === "Done";
                    return (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{(page - 1) * pageSize + i + 1}</td>
                        <td className="px-6 py-4">{l.product_code || "-"}</td>
                        <td className="px-6 py-4">{l.product_name || "-"}</td>
                        <td className="px-6 py-4">{l.status_name || "-"}</td>
                        <td className="px-6 py-4">{l.repair_vendor_name || "-"}</td>
                        <td className="px-6 py-4">{l.sent_date ? format(new Date(l.sent_date), "dd/MM/yyyy") : "-"}</td>
                        <td className="px-6 py-4">{l.received_date ? format(new Date(l.received_date), "dd/MM/yyyy") : "-"}</td>
                        <td className="px-6 py-4">{l.repair_cost || "-"}</td>
                        <td className="px-6 py-4">
                          {isReceived ? (
                            <span className="text-green-600 font-semibold">Done</span>
                          ) : (
                            <button
                              onClick={() => handleMarkReceived(l)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                            >
                              Mark as Received
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
              <span className="px-3 py-1">Page {page} of {totalPages || 1}</span>
              <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages || totalPages === 0} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RepairLog;
