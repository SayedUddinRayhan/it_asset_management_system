import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

import { FaSpinner } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const { login, authError, isAuthLoading } = useAuth();

  const [credentials, setCredentials] = useState({
    phone: "",
    password: "",
  });
  const [formError, setFormError] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // validation
    if (!credentials.phone || !credentials.password) {
      setFormError("Phone and password are required.");
      return;
    }

    try {
      await login(credentials);
      navigate("/", { state: { loginSuccess: true } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {formError && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {formError}
          </div>
        )}

        {authError && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              placeholder="Enter your phone"
              value={credentials.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
              type="submit"
              disabled={isAuthLoading}
              className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                isAuthLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {isAuthLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-500">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;