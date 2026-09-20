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

const ApplicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true, index: true },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true, index: true },
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true, index: true },
  applicantPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  status: { type: String, enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"], default: "SUBMITTED" },
  remarks: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  eligibilityResult: { type: mongoose.Schema.Types.Mixed, default: null },
}, baseSchemaConfig);

export default mongoose.model("Application", ApplicationSchema);
