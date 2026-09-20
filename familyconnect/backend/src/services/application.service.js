import Application from "../models/Application.js";
import Family from "../models/Family.js";
import FamilyMembership from "../models/FamilyMembership.js";
import Scheme from "../models/Scheme.js";
import { createHttpError } from "../middleware/error.js";
import { generateApplicationId } from "../utils/applicationId.js";
import { evaluateSchemeForFamily } from "./eligibilityService.js";

const getUserPersonId = (user) => {
  if (!user?.personId) return null;
  return user.personId._id ? user.personId._id.toString() : user.personId.toString();
};

const populateApplication = (application) =>
  Application.findById(application._id)
    .populate("schemeId")
    .populate("familyId")
    .populate("applicantPersonId")
    .populate("reviewedBy");

const getCitizenFamilyMembership = async (personId) =>
  FamilyMembership.findOne({ personId, status: "ACTIVE" }).populate("familyId");

export const createApplicationService = async ({ user, schemeId, applicantPersonId }) => {
  const userPersonId = getUserPersonId(user);
  if (!userPersonId) {
    throw createHttpError(400, "Citizen profile is missing a linked person", "PERSON_REQUIRED");
  }

  const familyMembership = await getCitizenFamilyMembership(userPersonId);
  if (!familyMembership || !familyMembership.familyId) {
    throw createHttpError(404, "No active family found for this citizen", "FAMILY_NOT_FOUND");
  }

  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw createHttpError(404, "Scheme not found", "SCHEME_NOT_FOUND");
  }

  const targetPersonId = applicantPersonId || userPersonId;
  const applicantMembership = await FamilyMembership.findOne({
    familyId: familyMembership.familyId._id,
    personId: targetPersonId,
    status: "ACTIVE",
  });

  if (!applicantMembership) {
    throw createHttpError(400, "Applicant is not an active member of this family", "INVALID_APPLICANT");
  }

  const eligibility = await evaluateSchemeForFamily(familyMembership.familyId.familyId, scheme._id.toString());
  if (!eligibility.eligible) {
    throw createHttpError(
      400,
      "This family is not eligible for the selected scheme",
      "APPLICATION_NOT_ELIGIBLE",
      eligibility.failed_rules || []
    );
  }

  const duplicate = await Application.findOne({
    familyId: familyMembership.familyId._id,
    schemeId: scheme._id,
    status: { $in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
  });

  if (duplicate) {
    throw createHttpError(409, "A pending or active application already exists for this family and scheme", "APPLICATION_DUPLICATE");
  }

  let applicationId = generateApplicationId();
  let attempt = 0;
  while (attempt < 5 && (await Application.findOne({ applicationId }))) {
    applicationId = generateApplicationId();
    attempt += 1;
  }

  const application = await Application.create({
    applicationId,
    familyId: familyMembership.familyId._id,
    schemeId: scheme._id,
    applicantPersonId: targetPersonId,
    status: "SUBMITTED",
    submittedAt: new Date(),
    eligibilityResult: eligibility,
    remarks: "",
  });

  return populateApplication(application);
};

export const getMyApplicationsService = async (user) => {
  const userPersonId = getUserPersonId(user);
  const membership = await getCitizenFamilyMembership(userPersonId);
  if (!membership || !membership.familyId) return [];

  return Application.find({ familyId: membership.familyId._id })
    .populate("schemeId")
    .populate("applicantPersonId")
    .sort({ submittedAt: -1 });
};

export const getApplicationByIdService = async (applicationId) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(applicationId);
  const query = isObjectId ? { $or: [{ applicationId }, { _id: applicationId }] } : { applicationId };
  const application = await Application.findOne(query)
    .populate("schemeId")
    .populate("familyId")
    .populate("applicantPersonId")
    .populate("reviewedBy");

  if (!application) {
    throw createHttpError(404, "Application not found", "APPLICATION_NOT_FOUND");
  }

  return application;
};

export const listApplicationsService = async ({ status, schemeId, search, page = 1, limit = 20 }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = {};

  if (status) filter.status = status;
  if (schemeId) filter.schemeId = schemeId;

  if (search && String(search).trim()) {
    const searchValue = String(search).trim();
    const applicationIdMatch = { applicationId: { $regex: searchValue, $options: "i" } };

    const matchingFamilies = await Family.find({ familyId: { $regex: searchValue, $options: "i" } }).select("_id");
    const familyIds = matchingFamilies.map((family) => family._id);

    const conditions = [applicationIdMatch];
    if (familyIds.length > 0) {
      conditions.push({ familyId: { $in: familyIds } });
    }

    filter.$or = conditions;
  }

  const total = await Application.countDocuments(filter);
  const items = await Application.find(filter)
    .populate("schemeId")
    .populate("familyId")
    .populate("applicantPersonId")
    .populate("reviewedBy")
    .sort({ submittedAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);

  return { items, total, page: safePage, limit: safeLimit };
};

export const updateApplicationStatusService = async ({ applicationId, status, remarks, reviewedBy }) => {
  const application = await Application.findOne({ applicationId });
  if (!application) {
    throw createHttpError(404, "Application not found", "APPLICATION_NOT_FOUND");
  }

  const allowedTransitions = {
    SUBMITTED: ["UNDER_REVIEW", "APPROVED", "REJECTED"],
    UNDER_REVIEW: ["APPROVED", "REJECTED"],
    APPROVED: [],
    REJECTED: [],
  };

  if (!allowedTransitions[application.status]?.includes(status)) {
    throw createHttpError(
      400,
      `Invalid status transition from ${application.status} to ${status}`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  if (status === "REJECTED") {
    const trimmedRemarks = typeof remarks === "string" ? remarks.trim() : "";
    if (!trimmedRemarks) {
      throw createHttpError(400, "Remarks are required when rejecting an application", "REJECTION_REMARKS_REQUIRED");
    }
    application.remarks = trimmedRemarks;
  } else if (remarks !== undefined && String(remarks).trim()) {
    application.remarks = String(remarks).trim();
  }

  application.status = status;
  application.reviewedAt = new Date();
  application.reviewedBy = reviewedBy;
  await application.save();

  return populateApplication(application);
};
