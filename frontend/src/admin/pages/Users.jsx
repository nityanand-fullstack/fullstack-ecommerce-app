import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  listUsersApi,
  updateUserRoleApi,
  deleteUserApi,
} from "../../api/adminApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listUsersApi();
      setUsers(res.data?.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    return users.filter((u) => {
      const matchesQ =
        !query ||
        u.name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesQ && matchesRole;
    });
  }, [users, query, roleFilter]);

  const handleRoleChange = async (u, newRole) => {
    if (u.role === newRole) return;
    setRoleUpdating(u._id);
    try {
      await updateUserRoleApi(u._id, newRole);
      toast.success(`Role updated to ${newRole}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Role update failed");
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm.user) return;
    setDeleting(true);
    try {
      await deleteUserApi(confirm.user._id);
      toast.success("User deleted");
      setConfirm({ open: false, user: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="input pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader label="Loading users..." />
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {users.length === 0
              ? "No users registered yet."
              : "No users match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">User</th>
                  <th className="text-left font-semibold px-6 py-3">Role</th>
                  <th className="text-left font-semibold px-6 py-3">Verified</th>
                  <th className="text-left font-semibold px-6 py-3">Joined</th>
                  <th className="text-right font-semibold px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 grid place-items-center rounded-full bg-brand-100 text-brand-600 font-semibold">
                            {(u.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 flex items-center gap-2">
                              {u.name}
                              {isSelf && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 ring-1 ring-brand-200 rounded-full px-2 py-0.5">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          disabled={isSelf || roleUpdating === u._id}
                          className={`text-xs font-medium rounded-full px-3 py-1 ring-1 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                            u.role === "admin"
                              ? "bg-brand-50 text-brand-700 ring-brand-200"
                              : "bg-slate-50 text-slate-700 ring-slate-200"
                          }`}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setConfirm({ open: true, user: u })}
                          disabled={isSelf}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                          title={isSelf ? "You cannot delete your own account" : ""}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Delete this user?"
        message={
          confirm.user
            ? `"${confirm.user.name}" (${confirm.user.email}) will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, user: null })}
      />
    </div>
  );
}
