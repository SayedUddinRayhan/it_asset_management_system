import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

function RepairLog() {
  const API = "http://127.0.0.1:8000/api";

  // Tabs
  const tabs = [
    "New Repair Entry",
    "Send to Vendor",
    "Product Return",
    "Ready to Send Back Dept",
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Data
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for new repair
  const [form, setForm] = useState({
    product: null,
    fault_description: "",
  });

  const inputStyle =
    "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm";

  // Fetch all data
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
      setStatuses(statusRes.data.results);
      setVendors(vendorRes.data.results);
      setLogs(logRes.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Options
  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.unique_code} - ${p.name}`,
  }));

  const vendorOptions = vendors.map((v) => ({
    value: v.id,
    label: v.name,
  }));

  // Map status names to IDs dynamically
  const statusMap = {};
  statuses.forEach((s) => {
    statusMap[s.name] = s.id;
  });

  // Workflow mapping
  const workflowStages = {
    "New Repair Entry": ["Ready to Send Vendor"],
    "Send to Vendor": ["Sent to Vendor"],
    "Product Return": ["Returned from Vendor"],
    "Ready to Send Back Dept": ["Repaired", "Not Repaired", "Ready to Send Back Dept"],
  };

  // Filter logs by tab
  const logsInTab = logs.filter((log) =>
    workflowStages[activeTab].includes(log.status_name)
  );

  // Get total count for tab
  const getTabCount = (tabName) => {
    const stages = workflowStages[tabName];
    return logs.filter((log) => stages.includes(log.status_name)).length;
  };

  // Handlers
  const handleNewRepairSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.fault_description) return alert("Required fields");
    setSaving(true);

    try {
      await axios.post(`${API}/repairs/`, {
        product: form.product.value,
        fault_description: form.fault_description,
        status: statusMap["Ready to Send Vendor"], // dynamic
      });
      setForm({ product: null, fault_description: "" });
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to add repair");
    } finally {
      setSaving(false);
    }
  };

  const moveToVendor = async (log) => {
    if (!log.vendor || !log.sent_date)
      return alert("Select vendor and sent date");
    setSaving(true);
    try {
      await axios.patch(`${API}/repairs/${log.id}/`, {
        status: statusMap["Sent to Vendor"],
        repair_vendor: log.vendor.value,
        sent_date: format(log.sent_date, "yyyy-MM-dd"),
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const finalizeReturn = async (log, newStatusName) => {
    if (!newStatusName) return alert("Select status");
    setSaving(true);
    try {
      await axios.patch(`${API}/repairs/${log.id}/`, {
        status: statusMap[newStatusName],
        received_date: log.received_date
          ? format(log.received_date, "yyyy-MM-dd")
          : null,
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
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
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Repair</h2>
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
          </>
        )}

        {/* Send to Vendor */}
        {activeTab === "Send to Vendor" && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Send Products to Vendor</h2>
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm">Product</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Fault</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Vendor</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Sent Date</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logsInTab.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{log.product_name}</td>
                    <td className="px-6 py-4">{log.fault_description}</td>
                    <td className="px-6 py-4 w-64">
                      <Select
                        options={vendorOptions}
                        value={log.vendor || null}
                        onChange={(v) => {
                          const updatedLog = { ...log, vendor: v };
                          setLogs((prev) =>
                            prev.map((l) => (l.id === log.id ? updatedLog : l))
                          );
                        }}
                        placeholder="Select Vendor"
                      />
                    </td>
                    <td className="px-6 py-4 w-40">
                      <DatePicker
                        selected={log.sent_date || null}
                        onChange={(d) => {
                          const updatedLog = { ...log, sent_date: d };
                          setLogs((prev) =>
                            prev.map((l) => (l.id === log.id ? updatedLog : l))
                          );
                        }}
                        className={inputStyle}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select Date"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => moveToVendor(log)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Send
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Product Return */}
        {activeTab === "Product Return" && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Return Products</h2>
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm">Product</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Fault</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Received Date</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Status</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logsInTab.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{log.product_name}</td>
                    <td className="px-6 py-4">{log.fault_description}</td>
                    <td className="px-6 py-4 w-40">
                      <DatePicker
                        selected={log.received_date ? new Date(log.received_date) : null}
                        onChange={(d) => {
                          const updatedLog = { ...log, received_date: d };
                          setLogs((prev) =>
                            prev.map((l) => (l.id === log.id ? updatedLog : l))
                          );
                        }}
                        className={inputStyle}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Received Date"
                      />
                    </td>
                    <td className="px-6 py-4 w-56">
                      <Select
                        options={statuses
                          .filter((s) => ["Repaired", "Not Repaired"].includes(s.name))
                          .map((s) => ({ label: s.name, value: s.id }))}
                        value={log.status || null}
                        onChange={(v) => {
                          const updatedLog = { ...log, status: v };
                          setLogs((prev) =>
                            prev.map((l) => (l.id === log.id ? updatedLog : l))
                          );
                        }}
                        placeholder="Select Status"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => finalizeReturn(log, log.status?.label)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Ready to Send Back Dept */}
        {activeTab === "Ready to Send Back Dept" && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ready to Send Back to Department</h2>
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm">Product</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Fault</th>
                  <th className="px-6 py-3 border-b text-left text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logsInTab.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{log.product_name}</td>
                    <td className="px-6 py-4">{log.fault_description}</td>
                    <td className="px-6 py-4">{log.status_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default RepairLog;
