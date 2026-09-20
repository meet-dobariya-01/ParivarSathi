import Family from "../models/Family.js";
import FamilyMembership from "../models/FamilyMembership.js";
import Scheme from "../models/Scheme.js";
import SchemeRule from "../models/SchemeRule.js";

const toPlainObject = (value) => (value && typeof value.toObject === "function" ? value.toObject() : value || {});

const getMemberAge = (person, now = new Date()) => {
  if (!person?.dateOfBirth) return null;

  const birthday = new Date(person.dateOfBirth);
  if (Number.isNaN(birthday.getTime())) return null;

  const diffMs = now.getTime() - birthday.getTime();
  if (diffMs < 0) return 0;

  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
};

const normalizeString = (value) => String(value ?? "").trim();
const normalizeCase = (value) => normalizeString(value).toUpperCase();

const resolveFamilyValue = (family, fieldName) => {
  const valueMap = {
    annual_income: family?.annualIncome ?? family?.annual_income ?? 0,
    district: family?.district ?? "",
    taluka: family?.taluka ?? "",
    village: family?.village ?? "",
  };

  return valueMap[fieldName];
};

const resolveMemberValue = (person, fieldName, age) => {
  const valueMap = {
    age,
    gender: person?.gender ?? "",
    occupation: person?.occupation ?? "",
    education: person?.education ?? "",
  };

  return valueMap[fieldName];
};

const describeRule = (rule, leftValue, matched, memberName) => {
  const field = rule.fieldName || rule.field_name;
  const operator = rule.operator;
  const rightSide = Array.isArray(rule.value) ? `[${rule.value.join(", ")}]` : rule.value;

  if (field === "annual_income") {
    if (matched) return "Annual income is within the limit";
    return "Annual income exceeds the allowed limit";
  }

  if (field === "district" || field === "taluka" || field === "village") {
    if (operator === "IN") {
      if (matched) return `${field.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())} is within the eligible list`;
      return `${field.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())} is outside the eligible list`;
    }
    if (matched) return `${field.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())} condition satisfied`;
    return `${field.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())} does not match the eligible area`;
  }

  if (field === "age") {
    if (matched) return "Age requirement satisfied";
    return "Age requirement not satisfied";
  }

  if (field === "gender") {
    if (matched) return `Gender requirement satisfied for ${memberName || "member"}`;
    return `Gender requirement not satisfied for ${memberName || "member"}`;
  }

  if (field === "occupation") {
    if (matched) return "Occupation condition satisfied";
    return "Occupation condition not satisfied";
  }

  if (field === "education") {
    if (matched) return "Education requirement satisfied";
    return "Education requirement not satisfied";
  }

  if (operator === "IN") {
    if (matched) return `${field} is within the eligible list`;
    return `${field} is outside the eligible list`;
  }

  if (matched) return `${field} ${operator} ${rightSide} condition satisfied`;
  return `${field} ${operator} ${rightSide} condition not satisfied`;
};

const compareValues = (left, operator, right) => {
  const normalizeNumber = (value) => Number(value);

  if (operator === "IN") {
    if (!Array.isArray(right)) return false;
    return right.some((entry) => {
      const leftStr = normalizeString(left).toUpperCase();
      const rightStr = normalizeString(entry).toUpperCase();

      if (typeof left === "number" || typeof entry === "number") {
        return Number(left) === Number(entry);
      }

      return leftStr === rightStr;
    });
  }

  if (operator === "==") {
    if (typeof left === "number" && typeof right === "number") return left === right;
    return normalizeCase(left) === normalizeCase(right);
  }

  if (operator === "!=") {
    return !compareValues(left, "==", right);
  }

  if ([">", ">=", "<", "<="].includes(operator)) {
    const leftNum = normalizeNumber(left);
    const rightNum = normalizeNumber(right);

    if (Number.isNaN(leftNum) || Number.isNaN(rightNum)) {
      return false;
    }

    if (operator === ">") return leftNum > rightNum;
    if (operator === ">=") return leftNum >= rightNum;
    if (operator === "<") return leftNum < rightNum;
    return leftNum <= rightNum;
  }

  return false;
};

