// authService.js
import axios from "axios";
import { savePermissions } from "../../hooks/usePermissions";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEY   = "access_token";
const REFRESH_KEY = "refresh_token";

/** Set or clear the Authorization header on every future axios request. */
const setAxiosAuth = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const authService = {

  async login({ phone, password }) {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login/`, { phone, password });
      const { tokens, user } = res.data;

      // 1. Persist tokens
      localStorage.setItem(TOKEN_KEY,   tokens.access);
      localStorage.setItem(REFRESH_KEY, tokens.refresh);

      // 2. Set axios default — all subsequent requests are authenticated
      setAxiosAuth(tokens.access);

      // 3. Persist permissions for menu guards
      savePermissions(user.permissions || [], user.is_superuser ?? false);

      return { user, access: tokens.access, refresh: tokens.refresh };
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(", ") ||
        "Login failed";
      throw new Error(message);
    }
  },

  async register({ phone, first_name, last_name, password }) {
    try {
      await axios.post(`${BASE_URL}/auth/register/`, {
        phone,
        first_name,
        last_name,
        password,
      });
      return this.login({ phone, password });
    } catch (err) {
      const backendErrors = err.response?.data;
      const message = backendErrors
        ? Object.values(backendErrors).flat().join(", ") ||
          backendErrors.detail ||
          "Registration failed"
        : "Registration failed";
      throw new Error(message);
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);

    // Clear axios default so no stale token is sent after logout
    setAxiosAuth(null);

    // Clear permission cache
    savePermissions(null);
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("No token found");

      // Restore axios default on page reload (before any other request fires)
      setAxiosAuth(token);

      const res = await axios.get(`${BASE_URL}/auth/me/`);
      const userData = res.data;

      // Refresh permission cache on every page reload
      savePermissions(userData.permissions || [], userData.is_superuser ?? false);

      return userData;
    } catch (err) {
      // Clear the bad token so the user lands on the login page
      setAxiosAuth(null);
      throw new Error("Failed to get user information");
    }
  },

  getToken()        { return localStorage.getItem(TOKEN_KEY); },
  getRefreshToken() { return localStorage.getItem(REFRESH_KEY); },
};

export default authService;