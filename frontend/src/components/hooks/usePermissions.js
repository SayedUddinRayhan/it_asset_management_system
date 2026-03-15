// usePermissions.js
import { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY = "user_permissions";
const SUPERUSER_KEY = "is_superuser";
const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// Module-level cache — survives re-renders, cleared on logout
let _cache = null;

export function usePermissions() {
  const [permissions, setPermissions] = useState(() => {
    if (_cache) return _cache;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(permissions === null);

  useEffect(() => {
    if (permissions !== null) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    axios
      .get(`${API}/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const perms = res.data.permissions || [];
        const superuser = res.data.is_superuser ?? false;

        // Persist in cache and storage
        _cache = perms;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));

        // NOTE: is_superuser is stored for UI hints only.
        // All real access control must be enforced on the backend.
        localStorage.setItem(SUPERUSER_KEY, String(superuser));

        setPermissions(perms);
      })
      .catch(() => {
        // On error (e.g. expired token) treat as no permissions
        setPermissions([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  /** UI-only superuser check. Never use for real access control. */
  const isSuperUser = () =>
    localStorage.getItem(SUPERUSER_KEY) === "true";

  /**
   * Check if the current user has a given permission codename.
   * Superusers always return true (UI hint only — backend enforces independently).
   */
  const can = (codename) => {
    if (!permissions) return false;
    if (isSuperUser()) return true;
    return permissions.includes(codename);
  };

  /** Returns true only if ALL given codenames are permitted. */
  const canAll = (...codenames) => codenames.every(can);

  /** Returns true if ANY of the given codenames is permitted. */
  const canAny = (...codenames) => codenames.some(can);

  return { can, canAll, canAny, isSuperUser, permissions, isLoading };
}

/**
 * Persist permissions after login or clear them on logout.
 *
 * Usage:
 *   Login:  savePermissions(res.data.user.permissions, res.data.user.is_superuser)
 *   Logout: savePermissions(null)
 */
export function savePermissions(perms, isSuperuser = false) {
  _cache = perms;
  if (perms === null) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SUPERUSER_KEY);
  } else {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
      localStorage.setItem(SUPERUSER_KEY, String(isSuperuser));
    } catch (e) {
      console.error("Failed to persist permissions:", e);
    }
  }
}