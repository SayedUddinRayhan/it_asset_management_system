import { useEffect, useState } from "react";
import axios from "axios";

function RepairLog() {
  const [repairLogs, setRepairLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepairLogs = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/repairs/"
        );
        setRepairLogs(res.data.results);
      } catch (error) {
        console.error("Failed to fetch repair logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepairLogs();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Repair Logs</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : repairLogs.length === 0 ? (
        <p className="text-center text-gray-500">No repair log found</p>
      ) : (
        <ul className="space-y-4">
          {repairLogs.map((log) => (
            <li key={log.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">
                {log.product_name || "Unknown Product"}
              </h3>

              <p className="text-sm text-gray-600">
                Fault: {log.fault_description}
              </p>

              <p>Vendor: {log.repair_vendor}</p>

              <p>Sent Date: {log.sent_date}</p>
              <p>
                Received Date: {log.received_date || "Not Returned Yet"}
              </p>

              <p>Cost: ৳{log.repair_cost || 0}</p>

              <p className="text-sm text-gray-600">
                Status: {log.status_name || "N/A"}
              </p>

              <p className="text-xs text-gray-400">
                Created: {new Date(log.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default RepairLog;
