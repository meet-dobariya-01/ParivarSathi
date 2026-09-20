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

const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
  mobile: { type: String },
  occupation: { type: String },
  education: { type: String },
}, baseSchemaConfig);

export default mongoose.model("Person", PersonSchema);
