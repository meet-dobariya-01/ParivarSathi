// services/application.service.js
import Application from "../models/Application.js";
import FamilyMembership from "../models/FamilyMembership.js";

export const applyService = async (userPersonId, { scheme_id, applicant_person_id, remarks }) => {
  const membership = await FamilyMembership.findOne({ person_id: userPersonId, status: "ACTIVE" });
  if (!membership) throw { statusCode: 400, message: "No active family found" };

  const applicantMembership = await FamilyMembership.findOne({ family_id: membership.family_id, person_id: applicant_person_id, status: "ACTIVE" });
  if (!applicantMembership) throw { statusCode: 403, message: "Applicant is not an active member of your family" };

  const existing = await Application.findOne({ scheme_id, applicant_person_id, status: { $in: ["DRAFT","SUBMITTED","UNDER_REVIEW","APPROVED"] } });
  if (existing) throw { statusCode: 400, message: `Application already active (${existing.status}) for this scheme and member` };

  const app = await Application.create({ family_id: membership.family_id, scheme_id, applicant_person_id, status: "SUBMITTED", remarks: remarks || "" });
  return Application.findById(app._id).populate("scheme_id", "name department benefit_description").populate("applicant_person_id", "name gender");
};

export const getMyApplicationsService = async (personId) => {
  const membership = await FamilyMembership.findOne({ person_id: personId, status: "ACTIVE" });
  if (!membership) return [];
  return Application.find({ family_id: membership.family_id })
    .populate("scheme_id", "name department benefit_description required_documents")
    .populate("applicant_person_id", "name gender occupation")
    .sort({ submitted_at: -1 });
};

export const getAllApplicationsService = async (filter = {}) =>
  Application.find(filter)
    .populate("scheme_id", "name department")
    .populate("applicant_person_id", "name gender mobile education occupation")
    .populate("family_id", "family_id district taluka village annual_income")
    .sort({ submitted_at: -1 });

export const reviewApplicationService = async (id, { status, remarks }) => {
  const app = await Application.findById(id);
  if (!app) throw { statusCode: 404, message: "Application not found" };
  app.status = status;
  if (remarks !== undefined) app.remarks = remarks;
  await app.save();
  return Application.findById(id).populate("scheme_id", "name department").populate("applicant_person_id", "name").populate("family_id", "family_id");
};
