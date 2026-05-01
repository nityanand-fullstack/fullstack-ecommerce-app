import api from "./axios.js";

export const listCategoriesApi = (params = {}) =>
  api.get("/categories", { params }).then((r) => r.data);

export const getCategoryBySlugApi = (slug) =>
  api.get(`/categories/${slug}`).then((r) => r.data);

export const createCategoryApi = (payload) =>
  api.post("/categories", payload).then((r) => r.data);

export const updateCategoryApi = (id, payload) =>
  api.put(`/categories/${id}`, payload).then((r) => r.data);

export const deleteCategoryApi = (id) =>
  api.delete(`/categories/${id}`).then((r) => r.data);
