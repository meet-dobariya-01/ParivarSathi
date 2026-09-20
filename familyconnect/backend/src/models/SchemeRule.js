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

const SchemeRuleSchema = new mongoose.Schema({
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true, index: true },
  appliesTo: { type: String, enum: ["FAMILY", "MEMBER"], required: true },
  fieldName: {
    type: String,
    required: true,
    enum: ["annual_income", "district", "taluka", "village", "age", "gender", "occupation", "education"],
  },
  operator: { type: String, enum: ["==", "!=", ">", ">=", "<", "<=", "IN"], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, baseSchemaConfig);

export default mongoose.model("SchemeRule", SchemeRuleSchema);
