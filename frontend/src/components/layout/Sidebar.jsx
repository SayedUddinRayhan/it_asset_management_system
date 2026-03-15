// Sidebar.jsx
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt, FaStore, FaSitemap, FaTags,
  FaExchangeAlt, FaTools, FaBars, FaListAlt,
  FaChevronDown, FaClipboardCheck, FaWarehouse, FaUsers,
} from "react-icons/fa";
import { usePermissions } from "../hooks/usePermissions";

function Sidebar({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const { can, isSuperUser } = usePermissions();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: FaTachometerAlt,
      permission: null,
    },
    {
      name: "Products",
      path: "/products",
      icon: FaWarehouse,
      permission: "view_product",
    },
    {
      name: "Vendors",
      path: "/vendors",
      icon: FaStore,
      permission: "view_vendor",
    },
    {
      name: "Departments",
      path: "/departments",
      icon: FaSitemap,
      permission: "view_department",
    },
    {
      name: "Categories",
      path: "/categories",
      icon: FaTags,
      permission: "view_category",
    },
    {
      name: "Transfers",
      path: "/transfers",
      icon: FaExchangeAlt,
      permission: "view_transfer",
    },
    {
      name: "Repairs",
      path: "/repairs",
      icon: FaTools,
      permission: "view_repair",
    },
    {
      name: "Statuses",
      icon: FaListAlt,
      permission: null,
      submenu: [
        { name: "Add Status",    path: "/statuses/add",    permission: "add_status" },
        { name: "Change Status", path: "/statuses/change", permission: "change_status" },
      ],
    },
    {
      name: "Repair Statuses",
      path: "/repair-statuses",
      icon: FaClipboardCheck,
      permission: "view_repairstatus",
    },
    {
      name: "Users",
      path: "/users",
      icon: FaUsers,
      permission: "view_user",
    },
  ];

  /**
   * Visibility rules:
   * - Superusers always see every item.
   * - Items with permission: null are always visible (e.g. Dashboard).
   * - Submenu parents are visible if at least one child is visible.
   * - All others require the matching permission codename.
   */
  const isVisible = (item) => {
    if (isSuperUser()) return true;
    if (item.permission === null) {
      if (item.submenu) return item.submenu.some((sub) => can(sub.permission));
      return true;
    }
    return can(item.permission);
  };

  const visibleItems = menuItems.filter(isVisible);

  const isSubmenuActive = (submenu) =>
    submenu?.some((sub) => location.pathname.startsWith(sub.path));

  // Auto-open the submenu whose child matches the current path
  useEffect(() => {
    visibleItems.forEach((item, idx) => {
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
      {/* Logo + Collapse Toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        {!sidebarCollapsed && (
          <h1 className="text-lg font-semibold tracking-wide">IT Assets</h1>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item, idx) => {
          const Icon = item.icon;
          const hasSubmenu = !!item.submenu;
          const submenuActive = isSubmenuActive(item.submenu);
          const visibleSubItems =
            item.submenu?.filter((sub) => isSuperUser() || can(sub.permission)) ?? [];

          return (
            <div key={idx}>
              {hasSubmenu ? (
                <>
                  <button
                    onClick={() => {
                      if (sidebarCollapsed) setSidebarCollapsed(false);
                      setOpenMenu(openMenu === idx ? null : idx);
                    }}
                    className={`
                      flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg transition-all
                      ${openMenu === idx || submenuActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                      {!sidebarCollapsed && (
                        <span className="text-sm">{item.name}</span>
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <FaChevronDown
                        className={`w-3 h-3 transition-transform ${openMenu === idx ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {hasSubmenu && openMenu === idx && !sidebarCollapsed && (
                    <div className="ml-6 mt-1 flex flex-col space-y-1">
                      {visibleSubItems.map((sub, sIdx) => (
                        <NavLink
                          key={sIdx}
                          to={sub.path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `px-3 py-2 rounded-lg text-sm transition-all
                            ${isActive
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
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => {
                    setSidebarOpen(false);
                    setOpenMenu(null);
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                    ${isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                  {!sidebarCollapsed && (
                    <span className="text-sm">{item.name}</span>
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
