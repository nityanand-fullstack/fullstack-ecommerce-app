import api from "./axios.js";

export const placeOrderApi = (payload) =>
  api.post("/orders", payload).then((r) => r.data);

export const myOrdersApi = () =>
  api.get("/orders/me").then((r) => r.data);

export const getOrderApi = (id) =>
  api.get(`/orders/${id}`).then((r) => r.data);

export const payOrderApi = (id) =>
  api.put(`/orders/${id}/pay`).then((r) => r.data);

export const initRazorpayApi = () =>
  api.post("/orders/razorpay/init").then((r) => r.data);

export const verifyRazorpayApi = (payload) =>
  api.post("/orders/razorpay/verify", payload).then((r) => r.data);
