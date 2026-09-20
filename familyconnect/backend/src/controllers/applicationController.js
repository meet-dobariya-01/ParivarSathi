import FamilyMembership from "../models/FamilyMembership.js";
import { createHttpError } from "../middleware/error.js";
import {
  createApplicationService,
  getApplicationByIdService,
  getMyApplicationsService,
  listApplicationsService,
  updateApplicationStatusService,
} from "../services/application.service.js";

const getUserPersonId = (user) => {
  if (!user?.personId) return null;
  return user.personId._id ? user.personId._id.toString() : user.personId.toString();
};

export const createApplication = async (req, res, next) => {
  try {
    const { schemeId, applicantPersonId } = req.body || {};

    if (!schemeId) {
      return next(createHttpError(400, "schemeId is required", "VALIDATION_ERROR"));
    }

    const application = await createApplicationService({
      user: req.user,
      schemeId,
      applicantPersonId,
    });

    return res.status(201).json(application);
  } catch (error) {
    return next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await getMyApplicationsService(req.user);
    return res.json(applications);
  } catch (error) {
    return next(error);
  }
};

export const getApplication = async (req, res, next) => {
  try {
    const application = await getApplicationByIdService(req.params.applicationId);

    if (req.user.role !== "OFFICER") {
      const userPersonId = getUserPersonId(req.user);
      const familyId = application.familyId?._id ? application.familyId._id.toString() : null;

      if (!familyId) {
        return next(createHttpError(403, "You are not allowed to view this application", "FORBIDDEN"));
      }

      const membership = await FamilyMembership.findOne({ familyId, personId: userPersonId, status: "ACTIVE" });
      if (!membership) {
        return next(createHttpError(403, "You are not allowed to view this application", "FORBIDDEN"));
      }
    }

    return res.json(application);
  } catch (error) {
    return next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body || {};

    if (!status) {
      return next(createHttpError(400, "status is required", "VALIDATION_ERROR"));
    }

    const application = await updateApplicationStatusService({
      applicationId: req.params.applicationId,
      status,
      remarks,
      reviewedBy: req.user._id,
    });

    return res.json(application);
  } catch (error) {
    return next(error);
  }
};

export const listApplications = async (req, res, next) => {
  try {
    const { status, schemeId, search, page, limit } = req.query;

    const result = await listApplicationsService({
      status,
      schemeId,
      search,
      page,
      limit,
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};
