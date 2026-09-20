import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import "./config/env.js";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.js";
import familyRouter from "./routes/family.js";
import schemeRouter from "./routes/scheme.js";
import eligibilityRouter from "./routes/eligibility.js";
import applicationRouter from "./routes/application.js";
import dashboardRouter from "./routes/dashboard.js";
import { errorHandler, notFound } from "./middleware/error.js";

import User from "./models/User.js";
import Person from "./models/Person.js";
import Family from "./models/Family.js";
import FamilyMembership from "./models/FamilyMembership.js";
import Scheme from "./models/Scheme.js";
import SchemeRule from "./models/SchemeRule.js";
import Application from "./models/Application.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/families", familyRouter);
app.use("/api/schemes", schemeRouter);
app.use("/api/eligibility", eligibilityRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

export { app, startServer };
