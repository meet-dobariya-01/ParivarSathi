import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service.js";
import { createHttpError } from "../middleware/error.js";

export const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(
        createHttpError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.issues)
      );
    }

    const result = await registerUser(parsed.data);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(
        createHttpError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.issues)
      );
    }

    const result = await loginUser(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user._id);
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};
