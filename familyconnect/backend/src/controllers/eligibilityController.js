import { createHttpError } from "../middleware/error.js";
import Family from "../models/Family.js";
import FamilyMembership from "../models/FamilyMembership.js";
import { evaluateAllSchemesForFamily, evaluateSchemeForFamily } from "../services/eligibilityService.js";

const getUserPersonId = (user) => {
  if (!user?.personId) return null;
  return user.personId._id ? user.personId._id.toString() : user.personId.toString();
};

const isFamilyOwner = async (user, familyId) => {
  if (user.role === "OFFICER") return true;

  const family = await Family.findOne({ familyId });
  if (!family) return false;

  const userPersonId = getUserPersonId(user);
  if (!userPersonId) return false;

  const isHead = family.familyHeadPersonId?.toString?.() === userPersonId || family.familyHeadPersonId?._id?.toString?.() === userPersonId;
  if (isHead) return true;

  const membership = await FamilyMembership.findOne({ familyId: family._id, personId: userPersonId, status: "ACTIVE" });
  return Boolean(membership);
};

export const getFamilyEligibility = async (req, res, next) => {
  try {
    const family = await Family.findOne({ familyId: req.params.familyId }).populate("familyHeadPersonId");
    if (!family) {
      return next(createHttpError(404, "Family not found", "FAMILY_NOT_FOUND"));
    }

    const authorized = await isFamilyOwner(req.user, req.params.familyId);
    if (!authorized) {
      return next(createHttpError(403, "You are not allowed to view this family's eligibility", "FORBIDDEN"));
    }

    const result = await evaluateAllSchemesForFamily(req.params.familyId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const getFamilySchemeEligibility = async (req, res, next) => {
  try {
    const family = await Family.findOne({ familyId: req.params.familyId }).populate("familyHeadPersonId");
    if (!family) {
      return next(createHttpError(404, "Family not found", "FAMILY_NOT_FOUND"));
    }

    const authorized = await isFamilyOwner(req.user, req.params.familyId);
    if (!authorized) {
      return next(createHttpError(403, "You are not allowed to view this scheme eligibility", "FORBIDDEN"));
    }

    const result = await evaluateSchemeForFamily(req.params.familyId, req.params.schemeId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};
