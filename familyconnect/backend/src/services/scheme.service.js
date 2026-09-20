import Scheme from "../models/Scheme.js";
import SchemeRule from "../models/SchemeRule.js";
import { createHttpError } from "../middleware/error.js";

const normalizeRuleDocument = (rule) => {
  if (!rule) return null;

  const plain = rule.toObject ? rule.toObject() : { ...rule };
  return {
    ...plain,
    id: plain.id || plain._id?.toString?.() || undefined,
    schemeId: plain.schemeId || plain.scheme_id || undefined,
    appliesTo: plain.appliesTo || plain.rule_scope || "FAMILY",
    fieldName: plain.fieldName || plain.field_name || "",
  };
};

const normalizeSchemeDocument = (scheme, rules = []) => {
  if (!scheme) return null;

  const plain = scheme.toObject ? scheme.toObject() : { ...scheme };
  return {
    ...plain,
    id: plain.id || plain._id?.toString?.() || undefined,
    requiredDocuments: Array.isArray(plain.requiredDocuments) ? plain.requiredDocuments : [] ,
    isActive: plain.isActive ?? plain.is_active ?? true,
    benefitDescription: plain.benefitDescription ?? plain.benefit_description ?? "",
    rules: rules.map(normalizeRuleDocument),
  };
};

export const getSchemesService = async ({ activeOnly = false, includeRules = false } = {}) => {
  const filter = activeOnly ? { isActive: true } : {};
  const schemes = await Scheme.find(filter).sort({ createdAt: -1 });

  if (!includeRules) {
    return schemes.map((scheme) => normalizeSchemeDocument(scheme, []));
  }

  const ruleMap = await SchemeRule.find({ schemeId: { $in: schemes.map((scheme) => scheme._id) } });
  const groupedRules = new Map();

  for (const rule of ruleMap) {
    const key = rule.schemeId.toString();
    if (!groupedRules.has(key)) groupedRules.set(key, []);
    groupedRules.get(key).push(normalizeRuleDocument(rule));
  }

  return schemes.map((scheme) => normalizeSchemeDocument(scheme, groupedRules.get(scheme._id.toString()) || []));
};

export const getSchemeByIdService = async (schemeId, includeRules = true) => {
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw createHttpError(404, "Scheme not found", "SCHEME_NOT_FOUND");
  }

  if (!includeRules) return normalizeSchemeDocument(scheme, []);

  const rules = await SchemeRule.find({ schemeId: scheme._id });
  return normalizeSchemeDocument(scheme, rules);
};

export const createSchemeService = async (payload) => {
  const { rules = [], ...schemeData } = payload;
  const scheme = await Scheme.create({
    ...schemeData,
    requiredDocuments: Array.isArray(schemeData.requiredDocuments) ? schemeData.requiredDocuments : [],
    isActive: schemeData.isActive ?? true,
  });

  if (rules.length > 0) {
    await SchemeRule.insertMany(
      rules.map((rule) => ({
        schemeId: scheme._id,
        appliesTo: rule.appliesTo,
        fieldName: rule.fieldName,
        operator: rule.operator,
        value: rule.value,
      }))
    );
  }

  return getSchemeByIdService(scheme._id.toString());
};

export const updateSchemeService = async (schemeId, payload) => {
  const { rules, ...schemeData } = payload;
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw createHttpError(404, "Scheme not found", "SCHEME_NOT_FOUND");
  }

  if (Object.keys(schemeData).length > 0) {
    if (schemeData.requiredDocuments !== undefined) {
      scheme.requiredDocuments = Array.isArray(schemeData.requiredDocuments) ? schemeData.requiredDocuments : [];
    }
    Object.assign(scheme, schemeData);
    await scheme.save();
  }

  if (rules !== undefined) {
    await SchemeRule.deleteMany({ schemeId: scheme._id });
    if (rules.length > 0) {
      await SchemeRule.insertMany(
        rules.map((rule) => ({
          schemeId: scheme._id,
          appliesTo: rule.appliesTo,
          fieldName: rule.fieldName,
          operator: rule.operator,
          value: rule.value,
        }))
      );
    }
  }

  return getSchemeByIdService(scheme._id.toString());
};

export const toggleSchemeService = async (schemeId) => {
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw createHttpError(404, "Scheme not found", "SCHEME_NOT_FOUND");
  }

  scheme.isActive = !scheme.isActive;
  await scheme.save();
  return getSchemeByIdService(scheme._id.toString());
};

export const addRuleService = async (schemeId, ruleData) => {
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw createHttpError(404, "Scheme not found", "SCHEME_NOT_FOUND");
  }

  const rule = await SchemeRule.create({
    schemeId,
    appliesTo: ruleData.appliesTo,
    fieldName: ruleData.fieldName,
    operator: ruleData.operator,
    value: ruleData.value,
  });

  return normalizeRuleDocument(rule);
};

export const deleteRuleService = async (ruleId) => {
  const deleted = await SchemeRule.findByIdAndDelete(ruleId);
  if (!deleted) {
    throw createHttpError(404, "Scheme rule not found", "SCHEME_RULE_NOT_FOUND");
  }
  return deleted;
};
