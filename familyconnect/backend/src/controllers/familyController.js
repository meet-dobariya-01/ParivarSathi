import { createHttpError } from "../middleware/error.js";
import {
  addFamilyMemberService,
  createFamilyService,
  deleteFamilyMemberService,
  getFamilyByIdService,
  getFamilyMembersService,
  getMyFamilyService,
  updateFamilyMemberService,
  updateFamilyService,
} from "../services/family.service.js";
import {
  addMemberSchema,
  createFamilySchema,
  updateFamilyMemberSchema,
  updateFamilySchema,
} from "../schemas/family.schema.js";

const getUserPersonId = (user) => {
  if (!user?.personId) return null;
  return user.personId._id ? user.personId._id.toString() : user.personId.toString();
};

const ensureOwnerOrOfficer = (req, family) => {
  const userPersonId = getUserPersonId(req.user);
  const familyHeadId = family.familyHeadPersonId?._id ? family.familyHeadPersonId._id.toString() : family.familyHeadPersonId;

  if (req.user.role === "OFFICER") return true;
  if (userPersonId && familyHeadId && userPersonId === familyHeadId) return true;

  return false;
};

export const createFamily = async (req, res, next) => {
  try {
    const parsed = createFamilySchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createHttpError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.issues));
    }

    const family = await createFamilyService(req.user, parsed.data);
    return res.status(201).json(family);
  } catch (error) {
    return next(error);
  }
};

export const getMyFamily = async (req, res, next) => {
  try {
    const family = await getMyFamilyService(getUserPersonId(req.user));
    return res.json(family);
  } catch (error) {
    return next(error);
  }
};

export const getFamilyById = async (req, res, next) => {
  try {
    const family = await getFamilyByIdService(req.params.familyId);

    if (!ensureOwnerOrOfficer(req, family)) {
      return next(createHttpError(403, "You are not allowed to view this family", "FORBIDDEN"));
    }

    return res.json(family);
  } catch (error) {
    return next(error);
  }
};

export const updateFamily = async (req, res, next) => {
  try {
    const parsed = updateFamilySchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createHttpError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.issues));
    }

    const family = await getFamilyByIdService(req.params.familyId);
    if (!ensureOwnerOrOfficer(req, family)) {
      return next(createHttpError(403, "Only the family owner can update this family", "FORBIDDEN"));
    }

    const updatedFamily = await updateFamilyService(req.params.familyId, parsed.data);
    return res.json(updatedFamily);
  } catch (error) {
    return next(error);
  }
};

export const addFamilyMember = async (req, res, next) => {
  try {
    const parsed = addMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createHttpError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.issues));
    }

    const family = await getFamilyByIdService(req.params.familyId);
    if (!ensureOwnerOrOfficer(req, family)) {
      return next(createHttpError(403, "Only the family owner can add members", "FORBIDDEN"));
    }

    const result = await addFamilyMemberService({
      familyId: req.params.familyId,
      userPersonId: getUserPersonId(req.user),
      memberData: parsed.data,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getFamilyMembers = async (req, res, next) => {
  try {
    const family = await getFamilyByIdService(req.params.familyId);
    if (!ensureOwnerOrOfficer(req, family)) {
      return next(createHttpError(403, "You are not allowed to view members for this family", "FORBIDDEN"));
    }

    const members = await getFamilyMembersService(req.params.familyId);
    return res.json(members);
  } catch (error) {
    return next(error);
  }
};

export const updateFamilyMember = async (req, res, next) => {
  try {
    const parsed = updateFamilyMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createHttpError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.issues));
    }

    const family = await getFamilyByIdService(req.params.familyId);
    if (!ensureOwnerOrOfficer(req, family)) {
      return next(createHttpError(403, "Only the family owner can update members", "FORBIDDEN"));
    }

    const updatedMember = await updateFamilyMemberService({
      familyId: req.params.familyId,
      memberId: req.params.memberId,
      userPersonId: getUserPersonId(req.user),
      updates: parsed.data,
    });

    return res.json(updatedMember);
  } catch (error) {
    return next(error);
  }
};

export const deleteFamilyMember = async (req, res, next) => {
  try {
    const family = await getFamilyByIdService(req.params.familyId);
    if (!ensureOwnerOrOfficer(req, family)) {
      return next(createHttpError(403, "Only the family owner can remove members", "FORBIDDEN"));
    }

    const deletedMember = await deleteFamilyMemberService({
      familyId: req.params.familyId,
      memberId: req.params.memberId,
      userPersonId: getUserPersonId(req.user),
    });

    return res.json(deletedMember);
  } catch (error) {
    return next(error);
  }
};
