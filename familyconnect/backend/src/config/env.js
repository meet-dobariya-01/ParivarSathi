import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of envCandidates) {
  dotenv.config({ path: envPath });
}

export const ENV = {
  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/familyconnect",
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development",
};
