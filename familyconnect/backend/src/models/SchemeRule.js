// models/SchemeRule.js
import mongoose from "mongoose";

const SchemeRuleSchema = new mongoose.Schema({
  scheme_id: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true },
  rule_scope: { type: String, enum: ["FAMILY","MEMBER"], default: "FAMILY", required: true },
  field_name: { type: String, required: true },
  operator: { type: String, enum: ["==","!=",">","<",">=","<="], required: true },
  value: { type: String, required: true },
  logical_group: { type: String, default: "AND" },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("SchemeRule", SchemeRuleSchema);
