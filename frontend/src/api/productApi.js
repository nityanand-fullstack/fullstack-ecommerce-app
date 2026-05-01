import api from "./axios.js";

export const listProductsApi = (params = {}) =>
  api.get("/products", { params }).then((r) => r.data);

export const getProductApi = (idOrSlug) =>
  api.get(`/products/${idOrSlug}`).then((r) => r.data);

export const createProductApi = (payload) =>
  api.post("/products", payload).then((r) => r.data);

export const updateProductApi = (id, payload) =>
  api.put(`/products/${id}`, payload).then((r) => r.data);

export const deleteProductApi = (id) =>
  api.delete(`/products/${id}`).then((r) => r.data);