const evaluateRule = ({ rule, family, members, now }) => {
  const ruleId = rule._id ? rule._id.toString() : rule.id || null;
  const fieldName = rule.fieldName || rule.field_name;
  const scope = rule.appliesTo || rule.rule_scope || "FAMILY";
  const operator = rule.operator;
  const rightValue = rule.value;

  if (scope === "FAMILY") {
    const leftValue = resolveFamilyValue(family, fieldName);
    const matched = compareValues(leftValue, operator, rightValue);

    return {
      ruleId,
      matched,
      leftValue,
      subject: "family",
      memberName: null,
      description: describeRule(rule, leftValue, matched),
      reason: matched ? null : "Annual income exceeds the allowed limit",
    };
  }

  const memberMatches = members
    .map((member) => {
      const person = member.personId || member.person || member;
      const personObj = toPlainObject(person);
      const age = getMemberAge(personObj, now);
      const leftValue = resolveMemberValue(personObj, fieldName, age);
      const matched = compareValues(leftValue, operator, rightValue);

      return {
        ruleId,
        matched,
        leftValue,
        subject: "member",
        memberName: personObj.name || member.name || "Member",
        description: describeRule(rule, leftValue, matched, personObj.name || member.name || "Member"),
        reason: matched ? null : `${(personObj.name || "Member")} does not satisfy the ${fieldName} rule`,
      };
    })
    .filter((entry) => entry.matched);

  if (memberMatches.length > 0) {
    const firstMatch = memberMatches[0];
    return {
      ruleId,
      matched: true,
      leftValue: firstMatch.leftValue,
      subject: "member",
      memberName: firstMatch.memberName,
      description: firstMatch.description,
      reason: null,
    };
  }

  const firstMember = members[0];
  const fallbackPerson = firstMember?.personId || firstMember?.person || firstMember;
  const fallbackName = fallbackPerson?.name || "Member";
  const fallbackValue = members.length > 0 ? resolveMemberValue(toPlainObject(fallbackPerson), fieldName, getMemberAge(toPlainObject(fallbackPerson), now)) : null;

  return {
    ruleId,
    matched: false,
    leftValue: fallbackValue,
    subject: "member",
    memberName: fallbackName,
    description: describeRule(rule, fallbackValue, false, fallbackName),
    reason: `${fallbackName} does not satisfy the ${fieldName} rule`,
  };
};

export const evaluateSchemeDefinition = ({ family, members, scheme, rules, now = new Date() }) => {
  if (!family) {
    return {
      scheme_id: scheme?._id?.toString?.() || scheme?.id || null,
      scheme_name: scheme?.name || "Unknown scheme",
      eligible: false,
      matched_rules: [],
      failed_rules: [{ ruleId: null, description: "Family data is required to evaluate this scheme", reason: "Family information unavailable" }],
    };
  }

  const normalizedMembers = (members || []).map((member) => {
    const plainMember = toPlainObject(member);
    return {
      ...plainMember,
      personId: plainMember.personId || plainMember.person || null,
      person: plainMember.personId || plainMember.person || null,
    };
  });

  const activeRules = Array.isArray(rules) ? rules : [];

  if (activeRules.length === 0) {
    return {
      scheme_id: scheme?._id?.toString?.() || scheme?.id || null,
      scheme_name: scheme?.name || "Unknown scheme",
      eligible: true,
      matched_rules: [{ ruleId: "__warning__", description: "No rules defined; this scheme is open to all by default." }],
      failed_rules: [],
    };
  }

  const matchedRules = [];
  const failedRules = [];

  for (const rule of activeRules) {
    const evaluation = evaluateRule({ rule, family, members: normalizedMembers, now });

    if (evaluation.matched) {
      matchedRules.push({
        ruleId: evaluation.ruleId,
        description: evaluation.description,
        ...(evaluation.memberName ? { matchedBy: evaluation.memberName } : {}),
      });
    } else {
      failedRules.push({
        ruleId: evaluation.ruleId,
        description: evaluation.description,
        reason: evaluation.reason || "Rule not satisfied",
      });
    }
  }

  return {
    scheme_id: scheme?._id?.toString?.() || scheme?.id || null,
    scheme_name: scheme?.name || "Unknown scheme",
    department: scheme?.department || "",
    description: scheme?.description || "",
    benefitDescription: scheme?.benefitDescription || "",
    requiredDocuments: scheme?.requiredDocuments || [],
    eligible: failedRules.length === 0,
    matched_rules: matchedRules,
    failed_rules: failedRules,
  };
};

export const evaluateSchemeForFamily = async (familyId, schemeId, now = new Date()) => {
  const family = await Family.findOne({ familyId }).populate("familyHeadPersonId");
  if (!family) {
    throw new Error("Family not found");
  }

  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw new Error("Scheme not found");
  }

  const memberships = await FamilyMembership.find({ familyId: family._id, status: "ACTIVE" }).populate("personId");
  const members = memberships
    .filter((membership) => membership.personId)
    .map((membership) => ({
      ...membership.toObject(),
      person: membership.personId,
      personId: membership.personId,
    }));

  const rules = await SchemeRule.find({ schemeId: scheme._id });
  return evaluateSchemeDefinition({ family, members, scheme, rules, now });
};

export const evaluateAllSchemesForFamily = async (familyId, now = new Date()) => {
  const family = await Family.findOne({ familyId }).populate("familyHeadPersonId");
  if (!family) {
    throw new Error("Family not found");
  }

  const memberships = await FamilyMembership.find({ familyId: family._id, status: "ACTIVE" }).populate("personId");
  const members = memberships
    .filter((membership) => membership.personId)
    .map((membership) => ({
      ...membership.toObject(),
      person: membership.personId,
      personId: membership.personId,
    }));

  const schemes = await Scheme.find({ isActive: true });
  const rulesByScheme = await SchemeRule.find({
    schemeId: { $in: schemes.map((scheme) => scheme._id) },
  });

  return schemes.map((scheme) => {
    const rules = rulesByScheme.filter((rule) => rule.schemeId.toString() === scheme._id.toString());
    return evaluateSchemeDefinition({ family, members, scheme, rules, now });
  });
};
