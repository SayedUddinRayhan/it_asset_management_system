// Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaBoxOpen, 
  FaTools, 
  FaStore, 
  FaSitemap, 
  FaWarehouse, 
  FaClipboardList,
  FaCheckCircle,
  FaRedoAlt 
} from "react-icons/fa";
import { HiOutlineCash } from "react-icons/hi";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API = "http://127.0.0.1:8000/api/dashboard/";
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F472B6"];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_products: 0,
    total_repairs: 0,
    total_transfers: 0,
    total_vendors: 0,
    total_departments: 0,
    total_categories: 0,
    total_product_value: 0,
    total_repair_cost: 0,
  });
  const [departmentProducts, setDepartmentProducts] = useState([]);
  const [repairStatusCounts, setRepairStatusCounts] = useState([]);
  const [productCategoryCounts, setProductCategoryCounts] = useState([]);
  const [productVendorCounts, setProductVendorCounts] = useState([]);
  const [productStatusCounts, setProductStatusCounts] = useState({
    repaired: 0,
    repairing: 0,
    in_stock: 0,
    in_use: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API);
        const data = res.data;

        setSummary(data.summary || {});
        setDepartmentProducts(data.department_products || []);
        setRepairStatusCounts(data.repair_status_counts || []);
        setProductCategoryCounts(data.product_category_counts || []);
        setProductVendorCounts(data.product_vendor_counts || []);
        
        const statusMap = { repaired: 0, repairing: 0, in_stock: 0, in_use: 0 };
        (data.product_status_counts || []).forEach((item) => {
          const key = item.status_name.toLowerCase().replace(/\s+/g, "_");
          if (statusMap[key] !== undefined) statusMap[key] = item.value;
        });
        setProductStatusCounts(statusMap);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      name: "Total Price",
      count: `৳ ${Number(summary.total_product_value).toLocaleString()}`,
      icon: () => <HiOutlineCash className="w-6 h-6" />,
      color: "bg-purple-600",
    },
    {
      name: "Products",
      count: summary.total_products,
      icon: FaWarehouse,
      color: "bg-blue-500",
    },
    {
      name: "In Stock",
      count: productStatusCounts.in_stock,
      icon: FaBoxOpen,
      color: "bg-orange-500",
    },
    {
      name: "In Use",
      count: productStatusCounts.in_use,
      icon: FaClipboardList,
      color: "bg-yellow-500",
    },
    {
      name: "Repairing",
      count: productStatusCounts.repairing,
      icon: FaRedoAlt,
      color: "bg-red-500",
    },
    {
      name: "Repaired",
      count: productStatusCounts.repaired,
      icon: FaCheckCircle,
      color: "bg-green-500",
    },
    {
      name: "Vendors",
      count: summary.total_vendors,
      icon: FaStore,
      color: "bg-indigo-500",
    },
    {
      name: "Departments",
      count: summary.total_departments,
      icon: FaSitemap,
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard
      </h1>

      {loading ? (
        <div className="text-center text-gray-500 py-20 text-lg">
          Loading dashboard...
        </div>
      ) : (
        <>
      
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.name}
                  className={`flex items-center justify-between p-4 rounded-2xl shadow-lg text-white hover:shadow-xl transition ${card.color}`}
                >
                  <div>
                    <p className="text-2xl font-bold">{card.count}</p>
                    <p className="text-sm opacity-90">{card.name}</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-full">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              );
            })}
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Products by Category */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Products by Category
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategoryCounts}
                    dataKey="value"
                    nameKey="category__name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {productCategoryCounts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Repairs by Status */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Repairs Status
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={repairStatusCounts}
                    dataKey="value"
                    nameKey="status__name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {repairStatusCounts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Products by Vendor */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Products by Vendor
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productVendorCounts} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vendor__name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Products by Department */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Products by Department
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentProducts} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dept" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}