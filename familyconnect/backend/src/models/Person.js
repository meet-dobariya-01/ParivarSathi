// models/Person.js
import mongoose from "mongoose";

const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date_of_birth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  mobile: { type: String, default: "" },
  occupation: { type: String, default: "" },
  education: { type: String, default: "" },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("Person", PersonSchema);
