import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaSpinner, FaSearch } from "react-icons/fa";
const API = "http://127.0.0.1:8000/api";

function RepairLog() {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);


  const [activeTab, setActiveTab] = useState("Pending Send");

  const [newRepair, setNewRepair] = useState({
    product: "",
    fault_description: "",
  });

  const [underRepairId, setUnderRepairId] = useState(null);

  const productOptions = products.map((p) => ({
  value: p.id,
  label: `${p.unique_code} - ${p.name}`,
}));


  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [logRes, productRes, vendorRes, statusRes] = await Promise.all([
      axios.get(`${API}/repairs/`),
      axios.get(`${API}/products/`),
      axios.get(`${API}/vendors/`),
      axios.get(`${API}/repair-statuses/`),
    ]);

    setLogs(logRes.data.results || logRes.data);
    setProducts(productRes.data.results || productRes.data);
    setVendors(vendorRes.data.results || vendorRes.data);
    setStatuses(statusRes.data.results || statusRes.data);

    const statusList = statusRes.data.results || statusRes.data;

    const underRepair = statusList.find(
      (s) => s.name === "Under Repair"
    );

    if (underRepair) {
      setUnderRepairId(underRepair.id);
    }
  } catch (error) {
    toast.error("Failed to fetch repair data.");
  } finally {
    setLoading(false);
  }
};

  const handleNewRepairSubmit = async (e) => {
    e.preventDefault();

    if (!underRepairId) {
      toast.error("Repair status not found.");
      return;
    }
    
    setSaving(true);
    try {
      setLoading(true);
      await axios.post(`${API}/repairs/`, {
      ...newRepair,
      status: underRepairId,
    });

    toast.success("New repair log added!");

    setNewRepair({
      product: "",
      fault_description: "",
    });

    fetchAll();
  } catch (error) {
    toast.error("Failed to add new repair log.");
  } finally {
    setSaving(false);
    setLoading(false);
  }
  };


  const handleSendToVendor = async (log) => {
    if (!log.repair_vendor) {
      alert("Please select vendor.");
      return;
    }

    try {
      setLoading(true);
      await axios.patch(`${API}/repairs/${log.id}/`, {
      sent_date: new Date().toISOString().split("T")[0],
      repair_vendor: log.repair_vendor,
    });

    toast.success("Sent to vendor!");

    fetchAll();
  } catch (error) {
    toast.error("Failed to send to vendor.");
  } finally {
    setLoading(false);
  }
  };

  const handleComplete = async (log) => {
    if (!log.temp_received_date || !log.temp_repair_cost) {
      alert("Enter received date and repair cost.");
      return;
    }

    try {
      setLoading(true);
      await axios.patch(`${API}/repairs/${log.id}/`, {
      received_date: log.temp_received_date,
      repair_cost: log.temp_repair_cost,
    });

    toast.success("Completed!");

    fetchAll();
    } catch (error) {
      toast.error("Failed to complete repair.");
    } finally {
      setLoading(false);
    }
  };


  const filteredLogs = logs
  .filter((log) => {
    switch (activeTab) {
      case "Pending Send":
        return !log.sent_date;
      case "Sent to Vendor":
        return log.sent_date && !log.received_date;
      case "Completed":
        return log.received_date;
      default:
        return false;
    }
  })
  .filter((log) => {
    if (!searchTerm) return true;

    return (
      log.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fault_description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });


  const tabs = ["Pending Send", "Sent to Vendor", "Completed"];

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Repair Management</h2>

 
      <div className="bg-white shadow rounded-lg p-5 mb-8">
        <form
          onSubmit={handleNewRepairSubmit}
          className="grid md:grid-cols-3 gap-4"
        >
          <Select
            options={productOptions}
            value={
              productOptions.find(
                (option) => option.value === newRepair.product
              ) || null
            }
            onChange={(selected) =>
              setNewRepair({
                ...newRepair,
                product: selected ? selected.value : "",
              })
            }
            placeholder="Select Product"
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />


          <input
            type="text"
            placeholder="Fault Description"
            className="border rounded px-3 py-2 focus:ring focus:ring-blue-200"
            value={newRepair.fault_description}
            onChange={(e) =>
              setNewRepair({
                ...newRepair,
                fault_description: e.target.value,
              })
            }
            required
          />

           <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
            >
              {saving && <FaSpinner className="animate-spin" />}
              {saving ? "Saving..." : "Add Status"}
            </button>
        </form>
      </div>
      </div>

      <div className="flex gap-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white border hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      
      {/* Repair Table */}
<div className="bg-white shadow-xl rounded-2xl p-6 overflow-x-auto">
  <div className="flex justify-between mb-4">
    <h3 className="font-semibold">Repair Logs</h3>

    <div className="relative w-64">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

    </div>
  </div>

  {loading ? (
    <div className="flex items-center">
      Loading...
    </div>
  ) : filteredLogs.length === 0 ? (
    <p>No repair records found</p>
  ) : (
    <table className="min-w-full border border-gray-200 divide-y divide-gray-200 table-auto">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">
            SL
          </th>
          <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">
            Product
          </th>
          <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">
            Fault
          </th>
          <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">
            Vendor
          </th>
          <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">
            Sent
          </th>
          <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">
            Received
          </th>
          <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-700">
            Repair Cost
          </th>
          <th className="px-4 py-3 border-b text-center text-sm font-medium text-gray-700">
            Actions
          </th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {filteredLogs.map((log, index) => (
          <tr key={log.id} className="hover:bg-gray-50">
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
              {index + 1}
            </td>

            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
              {log.product_name}
            </td>

            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
              {log.fault_description}
            </td>

            {/* Vendor */}
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 w-56">
              {!log.sent_date ? (
                <Select
                  placeholder="Select Vendor"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  options={vendors.map((v) => ({
                    value: v.id,
                    label: v.name,
                  }))}
                  onChange={(selected) =>
                    setLogs((prev) =>
                      prev.map((l) =>
                        l.id === log.id
                          ? { ...l, repair_vendor: selected?.value }
                          : l
                      )
                    )
                  }
                />
              ) : (
                log.repair_vendor_name || "-"
              )}
            </td>

            {/* Sent */}
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
              {log.sent_date || "-"}
            </td>

            {/* Received */}
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
              {activeTab === "Sent to Vendor" ? (
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm"
                  onChange={(e) =>
                    setLogs((prev) =>
                      prev.map((l) =>
                        l.id === log.id
                          ? {
                              ...l,
                              temp_received_date: e.target.value,
                            }
                          : l
                      )
                    )
                  }
                />
              ) : (
                log.received_date || "-"
              )}
            </td>

            {/* Cost */}
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
              {activeTab === "Sent to Vendor" ? (
                <input
                  type="number"
                  placeholder="Cost"
                  className="border rounded px-2 py-1 w-24 text-sm"
                  onChange={(e) =>
                    setLogs((prev) =>
                      prev.map((l) =>
                        l.id === log.id
                          ? {
                              ...l,
                              temp_repair_cost: e.target.value,
                            }
                          : l
                      )
                    )
                  }
                />
              ) : log.repair_cost ? (
                `৳ ${log.repair_cost}`
              ) : (
                "-"
              )}
            </td>

            {/* Actions */}
            <td className="px-4 py-4 whitespace-nowrap text-sm flex gap-2 justify-center">
              {!log.sent_date && (
                <button
                  onClick={() => handleSendToVendor(log)}
                  className="p-2 bg-yellow-100 rounded-full text-yellow-600 hover:bg-yellow-200"
                >
                  Send
                </button>
              )}

              {activeTab === "Sent to Vendor" && (
                <button
                  onClick={() => handleComplete(log)}
                  className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200"
                >
                  Complete
                </button>
              )}

              {activeTab === "Completed" && (
                <span className="text-green-600 font-medium text-xs">
                  Completed
                </span>
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