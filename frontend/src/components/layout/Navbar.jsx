import { useRef, useState, useEffect } from "react";
import { FaRegUserCircle, FaCog, FaPowerOff, FaSearch } from "react-icons/fa";
import { HiChevronDown, HiOutlineMenu } from "react-icons/hi";
import { useNavigate } from "react-router-dom";


function Navbar({ onMobileMenuToggle }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const profileRef = useRef();
  const navigate = useNavigate();


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2); // last 2 digits

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 to 12

    return `${dayName}, ${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  };


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
    <nav className="bg-white shadow-md px-4 py-3 flex items-center justify-between relative w-full">

      {/* Left: Mobile Menu + Logo */}
      <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-[1_1_auto]">
        <button
          className="lg:hidden p-2 rounded hover:bg-gray-200 flex-shrink-0"
          onClick={onMobileMenuToggle}
        >
          <HiOutlineMenu className="w-6 h-6 text-gray-700" />
        </button>

        <span className="text-gray-500 font-semibold truncate text-sm sm:text-base md:text-lg lg:text-lg">
          {formatDateTime(currentTime)}
        </span>
      </div>

      {/* Right: Search + Profile */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">

        {/* Desktop & Tablet Search */}
        <div className="hidden sm:flex gap-2 items-center max-w-full lg:max-w-sm flex-shrink">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 truncate"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={() => navigate("/search")}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex-shrink-0"
          >
            Search
          </button>
        </div>

        {/* Mobile Search Icon */}
        <button
          className="sm:hidden flex-shrink-0 p-2 rounded hover:bg-gray-200"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
        >
          <FaSearch className="w-5 h-5 text-gray-700" />
        </button>

        {/* Profile */}
        <div className="relative ml-2" ref={profileRef}>
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

      {mobileSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white px-4 py-2 shadow-md z-40 sm:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      )}
    </nav>

  );
}

export default Navbar;
