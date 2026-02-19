import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { toast } from "react-toastify";

function RepairLog() {
  const API = "http://127.0.0.1:8000/api";

  const tabs = ["New Repair Entry", "Send to Vendor", "Return from Vendor"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [repairingStatusId, setRepairingStatusId] = useState(null);
  const [inStockStatusId, setInStockStatusId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ product: null, fault_description: "" });
  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  // Fetch all required data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [prodRes, statusRes, vendorRes, logRes] = await Promise.all([
        axios.get(`${API}/products/`, { params: { is_active: true } }),
        axios.get(`${API}/repair-statuses/`),
        axios.get(`${API}/vendors/`, { params: { is_active: true } }),
        axios.get(`${API}/repairs/`),
      ]);

      setProducts(prodRes.data.results);
      setVendors(vendorRes.data.results);
      setLogs(logRes.data.results);

      const repairing = statusRes.data.results.find((s) => s.name === "Repairing");
      const inStock = statusRes.data.results.find((s) => s.name === "In Stock");
      setRepairingStatusId(repairing?.id);
      setInStockStatusId(inStock?.id);

      toast.success("Data fetched successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.unique_code} - ${p.name}`,
  }));

  const vendorOptions = vendors.map((v) => ({ value: v.id, label: v.name }));

  // Filter logs for each tab
  const logsInTab = logs.filter((log) => {
    switch (activeTab) {
      case "New Repair Entry":
        return log.status_name === "Repairing" && !log.sent_date;
      case "Send to Vendor":
        return log.status_name === "Repairing" && log.fault_description && !log.sent_date;
      case "Return from Vendor":
        return log.status_name === "Repairing" && log.sent_date && !log.received_date;
      default:
        return false;
    }
  });

  const getTabCount = (tabName) =>
    logs.filter((log) => {
      switch (tabName) {
        case "New Repair Entry":
          return log.status_name === "Repairing" && !log.sent_date;
        case "Send to Vendor":
          return log.status_name === "Repairing" && log.fault_description && !log.sent_date;
        case "Return from Vendor":
          return log.status_name === "Repairing" && log.sent_date && !log.received_date;
        default:
          return false;
      }
    }).length;

  // Handlers
  const handleNewRepairSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.fault_description) return alert("Required fields");
    setSaving(true);
    try {
      await axios.post(`${API}/repairs/`, {
        product: form.product.value,
        fault_description: form.fault_description,
        status: repairingStatusId,
      });
      setForm({ product: null, fault_description: "" });
      fetchAllData();
      toast.success("Repair added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add repair");
    } finally {
      setSaving(false);
    }
  };

  const sendToVendor = async (log) => {
    if (!log.vendor || !log.sent_date) return alert("Select vendor and sent date");
    setSaving(true);
    try {
      await axios.patch(`${API}/repairs/${log.id}/`, {
        repair_vendor: log.vendor.value,
        sent_date: format(log.sent_date, "yyyy-MM-dd"),
        status: repairingStatusId,
      });
      fetchAllData();
      toast.success("Sent to vendor");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send to vendor");
    } finally {
      setSaving(false);
    }
  };

  const receiveFromVendor = async (log) => {
    if (!log.received_date) return alert("Select received date");
    setSaving(true);
    try {
      await axios.patch(`${API}/repairs/${log.id}/`, {
        received_date: format(log.received_date, "yyyy-MM-dd"),
        status: inStockStatusId,
      });
      fetchAllData();
      toast.success("Product returned to stock");
    } catch (err) {
      console.error(err);
      toast.error("Failed to return product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} ({getTabCount(tab)})
          </button>
        ))}
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6">
        {/* New Repair Entry */}
        {activeTab === "New Repair Entry" && (
          <form onSubmit={handleNewRepairSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Product</label>
              <Select
                options={productOptions}
                value={form.product}
                onChange={(v) => setForm({ ...form, product: v })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Fault Description</label>
              <textarea
                rows={2}
                className={inputStyle}
                value={form.fault_description}
                onChange={(e) => setForm({ ...form, fault_description: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
              >
                {saving && <FaSpinner className="animate-spin" />}
                {saving ? "Saving..." : "Add Repair"}
              </button>
            </div>
          </form>
        )}

        {/* Send to Vendor & Return from Vendor Tables */}
        {(activeTab === "Send to Vendor" || activeTab === "Return from Vendor") && (
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm">Product</th>
                <th className="px-6 py-3 text-left text-sm">Fault</th>
                {activeTab === "Send to Vendor" && <th className="px-6 py-3 text-left text-sm">Vendor</th>}
                <th className="px-6 py-3 text-left text-sm">{activeTab === "Send to Vendor" ? "Sent Date" : "Received Date"}</th>
                <th className="px-6 py-3 text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logsInTab.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{log.product_name}</td>
                  <td className="px-6 py-4">{log.fault_description}</td>

                  {activeTab === "Send to Vendor" && (
                    <td className="px-6 py-4 w-64">
                      <Select
                        options={vendorOptions}
                        value={log.vendor || null}
                        onChange={(v) => {
                          const updatedLog = { ...log, vendor: v };
                          setLogs((prev) => prev.map((l) => (l.id === log.id ? updatedLog : l)));
                        }}
                        placeholder="Select Vendor"
                      />
                    </td>
                  )}

                  <td className="px-6 py-4 w-40">
                    <DatePicker
                      selected={log[activeTab === "Send to Vendor" ? "sent_date" : "received_date"] ? new Date(log[activeTab === "Send to Vendor" ? "sent_date" : "received_date"]) : null}
                      onChange={(d) => {
                        const updatedLog = { ...log };
                        if (activeTab === "Send to Vendor") updatedLog.sent_date = d;
                        else updatedLog.received_date = d;
                        setLogs((prev) => prev.map((l) => (l.id === log.id ? updatedLog : l)));
                      }}
                      className={inputStyle}
                      dateFormat="dd/MM/yyyy"
                      placeholderText={activeTab === "Send to Vendor" ? "Sent Date" : "Received Date"}
                    />
                  </td>

                  <td className="px-6 py-4">
                    {activeTab === "Send to Vendor" && (
                      <button
                        onClick={() => sendToVendor(log)}
                        disabled={!log.vendor || !log.sent_date || saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Send
                      </button>
                    )}
                    {activeTab === "Return from Vendor" && (
                      <button
                        onClick={() => receiveFromVendor(log)}
                        disabled={!log.received_date || saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Receive
                      </button>
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

export default RepairLog;
