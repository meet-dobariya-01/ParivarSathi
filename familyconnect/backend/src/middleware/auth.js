import jwt from "jsonwebtoken";

import { ENV } from "../config/env.js";
import User from "../models/User.js";
import { createHttpError } from "./error.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Authentication required", "AUTH_REQUIRED");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET_KEY);
    const user = await User.findById(decoded.sub).populate("personId");

    if (!user) {
      throw createHttpError(401, "User not found", "USER_NOT_FOUND");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(createHttpError(401, "Invalid or expired token", "INVALID_TOKEN"));
    }

    return next(error);
  }
};
