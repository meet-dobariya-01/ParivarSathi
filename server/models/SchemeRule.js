const mongoose = require('mongoose');

const SchemeRuleSchema = new mongoose.Schema({
  scheme_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  rule_scope: { 
    type: String, 
    enum: ['FAMILY', 'MEMBER'], 
    default: 'FAMILY', 
    required: true 
  },
  field_name: { 
    type: String, 
    required: true 
  }, // FAMILY: annual_income, district, taluka, village. MEMBER: age, gender, occupation, education
  operator: { 
    type: String, 
    enum: ['==', '!=', '>', '<', '>=', '<='], 
    required: true 
  },
  value: { type: String, required: true }, // compared as string or number depending on field
  logical_group: { type: String, default: 'AND' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('SchemeRule', SchemeRuleSchema);
