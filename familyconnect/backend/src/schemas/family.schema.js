import { z } from "zod";

const relationshipEnum = ["HEAD", "SPOUSE", "SON", "DAUGHTER", "FATHER", "MOTHER", "OTHER"];
const genderEnum = ["MALE", "FEMALE", "OTHER"];

const createFamilyBaseSchema = z.object({
  annualIncome: z.coerce.number().min(0, "annualIncome must be >= 0"),
  address: z.string().trim().min(1, "address is required").optional().or(z.literal("")),
  district: z.string().trim().min(2, "district is required"),
  taluka: z.string().trim().min(1, "taluka is required").optional().or(z.literal("")),
  village: z.string().trim().min(1, "village is required").optional().or(z.literal("")),
});

export const createFamilySchema = createFamilyBaseSchema.transform((data) => ({
  annualIncome: Number(data.annualIncome),
  address: data.address || "",
  district: data.district,
  taluka: data.taluka || "",
  village: data.village || "",
}));

export const updateFamilySchema = createFamilyBaseSchema.partial();

export const addMemberSchema = z.object({
  name: z.string().trim().min(2, "name is required"),
  dateOfBirth: z.union([z.string().min(1, "dateOfBirth is required"), z.coerce.date()]),
  gender: z.enum(genderEnum),
  mobile: z.string().trim().optional().or(z.literal("")),
  occupation: z.string().trim().optional().or(z.literal("")),
  education: z.string().trim().optional().or(z.literal("")),
  relationship: z.enum(relationshipEnum),
});

export const updateFamilyMemberSchema = z.object({
  relationship: z.enum(relationshipEnum).optional(),
  name: z.string().trim().min(2, "name is required").optional(),
  dateOfBirth: z.union([z.string().min(1, "dateOfBirth is required"), z.coerce.date()]).optional(),
  gender: z.enum(genderEnum).optional(),
  mobile: z.string().trim().optional().or(z.literal("")),
  occupation: z.string().trim().optional().or(z.literal("")),
  education: z.string().trim().optional().or(z.literal("")),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
  path: [],
});
