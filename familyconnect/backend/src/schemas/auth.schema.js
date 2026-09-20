// schemas/auth.schema.js
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  date_of_birth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  mobile: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  role: z.enum(["CITIZEN", "OFFICER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
