// middleware/error.js
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export const notFound = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};
