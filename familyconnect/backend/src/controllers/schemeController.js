import { createHttpError } from "../middleware/error.js";
import { createSchemeSchema, updateSchemeSchema } from "../schemas/scheme.schema.js";
import {
  createSchemeService,
  deleteRuleService,
  getSchemeByIdService,
  getSchemesService,
  toggleSchemeService,
  updateSchemeService,
} from "../services/scheme.service.js";

export const listSchemes = async (req, res, next) => {
  try {
    const activeOnly = req.query.active === "true" || req.query.active === true;
    const includeRules = req.query.include === "rules" || req.query.include === "true";

    const schemes = await getSchemesService({ activeOnly, includeRules });
    return res.json(schemes);
  } catch (error) {
    return next(error);
  }
};

export const getScheme = async (req, res, next) => {
  try {
    const includeRules = req.query.include === "rules" || req.query.include === "true" || true;
    const scheme = await getSchemeByIdService(req.params.schemeId, includeRules);
    return res.json(scheme);
  } catch (error) {
    return next(error);
  }
};

export const createScheme = async (req, res, next) => {
  try {
    const parsed = createSchemeSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createHttpError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.issues));
    }

    const scheme = await createSchemeService(parsed.data);
    return res.status(201).json(scheme);
  } catch (error) {
    return next(error);
  }
};

export const updateScheme = async (req, res, next) => {
  try {
    const parsed = updateSchemeSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createHttpError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.issues));
    }

    const scheme = await updateSchemeService(req.params.schemeId, parsed.data);
    return res.json(scheme);
  } catch (error) {
    return next(error);
  }
};

export const toggleScheme = async (req, res, next) => {
  try {
    const scheme = await toggleSchemeService(req.params.schemeId);
    return res.json(scheme);
  } catch (error) {
    return next(error);
  }
};

export const removeSchemeRule = async (req, res, next) => {
  try {
    const rule = await deleteRuleService(req.params.ruleId);
    return res.json({ message: "Scheme rule deleted successfully", rule });
  } catch (error) {
    return next(error);
  }
};
