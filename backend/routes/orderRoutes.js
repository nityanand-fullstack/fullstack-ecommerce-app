import express from "express";
import {
  placeOrder,
  myOrders,
  getOrder,
  payOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", placeOrder);
router.get("/me", myOrders);
router.get("/:id", getOrder);
router.put("/:id/pay", payOrder);

export default router;
