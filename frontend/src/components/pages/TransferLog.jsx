import { useEffect, useState } from "react";
import axios from "axios";

function TransferLog() {
  const [transferLogs, setTransferLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransferLogs = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/transfers/"
        );
        setTransferLogs(res.data.results);
      } catch (error) {
        console.error("Failed to fetch transfer logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransferLogs();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Transfer Logs</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : transferLogs.length === 0 ? (
        <p className="text-center text-gray-500">No transfer log found</p>
      ) : (
        <ul className="space-y-4">
          {transferLogs.map((log) => (
            <li key={log.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">
                {log.product || "Unknown Product"}
              </h3>

              <p className="text-sm text-gray-600">
                From: {log.from_department || "N/A"}
              </p>

              <p className="text-sm text-gray-600">
                To: {log.to_department_name || "N/A"}
              </p>

              <p>Transfer Date: {log.transfer_date}</p>

              <p className="text-sm text-gray-600">
                Note: {log.note || "—"}
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

export default TransferLog;
