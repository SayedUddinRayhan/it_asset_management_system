import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    phone: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Frontend validation
  const validate = () => {
    const newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await register(formData); // Calls your API via context

      toast.success("Registration successful!");

      // Redirect to login after short delay
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      // Show error from server if exists
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.phone ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-500"
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* First Name */}
          <div>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.first_name ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-500"
              }`}
            />
            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
          </div>

          {/* Last Name */}
          <div>
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.last_name ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-500"
              }`}
            />
            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-500"
              }`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}