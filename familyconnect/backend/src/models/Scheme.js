// models/Scheme.js
import mongoose from "mongoose";

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  description: { type: String, required: true },
  benefit_description: { type: String },
  required_documents: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("Scheme", SchemeSchema);
