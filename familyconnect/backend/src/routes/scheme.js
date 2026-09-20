import express from "express";

import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  createScheme,
  getScheme,
  listSchemes,
  removeSchemeRule,
  toggleScheme,
  updateScheme,
} from "../controllers/schemeController.js";

const router = express.Router();

// Public routes
router.get("/", listSchemes);
router.get("/:schemeId", getScheme);

// Protected routes (Officer only)
router.use(requireAuth);
router.post("/", requireRole("OFFICER"), createScheme);
router.put("/:schemeId", requireRole("OFFICER"), updateScheme);
router.patch("/:schemeId/toggle", requireRole("OFFICER"), toggleScheme);
router.delete("/:schemeId/rules/:ruleId", requireRole("OFFICER"), removeSchemeRule);

export default router;
