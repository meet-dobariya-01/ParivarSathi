const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema({
  family_id: { type: String, required: true, unique: true }, // e.g. GJ-FAM-7K3P9X2M
  family_head_person_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  annual_income: { type: Number, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  taluka: { type: String, required: true },
  village: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Family', FamilySchema);
