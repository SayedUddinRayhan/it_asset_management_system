import { useEffect, useState } from "react";
import axios from "axios";

function Status() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/statuses/");
        setStatuses(res.data);
      } catch (err) {
        console.error("Failed to fetch status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Status List</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : statuses.length === 0 ? (
        <p className="text-gray-500">No status found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statuses.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{s.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Status;
