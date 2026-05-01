import api from "./axios.js";

export const listProductReviewsApi = (productId) =>
  api.get(`/products/${productId}/reviews`).then((r) => r.data);

export const checkReviewEligibilityApi = (productId) =>
  api.get(`/products/${productId}/reviews/eligibility`).then((r) => r.data);

export const createReviewApi = (productId, payload) =>
  api.post(`/products/${productId}/reviews`, payload).then((r) => r.data);

export const deleteReviewApi = (reviewId) =>
  api.delete(`/reviews/${reviewId}`).then((r) => r.data);
