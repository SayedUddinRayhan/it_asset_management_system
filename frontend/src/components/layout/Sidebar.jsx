import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaStore,
  FaSitemap,
  FaTags,
  FaExchangeAlt,
  FaTools,
  FaBars,
  FaListAlt,
  FaChevronDown,
  FaClipboardCheck,
  FaWarehouse,
} from "react-icons/fa";

function Sidebar({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: FaTachometerAlt },
    { name: "Products", path: "/products", icon: FaWarehouse },
    { name: "Vendors", path: "/vendors", icon: FaStore },
    { name: "Departments", path: "/departments", icon: FaSitemap },
    { name: "Categories", path: "/categories", icon: FaTags },
    { name: "Transfers", path: "/transfers", icon: FaExchangeAlt },
    { name: "Repairs", path: "/repairs", icon: FaTools },
    {
      name: "Statuses",
      icon: FaListAlt,
      submenu: [
        { name: "Add Status", path: "/statuses/add" },
        { name: "Change Status", path: "/statuses/change" },
      ],
    },
    { name: "Repair Statuses", path: "/repair-statuses", icon: FaClipboardCheck },
  ];

  const isSubmenuActive = (submenu) =>
    submenu?.some((sub) => location.pathname.startsWith(sub.path));

  useEffect(() => {
    menuItems.forEach((item, idx) => {
      if (item.submenu && isSubmenuActive(item.submenu)) {
        setOpenMenu(idx);
      }
    });
  }, [location.pathname]);

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

      {/* Menu */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const hasSubmenu = !!item.submenu;
          const submenuActive = isSubmenuActive(item.submenu);

          return (
            <div key={idx} className="relative">
              {hasSubmenu ? (
                <button
                  onClick={() => {
                    if (sidebarCollapsed) setSidebarCollapsed(false);
                    setOpenMenu(openMenu === idx ? null : idx);
                  }}
                  className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg transition-all
                    ${
                      openMenu === idx || submenuActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5" />}
                    {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <FaChevronDown
                      className={`transition-transform ${
                        openMenu === idx ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={() => {
                    setSidebarOpen(false);
                    setOpenMenu(null);
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                </NavLink>
              )}

              {/* Submenu */}
              {hasSubmenu && openMenu === idx && !sidebarCollapsed && (
                <div className="ml-6 mt-1 flex flex-col space-y-1">
                  {item.submenu.map((sub, sIdx) => (
                    <NavLink
                      key={sIdx}
                      to={sub.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-lg text-sm transition-all
                        ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                      }
                    >
                      {sub.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
