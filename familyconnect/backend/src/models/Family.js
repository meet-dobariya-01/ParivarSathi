// models/Family.js
import mongoose from "mongoose";

const FamilySchema = new mongoose.Schema({
  family_id: { type: String, required: true, unique: true },
  family_head_person_id: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  annual_income: { type: Number, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  taluka: { type: String, required: true },
  village: { type: String, required: true },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("Family", FamilySchema);
