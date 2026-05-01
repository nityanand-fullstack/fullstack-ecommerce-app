import multer from "multer";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"));
};

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});
