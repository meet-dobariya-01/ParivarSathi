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

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  department: { type: String, default: "" },
  description: { type: String, default: "" },
  benefitDescription: { type: String, default: "" },
  requiredDocuments: [{ type: String, default: [] }],
  isActive: { type: Boolean, default: true },
}, baseSchemaConfig);

export default mongoose.model("Scheme", SchemeSchema);
