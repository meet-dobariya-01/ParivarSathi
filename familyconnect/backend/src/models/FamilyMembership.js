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

const FamilyMembershipSchema = new mongoose.Schema({
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true, index: true },
  personId: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  relationship: { type: String, enum: ["HEAD", "SPOUSE", "SON", "DAUGHTER", "FATHER", "MOTHER", "OTHER"], required: true },
  isHead: { type: Boolean, default: false },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date, default: null },
}, baseSchemaConfig);

FamilyMembershipSchema.index(
  { personId: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

export default mongoose.model("FamilyMembership", FamilyMembershipSchema);
