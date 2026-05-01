import api from "./axios.js";

export const registerApi = (payload) =>
  api.post("/auth/register", payload).then((r) => r.data);

export const loginApi = (payload) =>
  api.post("/auth/login", payload).then((r) => r.data);

export const getProfileApi = () =>
  api.get("/auth/profile").then((r) => r.data);

export const updateProfileApi = (payload) =>
  api.put("/auth/profile", payload).then((r) => r.data);

export const changePasswordApi = (payload) =>
  api.put("/auth/change-password", payload).then((r) => r.data);
