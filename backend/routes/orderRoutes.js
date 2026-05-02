import express from "express";
import {
  placeOrder,
  myOrders,
  getOrder,
  payOrder,
  initRazorpay,
  verifyRazorpay,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", placeOrder);
router.get("/me", myOrders);
router.post("/razorpay/init", initRazorpay);
router.post("/razorpay/verify", verifyRazorpay);
router.get("/:id", getOrder);
router.put("/:id/pay", payOrder);

export default router;
