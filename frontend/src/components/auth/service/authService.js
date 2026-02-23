import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const authService = {
  // Login
  async login({ phone, password }) {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login/`, { phone, password });
      const { tokens, user } = res.data;

      // Save tokens
      localStorage.setItem(TOKEN_KEY, tokens.access);
      localStorage.setItem(REFRESH_KEY, tokens.refresh);

      return {
        user,
        access: tokens.access,
        refresh: tokens.refresh,
      };
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(", ") ||
        "Login failed";
      throw new Error(message);
    }
  },

  // Register
  async register({ phone, firstName, lastName, password }) {
    try {
      await axios.post(`${BASE_URL}/auth/register/`, {
        phone,
        first_name: firstName,
        last_name: lastName,
        password,
      });
      return this.login({ phone, password });
    } catch (err) {
      const backendErrors = err.response?.data;
      let message = "Registration failed";

      if (backendErrors) {
        message =
          Object.values(backendErrors).flat().join(", ") ||
          backendErrors.detail ||
          message;
      }

      throw new Error(message);
    }
  },

  // Logout
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  // Get current user
  async getCurrentUser() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("No token found");

      const res = await axios.get(`${BASE_URL}/auth/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      throw new Error("Failed to get user information");
    }
  },

  // Utility to get tokens
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  },
};

export default authService;