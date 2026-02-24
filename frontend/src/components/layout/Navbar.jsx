import { useRef, useState, useEffect } from "react";
import { FaRegUserCircle, FaCog, FaPowerOff } from "react-icons/fa";
import { HiChevronDown, HiOutlineMenu } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";

function Navbar({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const profileRef = useRef();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  const formatDateTime = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${dayName}, ${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 flex items-center justify-between relative">
      
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded hover:bg-gray-200"
          onClick={onMobileMenuToggle}
        >
          <HiOutlineMenu className="w-6 h-6 text-gray-700" />
        </button>

        <span className="text-gray-500 font-bold text-sm sm:text-base md:text-lg lg:text-xl">
          {formatDateTime(currentTime)}
        </span>
      </div>

      {/* Right Side - Profile */}
      <div className="relative" ref={profileRef}>
        <button
          className="flex items-center gap-2 rounded-full border border-gray-300 px-2 py-1 hover:bg-gray-100"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          {/* Avatar */}
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
            {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <HiChevronDown
            className={`w-4 h-4 transition-transform ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">

            {/* User Info */}
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500">{user?.phone}</p>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => {
                navigate("/");
                setProfileOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
            >
              <FaRegUserCircle /> My Profile
            </button>

            {/* Settings */}
            {/* <button
              onClick={() => {
                navigate("/settings");
                setProfileOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
            >
              <FaCog /> Settings
            </button> */}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-100 text-red-500"
            >
              <FaPowerOff /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;