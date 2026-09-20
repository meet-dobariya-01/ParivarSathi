const Scheme = require('../models/Scheme');
const SchemeRule = require('../models/SchemeRule');

// Officer: Create scheme with optional rules
const createScheme = async (req, res) => {
  try {
    const { name, department, description, benefit_description, required_documents, is_active, rules } = req.body;

    const scheme = await Scheme.create({
      name,
      department,
      description,
      benefit_description,
      required_documents,
      is_active: is_active !== undefined ? is_active : true
    });

    // If rules are provided along with scheme creation
    if (rules && Array.isArray(rules) && rules.length > 0) {
      const schemeRules = rules.map(r => ({
        scheme_id: scheme._id,
        rule_scope: r.rule_scope || 'FAMILY',
        field_name: r.field_name,
        operator: r.operator,
        value: String(r.value),
        logical_group: r.logical_group || 'AND'
      }));
      await SchemeRule.insertMany(schemeRules);
    }

    res.status(201).json(scheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all schemes with their rules
const getSchemes = async (req, res) => {
  try {
    const filter = {};
    // If not officer, only show active schemes
    if (!req.user || req.user.role !== 'OFFICER') {
      filter.is_active = true;
    }

    const schemes = await Scheme.find(filter).sort({ created_at: -1 });
    const allRules = await SchemeRule.find();

    const result = schemes.map(s => {
      const rules = allRules.filter(r => r.scheme_id.toString() === s._id.toString());
      return {
        ...s.toObject(),
        rules
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Officer: Update scheme details
const updateScheme = async (req, res) => {
  try {
    const { name, department, description, benefit_description, required_documents, is_active } = req.body;

    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { name, department, description, benefit_description, required_documents, is_active, updated_at: new Date() },
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Officer: Toggle active/inactive
const toggleSchemeStatus = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    scheme.is_active = !scheme.is_active;
    scheme.updated_at = new Date();
    await scheme.save();

    res.json({ message: `Scheme ${scheme.is_active ? 'activated' : 'deactivated'}`, scheme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Officer: Add rule to scheme
const addRuleToScheme = async (req, res) => {
  try {
    const { rule_scope, field_name, operator, value, logical_group } = req.body;
    const rule = await SchemeRule.create({
      scheme_id: req.params.id,
      rule_scope,
      field_name,
      operator,
      value: String(value),
      logical_group: logical_group || 'AND'
    });

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Officer: Delete rule from scheme
const deleteRule = async (req, res) => {
  try {
    await SchemeRule.findByIdAndDelete(req.params.ruleId);
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createScheme,
  getSchemes,
  updateScheme,
  toggleSchemeStatus,
  addRuleToScheme,
  deleteRule
};
