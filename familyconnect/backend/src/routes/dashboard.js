import express from "express";

import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  getApplicationsByScheme,
  getApplicationsByStatus,
  getDashboardSummary,
  getFamiliesByDistrict,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("OFFICER"));

router.get("/summary", getDashboardSummary);
router.get("/applications-by-scheme", getApplicationsByScheme);
router.get("/applications-by-status", getApplicationsByStatus);
router.get("/families-by-district", getFamiliesByDistrict);

export default router;
