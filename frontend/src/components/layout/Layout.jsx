import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300
          ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >
        {/* Navbar */}
        <Navbar onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 p-4 bg-gray-100">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
