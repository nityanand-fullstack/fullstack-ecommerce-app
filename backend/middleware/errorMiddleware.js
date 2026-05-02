export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
  console.error(err);

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Internal Server Error";
  let errors;

  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = "Validation failed";
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large (max 5 MB)";
  }
  if (err.name === "MulterError") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
};
