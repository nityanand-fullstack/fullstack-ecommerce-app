import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const streamUpload = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// POST /api/upload  (single)  / POST /api/upload/multiple
export const uploadSingle = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Image upload is not configured. Set CLOUDINARY_* env vars.",
      });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }
    const folder = process.env.CLOUDINARY_FOLDER || "ecom-app";
    const result = await streamUpload(req.file.buffer, folder);
    return res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const uploadMultiple = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Image upload is not configured. Set CLOUDINARY_* env vars.",
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided" });
    }
    const folder = process.env.CLOUDINARY_FOLDER || "ecom-app";
    const results = await Promise.all(
      req.files.map((f) => streamUpload(f.buffer, folder))
    );
    return res.status(201).json({
      success: true,
      data: {
        images: results.map((r) => ({
          url: r.secure_url,
          publicId: r.public_id,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/upload/:publicId  — note: encode slashes (folder) as %2F in the URL
export const deleteUpload = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Image upload is not configured.",
      });
    }
    const publicId = decodeURIComponent(req.params.publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    return res.status(200).json({ success: true, data: { result } });
  } catch (err) {
    next(err);
  }
};
