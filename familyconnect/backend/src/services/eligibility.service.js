// services/eligibility.service.js
import Family from "../models/Family.js";
import FamilyMembership from "../models/FamilyMembership.js";
import Scheme from "../models/Scheme.js";
import SchemeRule from "../models/SchemeRule.js";

const calculateAge = (dob) => {
  const actualDob = dob ? new Date(dob) : null;
  if (!actualDob || Number.isNaN(actualDob.getTime())) return null;
  const diff = Date.now() - actualDob.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

const resolveField = (record, fieldName) => {
  if (!record) return undefined;
  const candidates = [fieldName];
  const camelCase = fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  const underscored = fieldName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  candidates.push(camelCase, underscored);

  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(record, candidate)) {
      return record[candidate];
    }
  }

  return undefined;
};

const evalRule = (actual, op, target) => {
  const n1 = Number(actual), n2 = Number(target);
  const isNum = !Number.isNaN(n1) && !Number.isNaN(n2);
  const a = isNum ? n1 : String(actual ?? "").toLowerCase().trim();
  const b = isNum ? n2 : String(target ?? "").toLowerCase().trim();

  if (op === "IN") {
    const list = Array.isArray(target) ? target.map((item) => String(item).toLowerCase()) : [];
    return list.includes(String(actual ?? "").toLowerCase());
  }

  switch (op) {
    case "==": return a === b;
    case "!=": return a !== b;
    case ">":  return a > b;
    case "<":  return a < b;
    case ">=": return a >= b;
    case "<=": return a <= b;
    default:   return false;
  }
};

const fmtRule = (scope, field, op, val, actual, pass, name = "") => {
  const prefix = scope === "MEMBER" && name ? `[${name}] ` : "";
  return pass
    ? `${prefix}${field} (${actual}) satisfies ${op} ${val}`
    : `${prefix}${field} (${actual ?? "N/A"}) fails ${op} ${val}`;
};

export const evaluateForFamily = (family, members, rules) => {
  if (!rules || rules.length === 0) {
    return { eligible: true, matched_rules: ["Open for all citizens"], failed_rules: [], qualifying_members: members.map((m) => ({ person_id: m._id, name: m.name })) };
  }

  const familyRules = rules.filter((r) => (r.appliesTo ?? r.rule_scope) === "FAMILY");
  const memberRules = rules.filter((r) => (r.appliesTo ?? r.rule_scope) === "MEMBER");
  const matched = [], failed = [];
  let familyPassed = true;

  for (const r of familyRules) {
    const actual = resolveField(family, r.fieldName ?? r.field_name);
    const pass = evalRule(actual, r.operator, r.value);
    (pass ? matched : failed).push(fmtRule("FAMILY", r.fieldName ?? r.field_name, r.operator, r.value, actual, pass));
    if (!pass) familyPassed = false;
  }

  let qualifyingMembers = [];
  if (memberRules.length > 0) {
    for (const m of members) {
      const age = calculateAge(resolveField(m, "date_of_birth") ?? m.dateOfBirth);
      const mData = { ...(m.toObject ? m.toObject() : m), age };
      let allPass = true;
      const mMatched = [], mFailed = [];
      for (const r of memberRules) {
        const actual = resolveField(mData, r.fieldName ?? r.field_name);
        const pass = evalRule(actual, r.operator, r.value);
        (pass ? mMatched : mFailed).push(fmtRule("MEMBER", r.fieldName ?? r.field_name, r.operator, r.value, actual, pass, m.name));
        if (!pass) allPass = false;
      }
      if (allPass) { qualifyingMembers.push({ person_id: m._id, name: m.name, age, occupation: m.occupation }); matched.push(...mMatched); }
    }
    if (qualifyingMembers.length === 0) failed.push(`No member satisfies: ${memberRules.map((r) => `${r.fieldName ?? r.field_name} ${r.operator} ${r.value}`).join(", ")}`);
  } else {
    qualifyingMembers = members.map((m) => ({ person_id: m._id, name: m.name }));
  }

  const eligible = familyPassed && (memberRules.length === 0 || qualifyingMembers.length > 0);
  return { eligible, matched_rules: matched, failed_rules: failed, qualifying_members: eligible ? qualifyingMembers : [] };
};

export const findSchemesForFamilyService = async (personId) => {
  const membership = await FamilyMembership.findOne({ person_id: personId, status: "ACTIVE" });
  if (!membership) throw { statusCode: 404, message: "No active family found" };

  const family = await Family.findById(membership.family_id).populate("family_head_person_id");
  const memberships = await FamilyMembership.find({ family_id: family._id, status: "ACTIVE" }).populate("person_id");
  const members = memberships.filter((m) => m.person_id).map((m) => m.person_id);

  const schemes = await Scheme.find({ is_active: true });
  const allRules = await SchemeRule.find({ scheme_id: { $in: schemes.map((s) => s._id) } });

  const eligible = [], notEligible = [];
  for (const scheme of schemes) {
    const schemeRules = allRules.filter((r) => r.scheme_id.toString() === scheme._id.toString());
    const result = evaluateForFamily(family, members, schemeRules);
    const entry = { scheme_id: scheme._id, name: scheme.name, department: scheme.department, description: scheme.description, benefit_description: scheme.benefit_description, required_documents: scheme.required_documents, ...result };
    (result.eligible ? eligible : notEligible).push(entry);
  }

  return { family_id: family.family_id, total_active_schemes: schemes.length, eligible_count: eligible.length, not_eligible_count: notEligible.length, eligible_schemes: eligible, not_eligible_schemes: notEligible };
};
