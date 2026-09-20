import express from "express";

import { requireAuth } from "../middleware/auth.js";
import { getFamilyEligibility, getFamilySchemeEligibility } from "../controllers/eligibilityController.js";

const router = express.Router();

router.use(requireAuth);
router.get("/family/:familyId", getFamilyEligibility);
router.get("/family/:familyId/scheme/:schemeId", getFamilySchemeEligibility);

export default router;
