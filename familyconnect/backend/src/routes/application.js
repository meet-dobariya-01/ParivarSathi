import express from "express";

import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  createApplication,
  getApplication,
  getMyApplications,
  listApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("CITIZEN"), createApplication);
router.get("/my", requireRole("CITIZEN"), getMyApplications);
router.get("/", requireRole("OFFICER"), listApplications);
router.get("/:applicationId", getApplication);
router.put("/:applicationId/status", requireRole("OFFICER"), updateApplicationStatus);

export default router;
