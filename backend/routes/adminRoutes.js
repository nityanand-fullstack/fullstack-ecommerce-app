import express from "express";
import {
  listUsers,
  updateUserRole,
  deleteUser,
  getStats,
  listAllOrders,
  updateOrderStatus,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getStats);

router.get("/users", listUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/orders", listAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

export default router;
