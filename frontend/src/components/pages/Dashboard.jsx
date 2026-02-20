import { useEffect, useState } from "react";
import axios from "axios";
import { FaBoxOpen, FaTools, FaStore, FaSitemap } from "react-icons/fa";
import { toast } from "react-toastify";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API = "http://127.0.0.1:8000/api";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    products: 0,
    vendors: 0,
    departments: 0,
    repairs: 0,
  });
  const [productStatuses, setProductStatuses] = useState({});
  const [repairsByStatus, setRepairsByStatus] = useState({});
  const [departmentProducts, setDepartmentProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsRes, vendorsRes, departmentsRes, repairsRes] = await Promise.all([
          axios.get(`${API}/products/`),
          axios.get(`${API}/vendors/`),
          axios.get(`${API}/departments/`),
          axios.get(`${API}/repairs/`),
        ]);

        // Basic counts
        setSummary({
          products: productsRes.data.count,
          vendors: vendorsRes.data.count,
          departments: departmentsRes.data.count,
          repairs: repairsRes.data.count,
        });

        // Product Status Breakdown
        const statuses = {};
        (productsRes.data.results || []).forEach((p) => {
          const name = p.status_name || "Unknown";
          statuses[name] = (statuses[name] || 0) + 1;
        });
        setProductStatuses(statuses);

        // Repair Status Breakdown
        const repairStatus = {};
        (repairsRes.data.results || []).forEach((r) => {
          const name = r.status_name || "Unknown";
          repairStatus[name] = (repairStatus[name] || 0) + 1;
        });
        setRepairsByStatus(repairStatus);

        // Department-wise product count
        const deptProducts = {};
        (productsRes.data.results || []).forEach((p) => {
          const dept = p.current_department_name || "Unassigned";
          deptProducts[dept] = (deptProducts[dept] || 0) + 1;
        });
        setDepartmentProducts(
          Object.entries(deptProducts).map(([dept, count]) => ({ dept, count }))
        );

        // Recent Products
        setRecentProducts((productsRes.data.results || []).slice(0, 5));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    { name: "Products", count: summary.products, icon: FaBoxOpen, color: "bg-blue-500" },
    { name: "Vendors", count: summary.vendors, icon: FaStore, color: "bg-green-500" },
    { name: "Departments", count: summary.departments, icon: FaSitemap, color: "bg-yellow-500" },
    { name: "Repairs", count: summary.repairs, icon: FaTools, color: "bg-red-500" },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Summary Cards */}
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Product Status</h2>
              <Pie
                data={{
                  labels: Object.keys(productStatuses),
                  datasets: [
                    {
                      data: Object.values(productStatuses),
                      backgroundColor: [
                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#9CA3AF",
                      ],
                    },
                  ],
                }}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Department-wise Products</h2>
              <Bar
                data={{
                  labels: departmentProducts.map((d) => d.dept),
                  datasets: [
                    {
                      label: "Products",
                      data: departmentProducts.map((d) => d.count),
                      backgroundColor: "#3B82F6",
                    },
                  ],
                }}
              />
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">Recent Products</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Department
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700">{p.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{p.status_name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{p.current_department_name || "-"}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;