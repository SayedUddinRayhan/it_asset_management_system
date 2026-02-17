import { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { FaSpinner, FaSearch } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function RepairLog() {
  const API = "http://127.0.0.1:8000/api";
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalCost, setModalCost] = useState("");
  const [modalDate, setModalDate] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const [updating, setUpdating] = useState(false);


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

  // Pagination
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(count / pageSize);

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  // Fetch
  const fetchAllData = async (p = page, search = searchTerm) => {
    try {
      setLoading(true);
      const [prodRes, statusRes, vendorRes, logRes] = await Promise.all([
        axios.get(`${API}/products/`, { params: { is_active: true } }),
        axios.get(`${API}/repair-statuses/`),
        axios.get(`${API}/vendors/`, { params: { is_active: true } }),
        axios.get(`${API}/repairs/`, { params: { page: p, search } }),
      ]);

      setAllProducts(prodRes.data.results);
      setAllStatuses(statusRes.data.results);
      setAllVendors(vendorRes.data.results);
      setLogs(logRes.data.results);
      setCount(logRes.data.count);
    } catch (err) {
      console.error(err);
      setLogs([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(page, searchTerm);
  }, [page, searchTerm]);

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

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      const payload = {
        product: form.product.value,
        fault_description: form.fault_description,
        repair_vendor: form.repair_vendor.value,
        sent_date: format(form.sent_date, "yyyy-MM-dd"),
        received_date: form.received_date
          ? format(form.received_date, "yyyy-MM-dd")
          : null,
        repair_cost: form.repair_cost || null,
        status: form.status.value,
      };

      await axios.post(`${API}/repairs/`, payload);

      setForm({
        product: null,
        fault_description: "",
        repair_vendor: null,
        sent_date: null,
        received_date: null,
        repair_cost: "",
        status: null,
      });

      fetchAllData(1, searchTerm);
      setPage(1);
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReceived = (log) => {
    setSelectedLog(log);
    setModalCost(log.repair_cost || "");
    setModalDate(log.received_date ? new Date(log.received_date) : new Date());

    const currentStatus = allStatuses.find(s => s.name === log.status_name);
    setModalStatus(
      currentStatus
        ? { value: currentStatus.id, label: currentStatus.name }
        : null
    );

    setShowModal(true);
  };

  const handleUpdateRepair = async () => {
    if (!modalDate) return alert("Received date required");
    if (!modalStatus) return alert("Status required");

    setUpdating(true);

    try {
      const payload = {
        received_date: format(modalDate, "yyyy-MM-dd"),
        repair_cost: modalCost || 0,
        status: modalStatus.value,
      };

      const res = await axios.patch(`${API}/repairs/${selectedLog.id}/`, payload);

      setLogs(prev =>
        prev.map(l =>
          l.id === selectedLog.id ? { ...l, ...res.data } : l
        )
      );

      setShowModal(false);
    } catch (err) {
      alert("Update failed");
    } finally {
      setUpdating(false);
    }
  };


  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">

   {/* Repair Log Form */}
<div className="bg-white shadow-xl rounded-2xl p-6">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
    Add Repair Log
  </h2>

  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* Product */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Product</label>
      <Select
        options={productOptions}
        value={form.product}
        onChange={(v) => setForm({ ...form, product: v })}
        className="w-full"
        classNamePrefix="select"
        placeholder="Select Product"
      />
    </div>

    {/* Status */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
      <Select
        options={statusOptions}
        value={form.status}
        onChange={(v) => setForm({ ...form, status: v })}
        className="w-full"
        classNamePrefix="select"
        placeholder="Select Status"
      />
    </div>

    {/* Sent Date */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Sent Date</label>
      <DatePicker
        selected={form.sent_date}
        onChange={(d) => setForm({ ...form, sent_date: d })}
        dateFormat="dd/MM/yyyy"
        placeholderText="dd/mm/yyyy"
        className={inputStyle}
      />
    </div>

    {/* Vendor */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Vendor</label>
      <Select
        options={vendorOptions}
        value={form.repair_vendor}
        onChange={(v) => setForm({ ...form, repair_vendor: v })}
        className="w-full"
        classNamePrefix="select"
        placeholder="Select Vendor"
      />
    </div>

    {/* Repair Cost */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Repair Cost</label>
      <input
        type="number"
        value={form.repair_cost}
        onChange={(e) => setForm({ ...form, repair_cost: e.target.value })}
        className={inputStyle}
        placeholder="Enter Cost"
      />
    </div>

    {/* Received Date */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Received Date</label>
      <DatePicker
        selected={form.received_date}
        onChange={(d) => setForm({ ...form, received_date: d })}
        dateFormat="dd/MM/yyyy"
        placeholderText="dd/mm/yyyy"
        className={inputStyle}
      />
    </div>

    {/* Fault Description */}
    <div className="flex flex-col md:col-span-3">
      <label className="text-sm font-medium text-gray-700 mb-1">Fault Description</label>
      <textarea
        rows={3}
        value={form.fault_description}
        onChange={(e) => setForm({ ...form, fault_description: e.target.value })}
        className={inputStyle}
        placeholder="Describe the fault"
      />
    </div>

    {/* Submit / Cancel */}
    <div className="flex justify-end items-center gap-3 md:col-span-3 mt-4">
      <button
        type="button"
        onClick={() => navigate("/products/")}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition"
      >
        {saving && <FaSpinner className="animate-spin text-white" />}
        {saving ? "Saving..." : "Add Repair"}
      </button>
    </div>
  </form>
</div>



      {/* TABLE */}
      <div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">All Repair Logs</h3>
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
          <div className="flex items-center">
            <FaSpinner className="animate-spin mr-2" /> Loading...
          </div>
        ) : logs.length === 0 ? (
          <p>No repair logs found</p>
        ) : (
          <>
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm">SL</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Product ID</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Product</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Vendor</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Status</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Sent</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Received</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Cost</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {logs.map((l, i) => {
                  const isDone = l.status_name === "Done";
                  return (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{(page - 1) * pageSize + i + 1}</td>
                      <td className="px-6 py-4">{l.product_code}</td>
                      <td className="px-6 py-4">{l.product_name}</td>
                      <td className="px-6 py-4">{l.repair_vendor_name}</td>
                      <td className="px-6 py-4">{l.status_name}</td>
                      <td className="px-6 py-4">{l.sent_date}</td>
                      <td className="px-6 py-4">{l.received_date || "-"}</td>
                      <td className="px-6 py-4">{l.repair_cost || "-"}</td>
                      <td className="px-6 py-4">
                        {l.status_name === "Done" || l.status_name === "Repaired" ? (
                          <button
                            disabled
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm opacity-60 cursor-not-allowed"
                          >
                            Repaired
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkReceived(l)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                          >
                            Mark Repaired
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* SAME PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? "bg-indigo-600 text-white px-3" : "px-3"}>
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

    {showModal && selectedLog && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 animate-fadeIn">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          Update Repair Status
        </h3>

        <button
          onClick={() => setShowModal(false)}
          className="text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">

        <form className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Product */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Product</label>
            <input
              value={selectedLog.product_name}
              disabled
              className="border bg-gray-100 rounded-lg px-3 py-2 w-full text-sm"
            />
          </div>

          {/* Vendor */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <input
              value={selectedLog.repair_vendor_name}
              disabled
              className="border bg-gray-100 rounded-lg px-3 py-2 w-full text-sm"
            />
          </div>

          {/* Sent Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Sent Date</label>
            <input
              value={selectedLog.sent_date}
              disabled
              className="border bg-gray-100 rounded-lg px-3 py-2 w-full text-sm"
            />
          </div>

          {/* Repair Cost */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Repair Cost</label>
            <input
              type="number"
              value={modalCost}
              onChange={(e) => setModalCost(e.target.value)}
              className={inputStyle}
              placeholder="Enter repair cost"
            />
          </div>

          {/* Received Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Received Date</label>
            <DatePicker
              selected={modalDate}
              onChange={(d) => setModalDate(d)}
              dateFormat="dd/MM/yyyy"
              className={inputStyle}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              options={statusOptions}
              value={modalStatus}
              onChange={(v) => setModalStatus(v)}
              placeholder="Select Status"
              className="w-full"
              classNamePrefix="select"
              menuPosition="fixed"
            />
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateRepair}
          disabled={updating}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm flex items-center gap-2"
        >
          {updating && <FaSpinner className="animate-spin" />}
          {updating ? "Updating..." : "Update Repair"}
        </button>
      </div>

    </div>
  </div>
)}








    </div>
  );
}

export default RepairLog;
