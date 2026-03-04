import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";

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

      const userPermIds = (userRes.data.permissions || []).map(p => p.id);
      setUserData(userRes.data);

      const grouped = {};
      allPermissions.forEach((perm) => {
        const modelName = perm.content_type?.model || "unknown";
        if (!grouped[modelName])
          grouped[modelName] = { add: [], edit: [], view: [], delete: [] };

        if (perm.codename.startsWith("add_"))
          grouped[modelName].add.push({ ...perm, assigned: userPermIds.includes(perm.id) });
        if (perm.codename.startsWith("change_"))
          grouped[modelName].edit.push({ ...perm, assigned: userPermIds.includes(perm.id) });
        if (perm.codename.startsWith("view_"))
          grouped[modelName].view.push({ ...perm, assigned: userPermIds.includes(perm.id) });
        if (perm.codename.startsWith("delete_"))
          grouped[modelName].delete.push({ ...perm, assigned: userPermIds.includes(perm.id) });
      });

      setPermissionsByModel(grouped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [id]);

  // ✅ FIXED: Proper immutable updates
  const togglePermission = (model, action, permId) => {
    setPermissionsByModel(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        [action]: prev[model][action].map(perm =>
          perm.id === permId 
            ? { ...perm, assigned: !perm.assigned } 
            : perm
        )
      }
    }));
  };

  const toggleAllForModel = (model) => {
    setPermissionsByModel(prev => {
      const actions = prev[model];
      const newActions = {};
      Object.keys(actions).forEach(action => {
        const allAssigned = actions[action].every(p => p.assigned);
        newActions[action] = actions[action].map(p => ({ 
          ...p, 
          assigned: !allAssigned 
        }));
      });
      return { ...prev, [model]: newActions };
    });
  };

  const toggleAllPermissions = () => {
    setPermissionsByModel(prev => {
      const allAssigned = Object.values(prev).every(actions =>
        Object.values(actions).every(arr => arr.every(p => p.assigned))
      );
      const newState = {};
      Object.keys(prev).forEach(model => {
        const newActions = {};
        Object.keys(prev[model]).forEach(action => {
          newActions[action] = prev[model][action].map(p => ({
            ...p,
            assigned: !allAssigned
          }));
        });
        newState[model] = newActions;
      });
      return newState;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const selectedIds = [];
      Object.values(permissionsByModel).forEach(actions => {
        Object.values(actions).forEach(arr => {
          arr.forEach(p => { if (p.assigned) selectedIds.push(p.id); });
        });
      });

      await axios.post(`${API}/auth/users/${id}/set-permissions/`, { permissions: selectedIds }, config);
      toast.success("Permissions updated successfully");
      navigate("/users");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {userData?.first_name} {userData?.last_name}
          </h2>
          <p className="text-sm text-gray-500">{userData?.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/users")}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving && <FaSpinner className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Global Select All */}
      <div className="mb-4 text-right">
        <button
          onClick={toggleAllPermissions}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {Object.values(permissionsByModel).every(actions =>
            Object.values(actions).every(arr => arr.every(p => p.assigned))
          ) ? "◉ Deselect All" : "○ Select All"}
        </button>
      </div>

      {/* 4-Column Permissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["add", "edit", "view", "delete"].map(action => (
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
              // Skip models with no permissions
              const hasPerms = Object.values(actions).some(arr => arr.length > 0);
              if (!hasPerms) return null;

              const allAssigned = Object.values(actions).every(arr => 
                arr.length > 0 && arr.every(p => p.assigned)
              );

              return (
                <tr key={model} className={modelIndex > 0 ? "border-t-2 border-gray-100" : ""}>
                  {["add", "edit", "view", "delete"].map(action => (
                    <td key={action} className="px-5 py-4 align-top">
                      {/* Model label only for first column, subtle */}
                      {action === "add" && (
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700 capitalize bg-gray-100 px-2 py-0.5 rounded">
                            {model.replace(/_/g, ' ')}
                          </span>
                          <button
                            onClick={() => toggleAllForModel(model)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            {allAssigned ? "clear" : "all"}
                          </button>
                        </div>
                      )}
                      
                      {/* Permission checkboxes with names */}
                      <div className="space-y-1.5">
                        {actions[action].map(perm => (
                          <label 
                            key={perm.id} 
                            className="flex items-center gap-2 cursor-pointer group"
                            title={perm.codename}
                          >
                            <input
                              type="checkbox"
                              checked={perm.assigned}
                              onChange={() => togglePermission(model, action, perm.id)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition cursor-pointer"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">
                              {perm.name}
                            </span>
                          </label>
                        ))}
                        {actions[action].length === 0 && (
                          <span className="text-xs text-gray-400 italic">none</span>
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

      {/* Helper Text */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Check permissions to grant access • Uncheck to revoke • Changes apply after saving
      </p>
      
    </div>
  );
}

export default UserPermissions;