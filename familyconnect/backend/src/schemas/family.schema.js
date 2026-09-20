// schemas/family.schema.js
import { z } from "zod";

export const createFamilySchema = z.object({
  annual_income: z.coerce.number().positive("Income must be positive"),
  address: z.string().min(3, "Address required"),
  district: z.string().min(2, "District required"),
  taluka: z.string().min(2, "Taluka required"),
  village: z.string().min(2, "Village required"),
});

export const addMemberSchema = z.object({
  name: z.string().min(2, "Name required"),
  date_of_birth: z.string(),
  gender: z.enum(["Male", "Female", "Other"]),
  mobile: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  relationship: z.enum(["HEAD","SPOUSE","SON","DAUGHTER","FATHER","MOTHER","OTHER"]),
});
