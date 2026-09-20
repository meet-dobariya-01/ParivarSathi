import mongoose from "mongoose";

const baseSchemaConfig = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["CITIZEN", "OFFICER"], required: true },
  personId: { type: mongoose.Schema.Types.ObjectId, ref: "Person", default: null },
  isActive: { type: Boolean, default: true },
}, baseSchemaConfig);

export default mongoose.model("User", UserSchema);
