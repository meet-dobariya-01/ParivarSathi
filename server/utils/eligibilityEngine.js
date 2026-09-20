/**
 * Generic Eligibility Engine for Gujarat Government Schemes
 * Evaluates Family profile and Member profiles against dynamic SchemeRules from MongoDB.
 */

// Helper to calculate age from date_of_birth
const calculateAge = (dob) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Generic single rule comparison
const evaluateSingleRule = (actualValue, operator, targetValue) => {
  // Check if comparing numbers
  const numActual = Number(actualValue);
  const numTarget = Number(targetValue);
  const isNumeric = !isNaN(numActual) && !isNaN(numTarget) && typeof actualValue !== 'boolean';

  if (isNumeric) {
    switch (operator) {
      case '==': return numActual === numTarget;
      case '!=': return numActual !== numTarget;
      case '>':  return numActual > numTarget;
      case '<':  return numActual < numTarget;
      case '>=': return numActual >= numTarget;
      case '<=': return numActual <= numTarget;
      default: return false;
    }
  }

  // String / Boolean comparison
  const strActual = String(actualValue ?? '').trim().toLowerCase();
  const strTarget = String(targetValue ?? '').trim().toLowerCase();

  switch (operator) {
    case '==': return strActual === strTarget;
    case '!=': return strActual !== strTarget;
    case '>':  return strActual > strTarget;
    case '<':  return strActual < strTarget;
    case '>=': return strActual >= strTarget;
    case '<=': return strActual <= strTarget;
    default: return false;
  }
};

const formatRuleExplanation = (scope, field, operator, value, actual, isPass, memberName = '') => {
  const prefix = scope === 'MEMBER' && memberName ? `Member [${memberName}] ` : '';
  const readableField = field.replace('_', ' ');
  if (isPass) {
    return `${prefix}${readableField} (${actual}) satisfied requirement: ${operator} ${value}`;
  } else {
    return `${prefix}${readableField} (${actual ?? 'N/A'}) failed requirement: ${operator} ${value}`;
  }
};

/**
 * Evaluates a single scheme against a family and its members.
 * @param {Object} family - Family document
 * @param {Array} members - Array of Person documents with membership details
 * @param {Array} rules - Array of SchemeRule documents for this scheme
 */
const evaluateSchemeForFamily = (family, members = [], rules = []) => {
  if (!rules || rules.length === 0) {
    return {
      eligible: true,
      matched_rules: ['No specific eligibility restrictions (Open for all citizens)'],
      failed_rules: [],
      qualifying_members: members.map(m => ({ person_id: m._id, name: m.name }))
    };
  }

  const familyRules = rules.filter(r => r.rule_scope === 'FAMILY');
  const memberRules = rules.filter(r => r.rule_scope === 'MEMBER');

  const matchedRules = [];
  const failedRules = [];
  let familyPassed = true;

  // 1. Evaluate Family Rules
  for (const rule of familyRules) {
    let actualVal = family[rule.field_name];
    const passed = evaluateSingleRule(actualVal, rule.operator, rule.value);

    if (passed) {
      matchedRules.push(formatRuleExplanation('FAMILY', rule.field_name, rule.operator, rule.value, actualVal, true));
    } else {
      failedRules.push(formatRuleExplanation('FAMILY', rule.field_name, rule.operator, rule.value, actualVal, false));
      familyPassed = false;
    }
  }

  // 2. Evaluate Member Rules
  let qualifyingMembers = [];

  if (memberRules.length > 0) {
    if (members.length === 0) {
      failedRules.push('No family members registered to evaluate member-specific criteria');
      return {
        eligible: false,
        matched_rules: matchedRules,
        failed_rules: failedRules,
        qualifying_members: []
      };
    }

    // Check each member to find who satisfies ALL memberRules
    for (const member of members) {
      const age = calculateAge(member.date_of_birth);
      const memberData = {
        ...member.toObject ? member.toObject() : member,
        age
      };

      let memberAllPassed = true;
      const memberMatched = [];
      const memberFailed = [];

      for (const rule of memberRules) {
        let actualVal = memberData[rule.field_name];
        const passed = evaluateSingleRule(actualVal, rule.operator, rule.value);

        if (passed) {
          memberMatched.push(formatRuleExplanation('MEMBER', rule.field_name, rule.operator, rule.value, actualVal, true, member.name));
        } else {
          memberFailed.push(formatRuleExplanation('MEMBER', rule.field_name, rule.operator, rule.value, actualVal, false, member.name));
          memberAllPassed = false;
        }
      }

      if (memberAllPassed) {
        qualifyingMembers.push({ person_id: member._id, name: member.name, age, occupation: member.occupation });
        matchedRules.push(...memberMatched);
      }
    }

    if (qualifyingMembers.length === 0) {
      failedRules.push(`No family member satisfies all member conditions: ${memberRules.map(r => `${r.field_name} ${r.operator} ${r.value}`).join(', ')}`);
    }
  } else {
    // If no member rules, all family members qualify
    qualifyingMembers = members.map(m => ({ person_id: m._id, name: m.name }));
  }

  const isEligible = familyPassed && (memberRules.length === 0 || qualifyingMembers.length > 0);

  return {
    eligible: isEligible,
    matched_rules: matchedRules,
    failed_rules: failedRules,
    qualifying_members: isEligible ? qualifyingMembers : []
  };
};

module.exports = {
  calculateAge,
  evaluateSingleRule,
  evaluateSchemeForFamily
};
