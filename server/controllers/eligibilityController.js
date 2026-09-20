const Family = require('../models/Family');
const FamilyMembership = require('../models/FamilyMembership');
const Person = require('../models/Person');
const Scheme = require('../models/Scheme');
const SchemeRule = require('../models/SchemeRule');
const { evaluateSchemeForFamily } = require('../utils/eligibilityEngine');

// Evaluate all schemes for current citizen's active family
const findSchemesForMyFamily = async (req, res) => {
  try {
    if (!req.user.person_id) {
      return res.status(400).json({ message: 'User is not linked to any person profile' });
    }

    // 1. Find active membership for citizen
    const membership = await FamilyMembership.findOne({
      person_id: req.user.person_id,
      status: 'ACTIVE'
    });

    if (!membership) {
      return res.status(404).json({ message: 'No active family found for this user. Please register a family first.' });
    }

    const family = await Family.findById(membership.family_id).populate('family_head_person_id');
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // 2. Find all active members in this family
    const allMemberships = await FamilyMembership.find({
      family_id: family._id,
      status: 'ACTIVE'
    }).populate('person_id');

    const members = allMemberships
      .filter(m => m.person_id)
      .map(m => {
        const p = m.person_id.toObject ? m.person_id.toObject() : m.person_id;
        return {
          ...p,
          relationship: m.relationship,
          is_head: m.is_head
        };
      });

    // 3. Load all active schemes and their rules
    const activeSchemes = await Scheme.find({ is_active: true });
    const allRules = await SchemeRule.find({
      scheme_id: { $in: activeSchemes.map(s => s._id) }
    });

    const eligibleSchemes = [];
    const notEligibleSchemes = [];

    // 4. Run eligibility engine for each scheme
    for (const scheme of activeSchemes) {
      const schemeRules = allRules.filter(r => r.scheme_id.toString() === scheme._id.toString());
      const evaluation = evaluateSchemeForFamily(family, members, schemeRules);

      if (evaluation.eligible) {
        eligibleSchemes.push({
          scheme_id: scheme._id,
          name: scheme.name,
          department: scheme.department,
          description: scheme.description,
          benefit_description: scheme.benefit_description,
          required_documents: scheme.required_documents,
          eligible: true,
          matched_rules: evaluation.matched_rules,
          failed_rules: [],
          qualifying_members: evaluation.qualifying_members
        });
      } else {
        notEligibleSchemes.push({
          scheme_id: scheme._id,
          name: scheme.name,
          department: scheme.department,
          description: scheme.description,
          benefit_description: scheme.benefit_description,
          eligible: false,
          matched_rules: evaluation.matched_rules,
          failed_rules: evaluation.failed_rules
        });
      }
    }

    res.json({
      family_id: family.family_id,
      total_active_schemes: activeSchemes.length,
      eligible_count: eligibleSchemes.length,
      not_eligible_count: notEligibleSchemes.length,
      eligible_schemes: eligibleSchemes,
      not_eligible_schemes: notEligibleSchemes
    });
  } catch (error) {
    console.error('Error in findSchemesForMyFamily:', error);
    res.status(500).json({ message: error.message });
  }
};

// Evaluate a specific scheme for a given family (e.g. For Officer view or direct test)
const evaluateScheme = async (req, res) => {
  try {
    const { familyId, schemeId } = req.params;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    const memberships = await FamilyMembership.find({ family_id: familyId, status: 'ACTIVE' }).populate('person_id');
    const members = memberships.filter(m => m.person_id).map(m => m.person_id);

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    const rules = await SchemeRule.find({ scheme_id: schemeId });
    const result = evaluateSchemeForFamily(family, members, rules);

    res.json({
      scheme_id: scheme._id,
      scheme_name: scheme.name,
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  findSchemesForMyFamily,
  evaluateScheme
};
