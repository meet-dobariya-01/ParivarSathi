// config/env.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || "familyconnect_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
  NODE_ENV: process.env.NODE_ENV || "development",
};
