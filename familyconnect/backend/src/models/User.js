// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["CITIZEN", "OFFICER"], default: "CITIZEN" },
  person_id: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password_hash);
};

export default mongoose.model("User", UserSchema);
