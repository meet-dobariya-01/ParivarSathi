import express from "express";

import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  addFamilyMember,
  createFamily,
  deleteFamilyMember,
  getFamilyById,
  getFamilyMembers,
  getMyFamily,
  updateFamily,
  updateFamilyMember,
} from "../controllers/familyController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole("CITIZEN"), createFamily);
router.get("/me", requireRole("CITIZEN"), getMyFamily);
router.get("/:familyId", getFamilyById);
router.put("/:familyId", requireRole("CITIZEN"), updateFamily);
router.post("/:familyId/members", requireRole("CITIZEN"), addFamilyMember);
router.get("/:familyId/members", getFamilyMembers);
router.put("/:familyId/members/:memberId", requireRole("CITIZEN"), updateFamilyMember);
router.delete("/:familyId/members/:memberId", requireRole("CITIZEN"), deleteFamilyMember);

export default router;
