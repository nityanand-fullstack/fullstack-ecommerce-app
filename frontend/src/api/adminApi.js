import api from "./axios.js";

export const getAdminStatsApi = (refresh = false) =>
  api
    .get("/admin/stats", refresh ? { params: { refresh: "true" } } : undefined)
    .then((r) => r.data);

export const listUsersApi = (params = {}) =>
  api.get("/admin/users", { params }).then((r) => r.data);

export const updateUserRoleApi = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role }).then((r) => r.data);

export const deleteUserApi = (id) =>
  api.delete(`/admin/users/${id}`).then((r) => r.data);

export const listAllOrdersApi = (params = {}) =>
  api.get("/admin/orders", { params }).then((r) => r.data);

export const updateOrderStatusApi = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { status }).then((r) => r.data);
