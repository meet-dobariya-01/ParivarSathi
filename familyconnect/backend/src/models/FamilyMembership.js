// models/FamilyMembership.js
import mongoose from "mongoose";

const FamilyMembershipSchema = new mongoose.Schema({
  family_id: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
  person_id: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  relationship: { type: String, enum: ["HEAD","SPOUSE","SON","DAUGHTER","FATHER","MOTHER","OTHER"], required: true },
  is_head: { type: Boolean, default: false },
  status: { type: String, enum: ["ACTIVE","INACTIVE"], default: "ACTIVE" },
  joined_at: { type: Date, default: Date.now },
  left_at: { type: Date },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("FamilyMembership", FamilyMembershipSchema);
