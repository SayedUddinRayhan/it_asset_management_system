// UserPermissions.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner, FaShieldAlt, FaChevronDown, FaChevronRight } from "react-icons/fa";

// ── Menu-based grouping config ────────────────────────────────────────────────
// Maps sidebar menu labels → the Django model names that belong to that menu.
// Any model NOT listed here is treated as a system internal and hidden.
const MENU_GROUPS = [
  {
    label: "Products",
    icon: "📦",
    models: ["product", "productdocument"],
  },
  {
    label: "Categories",
    icon: "🏷️",
    models: ["category"],
  },
  {
    label: "Departments",
    icon: "🏢",
    models: ["department"],
  },
  {
    label: "Vendors",
    icon: "🤝",
    models: ["vendor"],
  },
  {
    label: "Repairs",
    icon: "🔧",
    models: ["repairlog", "repairstatus", "repairmovement"],
  },
  {
    label: "Transfers",
    icon: "🔁",
    models: ["transferlog"],
  },
  {
    label: "Statuses",
    icon: "🔘",
    models: ["status"],
  },
  {
    label: "Users",
    icon: "👥",
    models: ["user"],
  },
];

// Flat set of all allowed models for quick lookup
const ALLOWED_MODELS = new Set(MENU_GROUPS.flatMap((g) => g.models));

const ACTIONS = ["add", "edit", "view", "delete"];

const ACTION_LABELS = {
  add: "Add",
  edit: "Edit",
  view: "View",
  delete: "Delete",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isGroupFullySelected(group, permissionsByModel) {
  return group.models.every((model) => {
    const actions = permissionsByModel[model];
    if (!actions) return true; // no perms for this model → skip
    return Object.values(actions).every(
      (arr) => arr.length === 0 || arr.every((p) => p.assigned)
    );
  });
}

function countGroupSelected(group, permissionsByModel) {
  let selected = 0;
  let total = 0;
  group.models.forEach((model) => {
    const actions = permissionsByModel[model] || {};
    Object.values(actions).forEach((arr) => {
      arr.forEach((p) => {
        total++;
        if (p.assigned) selected++;
      });
    });
  });
  return { selected, total };
}

// ── Component ─────────────────────────────────────────────────────────────────

function UserPermissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const [permissionsByModel, setPermissionsByModel] = useState({});
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState({}); // { groupLabel: bool }

  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const isSuperuser = userData?.is_superuser === true;

  // ── Fetch ─────────────────────────────────────────────────────────────────

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

      const grouped = {};
      allPermissions.forEach((perm) => {
        const modelName = perm.content_type?.model || "unknown";

        // Skip system internals not in our allowed list
        if (!ALLOWED_MODELS.has(modelName)) return;

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

  // ── Toggle helpers ────────────────────────────────────────────────────────

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

  const toggleAllForGroup = (group) => {
    if (isSuperuser) return;
    const fullySelected = isGroupFullySelected(group, permissionsByModel);
    setPermissionsByModel((prev) => {
      const next = { ...prev };
      group.models.forEach((model) => {
        if (!next[model]) return;
        const newActions = {};
        Object.keys(next[model]).forEach((action) => {
          newActions[action] = next[model][action].map((p) => ({
            ...p,
            assigned: !fullySelected,
          }));
        });
        next[model] = newActions;
      });
      return next;
    });
  };

  const toggleAllPermissions = () => {
    if (isSuperuser) return;
    const allAssigned = MENU_GROUPS.every((g) =>
      isGroupFullySelected(g, permissionsByModel)
    );
    setPermissionsByModel((prev) => {
      const next = {};
      Object.keys(prev).forEach((model) => {
        const newActions = {};
        Object.keys(prev[model]).forEach((action) => {
          newActions[action] = prev[model][action].map((p) => ({
            ...p,
            assigned: !allAssigned,
          }));
        });
        next[model] = newActions;
      });
      return next;
    });
  };

  const toggleCollapse = (label) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const allSelected = MENU_GROUPS.every((g) =>
    isGroupFullySelected(g, permissionsByModel)
  );

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (isSuperuser) return;
    setSaving(true);
    try {
      const selectedIds = [];
      Object.values(permissionsByModel).forEach((actions) => {
        Object.values(actions).forEach((arr) => {
          arr.forEach((p) => {
            if (p.assigned) selectedIds.push(p.id);
          });
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
      toast.error(err.response?.data?.detail || "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto p-6">

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

      {/* Global select all */}
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

      {/* Menu groups */}
      <div className="space-y-3">
        {MENU_GROUPS.map((group) => {
          // Skip groups that have no permissions at all in the DB
          const hasAny = group.models.some((m) =>
            Object.values(permissionsByModel[m] || {}).some((arr) => arr.length > 0)
          );
          if (!hasAny) return null;

          const isOpen = !collapsed[group.label];
          const fullySelected = isGroupFullySelected(group, permissionsByModel);
          const { selected, total } = countGroupSelected(group, permissionsByModel);

          return (
            <div
              key={group.label}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Group header */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition select-none"
                onClick={() => toggleCollapse(group.label)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{group.icon}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {group.label}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                    {selected} / {total}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {!isSuperuser && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAllForGroup(group);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition"
                    >
                      {fullySelected ? "Clear all" : "Select all"}
                    </button>
                  )}
                  {isOpen ? (
                    <FaChevronDown className="text-gray-400 text-xs" />
                  ) : (
                    <FaChevronRight className="text-gray-400 text-xs" />
                  )}
                </div>
              </div>

              {/* Permission table */}
              {isOpen && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                          Module
                        </th>
                        {ACTIONS.map((action) => (
                          <th
                            key={action}
                            className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                          >
                            {ACTION_LABELS[action]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {group.models.map((model) => {
                        const actions = permissionsByModel[model];
                        if (!actions) return null;
                        const hasPerms = Object.values(actions).some(
                          (arr) => arr.length > 0
                        );
                        if (!hasPerms) return null;

                        return (
                          <tr key={model} className="hover:bg-gray-50 transition">
                            {/* Model name */}
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded">
                                {model.replace(/_/g, " ")}
                              </span>
                            </td>

                            {/* One cell per action */}
                            {ACTIONS.map((action) => (
                              <td
                                key={action}
                                className="px-4 py-3 text-center"
                              >
                                {actions[action]?.length > 0 ? (
                                  actions[action].map((perm) => (
                                    <label
                                      key={perm.id}
                                      className={`inline-flex items-center gap-2 ${
                                        isSuperuser
                                          ? "cursor-not-allowed opacity-70"
                                          : "cursor-pointer"
                                      }`}
                                      title={perm.name}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSuperuser ? true : perm.assigned}
                                        disabled={isSuperuser}
                                        onChange={() =>
                                          togglePermission(model, action, perm.id)
                                        }
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition disabled:cursor-not-allowed"
                                      />
                                    </label>
                                  ))
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-5 text-xs text-gray-400 text-center">
        {isSuperuser
          ? "Superusers have all permissions by default — no changes can be made here."
          : "Check to grant · Uncheck to revoke · Changes apply after saving"}
      </p>
    </div>
  );
}

export default UserPermissions;
