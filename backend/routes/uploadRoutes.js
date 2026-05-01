import express from "express";
import {
  uploadSingle,
  uploadMultiple,
  deleteUpload,
} from "../controllers/uploadController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadMemory } from "../middleware/upload.js";

const router = express.Router();

router.use(protect, adminOnly);

router.post("/", uploadMemory.single("image"), uploadSingle);
router.post("/multiple", uploadMemory.array("images", 8), uploadMultiple);
router.delete("/:publicId", deleteUpload);

export default router;
