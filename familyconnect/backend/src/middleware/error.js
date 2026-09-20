export const createHttpError = (statusCode, message, code, details) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    error: {
      message: err.message || "Internal Server Error",
    },
  };

  if (err.code) {
    payload.error.code = err.code;
  }

  if (err.details) {
    payload.error.details = err.details;
  }

  if (process.env.NODE_ENV === "development" && err.stack) {
    payload.error.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
};

export const notFound = (req, res, next) => {
  const error = createHttpError(404, `Not Found - ${req.originalUrl}`, "NOT_FOUND");
  return next(error);
};
