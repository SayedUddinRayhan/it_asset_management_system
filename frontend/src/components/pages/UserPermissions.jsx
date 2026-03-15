// UserPermissions.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner, FaShieldAlt } from "react-icons/fa";

const ACTIONS = ["add", "edit", "view", "delete"];

function UserPermissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const [permissionsByModel, setPermissionsByModel] = useState({});
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Derived — never stored separately to avoid stale state
  const isSuperuser = userData?.is_superuser === true;

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const [allPermRes, userRes] = await Promise.all([
        axios.get(`${API}/auth/permissions/`, config),
        axios.get(`${API}/auth/users/${id}/`, config),
      ]);

      const allPermissions = Array.isArray(allPermRes.data)
        ? allPermRes.data
        : allPermRes.data.results || [];

      const userPermIds = (userRes.data.permissions || []).map((p) => p.id);
      setUserData(userRes.data);

      // Group all permissions by model → action
      const grouped = {};
      allPermissions.forEach((perm) => {
        const modelName = perm.content_type?.model || "unknown";
        if (!grouped[modelName]) {
          grouped[modelName] = { add: [], edit: [], view: [], delete: [] };
        }

        const actionMap = {
          add_: "add",
          change_: "edit",
          view_: "view",
          delete_: "delete",
        };

        for (const [prefix, action] of Object.entries(actionMap)) {
          if (perm.codename.startsWith(prefix)) {
            grouped[modelName][action].push({
              ...perm,
              assigned: userPermIds.includes(perm.id),
            });
            break;
          }
        }
      });

      setPermissionsByModel(grouped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [id]);

  // ── Toggle helpers ───────────────────────────────────────────────────────────

  const togglePermission = (model, action, permId) => {
    if (isSuperuser) return;
    setPermissionsByModel((prev) => ({
      ...prev,
      [model]: {
        ...prev[model],
        [action]: prev[model][action].map((p) =>
          p.id === permId ? { ...p, assigned: !p.assigned } : p
        ),
      },
    }));
  };

  const toggleAllForModel = (model) => {
    if (isSuperuser) return;
    setPermissionsByModel((prev) => {
      const actions = prev[model];
      // If everything is already assigned, clear; otherwise assign all
      const allAssigned = Object.values(actions).every((arr) =>
        arr.every((p) => p.assigned)
      );
      const newActions = {};
      Object.keys(actions).forEach((action) => {
        newActions[action] = actions[action].map((p) => ({
          ...p,
          assigned: !allAssigned,
        }));
      });
      return { ...prev, [model]: newActions };
    });
  };

  const toggleAllPermissions = () => {
    if (isSuperuser) return;
    setPermissionsByModel((prev) => {
      const allAssigned = Object.values(prev).every((actions) =>
        Object.values(actions).every((arr) => arr.every((p) => p.assigned))
      );
      const newState = {};
      Object.keys(prev).forEach((model) => {
        const newActions = {};
        Object.keys(prev[model]).forEach((action) => {
          newActions[action] = prev[model][action].map((p) => ({
            ...p,
            assigned: !allAssigned,
          }));
        });
        newState[model] = newActions;
      });
      return newState;
    });
  };

  // ── Derived state ────────────────────────────────────────────────────────────

  const allSelected = Object.values(permissionsByModel).every((actions) =>
    Object.values(actions).every((arr) => arr.every((p) => p.assigned))
  );

  const isModelFullySelected = (model) =>
    Object.values(permissionsByModel[model] || {}).every((arr) =>
      arr.length > 0 && arr.every((p) => p.assigned)
    );

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (isSuperuser) return;
    setSaving(true);
    try {
      const selectedIds = [];
      Object.values(permissionsByModel).forEach((actions) => {
        Object.values(actions).forEach((arr) => {
          arr.forEach((p) => { if (p.assigned) selectedIds.push(p.id); });
        });
      });

      await axios.post(
        `${API}/auth/users/${id}/set-permissions/`,
        { permissions: selectedIds },
        config
      );
      toast.success("Permissions updated successfully.");
      navigate("/users");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to save permissions.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <FaSpinner className="animate-spin text-indigo-600" />
          Loading permissions...
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {userData?.first_name} {userData?.last_name}
          </h2>
          <p className="text-sm text-gray-500">{userData?.phone}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/users")}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            Cancel
          </button>
          {/* Save is hidden for superusers — nothing to change */}
          {!isSuperuser && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <FaSpinner className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* Superuser banner */}
      {isSuperuser && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 text-sm">
          <FaShieldAlt className="text-indigo-500 mt-0.5 flex-shrink-0" />
          <span>
            <strong>{userData?.first_name} {userData?.last_name}</strong> is a
            superuser and has all permissions by default. Individual permissions
            cannot be edited.
          </span>
        </div>
      )}

      {/* Global Select All — hidden for superusers */}
      {!isSuperuser && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={toggleAllPermissions}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {allSelected ? "◉ Deselect All" : "○ Select All"}
          </button>
        </div>
      )}

      {/* Permissions table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {ACTIONS.map((action) => (
                <th
                  key={action}
                  className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.entries(permissionsByModel).map(([model, actions], modelIndex) => {
              const hasPerms = Object.values(actions).some((arr) => arr.length > 0);
              if (!hasPerms) return null;

              return (
                <tr
                  key={model}
                  className={modelIndex > 0 ? "border-t-2 border-gray-100" : ""}
                >
                  {ACTIONS.map((action) => (
                    <td key={action} className="px-5 py-4 align-top">

                      {/* Model label + per-model toggle — first column only */}
                      {action === "add" && (
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-700 capitalize bg-gray-100 px-2 py-0.5 rounded">
                            {model.replace(/_/g, " ")}
                          </span>
                          {!isSuperuser && (
                            <button
                              onClick={() => toggleAllForModel(model)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex-shrink-0"
                            >
                              {isModelFullySelected(model) ? "clear" : "all"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Checkboxes */}
                      <div className="space-y-1.5">
                        {actions[action].map((perm) => (
                          <label
                            key={perm.id}
                            title={perm.codename}
                            className={`flex items-center gap-2 group ${
                              isSuperuser
                                ? "cursor-not-allowed opacity-70"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              // Superusers: always checked and locked
                              checked={isSuperuser ? true : perm.assigned}
                              disabled={isSuperuser}
                              onChange={() =>
                                togglePermission(model, action, perm.id)
                              }
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition disabled:cursor-not-allowed"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition leading-tight">
                              {perm.name}
                            </span>
                          </label>
                        ))}
                        {actions[action].length === 0 && (
                          <span className="text-xs text-gray-400 italic">
                            none
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        {isSuperuser
          ? "Superusers have all permissions by default — no changes can be made here."
          : "Check to grant • Uncheck to revoke • Changes apply after saving"}
      </p>
    </div>
  );
}

export default UserPermissions;
