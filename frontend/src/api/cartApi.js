import api from "./axios.js";

export const getCartApi = () =>
  api.get("/cart").then((r) => r.data);

export const addToCartApi = (productId, qty = 1) =>
  api.post("/cart", { productId, qty }).then((r) => r.data);

export const updateCartItemApi = (productId, qty) =>
  api.put(`/cart/${productId}`, { qty }).then((r) => r.data);

export const removeCartItemApi = (productId) =>
  api.delete(`/cart/${productId}`).then((r) => r.data);

export const clearCartApi = () =>
  api.delete("/cart").then((r) => r.data);
