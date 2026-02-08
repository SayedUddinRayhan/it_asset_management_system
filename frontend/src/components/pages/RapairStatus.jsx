import { useEffect, useState } from "react";
import axios from "axios";

function RepairStatus() {
  const [repairStatuses, setRepairStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepairStatus = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/repair-statuses/"
        );
        setRepairStatuses(res.data);
      } catch (error) {
        console.error("Failed to fetch repair status", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepairStatus();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Repair Status</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : repairStatuses.length === 0 ? (
        <p className="text-center text-gray-500">No repair status found</p>
      ) : (
        <ul className="space-y-4">
          {repairStatuses.map((status) => (
            <li
              key={status.id}
              className="bg-white p-4 rounded shadow"
            >
              <h3 className="font-bold text-lg">{status.name}</h3>

              <p className="text-xs text-gray-400">
                Created:{" "}
                {new Date(status.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default RepairStatus;
