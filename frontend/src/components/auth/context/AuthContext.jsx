import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../service/authService";

const AuthContext = createContext();

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize user on app load
  const initUser = async () => {
    setIsAuthLoading(true);
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Failed to fetch current user:", err.message);
        setUser(null);
        authService.logout();
      }
    }
    setIsAuthLoading(false);
  };

  useEffect(() => {
    initUser();
  }, []);

  // Register user
  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      setAuthError(err.message || "Registration failed");
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    setAuthError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      setAuthError(err.message || "Login failed");
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        authError,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};