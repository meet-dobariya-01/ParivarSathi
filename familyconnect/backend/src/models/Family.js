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

const FamilySchema = new mongoose.Schema({
  familyId: { type: String, required: true, unique: true, index: true },
  familyHeadPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  annualIncome: { type: Number, required: true, min: 0 },
  address: { type: String },
  district: { type: String, required: true },
  taluka: { type: String },
  village: { type: String },
}, baseSchemaConfig);

export default mongoose.model("Family", FamilySchema);
