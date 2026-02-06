import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegUserCircle, FaCog, FaPowerOff, FaSearch } from "react-icons/fa";
import { HiChevronDown, HiOutlineMenu } from "react-icons/hi";

function Asset_Navbar() {
  const [openNav, setOpenNav] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <Link to="/" className="text-xl font-bold text-gray-800">
          IT Asset Management
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">

          {/* Links */}
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
            <Link to="/" className="text-gray-600 hover:text-blue-600">Products</Link>
            <Link to="/" className="text-gray-600 hover:text-blue-600">Vendors</Link>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <button
              onClick={() => navigate("/")} 
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-2 rounded-full border border-gray-300 px-2 py-1 hover:bg-gray-100"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                A
              </div>
              <HiChevronDown
                className={`w-4 h-4 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100">
                  <FaRegUserCircle /> My Profile
                </button>
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100">
                  <FaCog /> Settings
                </button>
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-100 text-red-500">
                  <FaPowerOff /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center">
          <button onClick={() => setOpenNav(!openNav)}>
            <HiOutlineMenu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {openNav && (
        <div className="lg:hidden mt-2 space-y-2 px-2 pb-2 border-t">
          <Link to="/" className="block py-2 px-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/" className="block py-2 px-2 rounded hover:bg-gray-100">Products</Link>
          <Link to="/" className="block py-2 px-2 rounded hover:bg-gray-100">Vendors</Link>

          {/* Mobile Search */}
          <div className="flex items-center gap-2 mt-2 w-full">
            <input
              type="text"
              placeholder="Search"
              className="flex-1 min-w-0 pl-3 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={() => navigate("/search")}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex-shrink-0"
            >
              Search
            </button>
          </div>

          {/* Mobile Profile */}
          <div className="relative lg:hidden" ref={profileRef}>
            <button
              className="flex items-center gap-2 rounded-full border border-gray-300 px-2 py-1 hover:bg-gray-100"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                A
              </div>
              <HiChevronDown
                className={`w-4 h-4 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute mt-2 bg-white border rounded-lg shadow-lg z-50 max-w-[192px] right-0 lg:right-0 left-2">
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100">
                  <FaRegUserCircle /> My Profile
                </button>
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100">
                  <FaCog /> Settings
                </button>
                <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-100 text-red-500">
                  <FaPowerOff /> Logout
                </button>
              </div>
            )}

          </div>

        </div>
      )}
    </nav>
  );
}

export default Asset_Navbar;
