import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaBoxOpen, FaStore, FaSitemap, FaTags, FaExchangeAlt, FaTools, FaBars } from "react-icons/fa";

function Sidebar({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: FaTachometerAlt },
    { name: "Products", path: "/products", icon: FaBoxOpen },
    { name: "Vendors", path: "/vendors", icon: FaStore },
    { name: "Departments", path: "/departments", icon: FaSitemap },
    { name: "Categories", path: "/categories", icon: FaTags },
    { name: "Transfers", path: "/transfers", icon: FaExchangeAlt },
    { name: "Repairs", path: "/repairs", icon: FaTools },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 bg-gray-900 text-white shadow-lg z-50
        transform transition-all duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 flex flex-col
        ${sidebarCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        {!sidebarCollapsed && <h1 className="text-lg font-semibold tracking-wide">IT Assets</h1>}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded hover:bg-gray-700"
        >
          <FaBars />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`
              }
              onClick={() => setSidebarOpen(false)} // close mobile sidebar
            >
              <Icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
