export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      error: {
        message: `Role ${req.user?.role || "UNKNOWN"} is not authorized`,
        code: "FORBIDDEN",
      },
    });
  }

  return next();
};
