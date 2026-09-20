// services/scheme.service.js
import Scheme from "../models/Scheme.js";
import SchemeRule from "../models/SchemeRule.js";

export const getSchemesService = async (isOfficer) => {
  const filter = isOfficer ? {} : { is_active: true };
  const schemes = await Scheme.find(filter).sort({ created_at: -1 });
  const allRules = await SchemeRule.find();
  return schemes.map((s) => ({ ...s.toObject(), rules: allRules.filter((r) => r.scheme_id.toString() === s._id.toString()) }));
};

export const createSchemeService = async (body) => {
  const { rules, ...schemeData } = body;
  const scheme = await Scheme.create(schemeData);
  if (rules?.length) {
    await SchemeRule.insertMany(rules.map((r) => ({ ...r, scheme_id: scheme._id, value: String(r.value) })));
  }
  return scheme;
};

export const updateSchemeService = async (id, data) =>
  Scheme.findByIdAndUpdate(id, data, { new: true });

export const toggleSchemeService = async (id) => {
  const scheme = await Scheme.findById(id);
  if (!scheme) throw { statusCode: 404, message: "Scheme not found" };
  scheme.is_active = !scheme.is_active;
  await scheme.save();
  return scheme;
};

export const addRuleService = async (schemeId, ruleData) =>
  SchemeRule.create({ ...ruleData, scheme_id: schemeId, value: String(ruleData.value) });

export const deleteRuleService = async (ruleId) =>
  SchemeRule.findByIdAndDelete(ruleId);
