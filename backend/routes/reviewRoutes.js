import express from "express";
import {
  listProductReviews,
  createReview,
  checkEligibility,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

// Mounted as /api/products/:id/reviews
const productReviews = express.Router({ mergeParams: true });
productReviews.get("/", listProductReviews);
productReviews.get("/eligibility", protect, checkEligibility);
productReviews.post("/", protect, createReview);

// Mounted as /api/reviews
const reviews = express.Router();
reviews.delete("/:id", protect, deleteReview);

export { productReviews, reviews };
