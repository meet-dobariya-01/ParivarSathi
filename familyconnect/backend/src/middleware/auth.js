// middleware/auth.js
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password_hash").populate("person_id");
    if (!req.user || !req.user.is_active) {
      return res.status(401).json({ message: "Not authorized, user not found or inactive" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
