import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["CITIZEN", "OFFICER"]).optional().default("CITIZEN"),
    name: z.string().trim().optional(),
    dateOfBirth: z.union([z.string(), z.coerce.date()]).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    mobile: z.string().trim().optional(),
    occupation: z.string().trim().optional(),
    education: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "CITIZEN") {
      const requiredFields = [
        { field: "name", value: data.name },
        { field: "dateOfBirth", value: data.dateOfBirth },
        { field: "gender", value: data.gender },
      ];

      requiredFields.forEach(({ field, value }) => {
        if (!value || (typeof value === "string" && !value.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required for CITIZEN registration`,
          });
        }
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
