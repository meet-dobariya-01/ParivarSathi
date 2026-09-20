// models/Application.js
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  family_id: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
  scheme_id: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true },
  applicant_person_id: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  status: { type: String, enum: ["DRAFT","SUBMITTED","UNDER_REVIEW","APPROVED","REJECTED"], default: "SUBMITTED" },
  remarks: { type: String, default: "" },
  submitted_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("Application", ApplicationSchema);
