import { useEffect, useState } from "react";
import axios from "axios";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/vendors/");
        setVendors(res.data.results);
      } catch (error) {
        console.error("Failed to fetch vendors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Vendors</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : vendors.length === 0 ? (
        <p className="text-center text-gray-500">No vendor found</p>
      ) : (
        <ul className="space-y-4">
          {vendors.map((vendor) => (
            <li
              key={vendor.id}
              className="bg-white p-4 rounded shadow"
            >
              <h3 className="font-bold text-lg">{vendor.name}</h3>

              <p className="text-sm text-gray-600">
                {vendor.address}
              </p>

              <p>Phone: {vendor.phone}</p>
              <p>Email: {vendor.email}</p>

              <p className="text-xs text-gray-400">
                Created:{" "}
                {new Date(vendor.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Vendors;
