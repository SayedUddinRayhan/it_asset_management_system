import { useEffect, useState } from "react";
import axios from "axios";
import { FaBoxOpen, FaTools, FaStore, FaSitemap } from "react-icons/fa";

function Dashboard() {
  const [summary, setSummary] = useState({
    products: 0,
    vendors: 0,
    departments: 0,
    repairs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [productsRes, vendorsRes, departmentsRes, repairsRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/products/"),
          axios.get("http://127.0.0.1:8000/api/vendors/"),
          axios.get("http://127.0.0.1:8000/api/departments/"),
          axios.get("http://127.0.0.1:8000/api/repairs/"),
        ]);

        setSummary({
          products: productsRes.data.length,
          vendors: vendorsRes.data.length,
          departments: departmentsRes.data.length,
          repairs: repairsRes.data.length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const cards = [
    { name: "Products", count: summary.products, icon: FaBoxOpen, color: "bg-blue-500" },
    { name: "Vendors", count: summary.vendors, icon: FaStore, color: "bg-green-500" },
    { name: "Departments", count: summary.departments, icon: FaSitemap, color: "bg-yellow-500" },
    { name: "Repairs", count: summary.repairs, icon: FaTools, color: "bg-red-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.name}
                className={`flex items-center p-4 rounded-lg shadow-lg ${card.color} text-white`}
              >
                <div className="p-3 rounded-full bg-white/20 mr-4">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.count}</p>
                  <p className="text-sm">{card.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional: Add charts or tables below */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
      </div>
    </div>
  );
}

export default Dashboard;
