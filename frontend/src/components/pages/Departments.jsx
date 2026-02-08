import { useEffect, useState } from "react";
import axios from "axios";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/departments/");
        setDepartments(res.data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Departments</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : departments.length === 0 ? (
        <p className="text-center text-gray-500">
          No department found
        </p>
      ) : (
        <ul className="space-y-4">
          {departments.map((dept) => (
            <li
              key={dept.id}
              className="bg-white p-4 rounded shadow"
            >
              <h3 className="font-bold text-lg">{dept.name}</h3>

              <p className="text-sm text-gray-600">
                {dept.description}
              </p>

              <p>Floor: {dept.location}</p>
              <p>Head: {dept.responsible_person}</p>

              <p className="text-xs text-gray-400">
                Created:{" "}
                {new Date(dept.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Departments;
