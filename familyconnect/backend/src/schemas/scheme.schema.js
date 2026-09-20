import { z } from "zod";

const allowedFieldNames = ["annual_income", "district", "taluka", "village", "age", "gender", "occupation", "education"];
const allowedOperators = ["==", "!=", ">", ">=", "<", "<=", "IN"];

const ruleInputSchema = z.object({
  appliesTo: z.enum(["FAMILY", "MEMBER"]).optional(),
  rule_scope: z.enum(["FAMILY", "MEMBER"]).optional(),
  fieldName: z.enum(allowedFieldNames).optional(),
  field_name: z.enum(allowedFieldNames).optional(),
  operator: z.enum(allowedOperators),
  value: z.any(),
}).superRefine((rule, ctx) => {
  const resolvedField = rule.fieldName ?? rule.field_name;
  const resolvedScope = rule.appliesTo ?? rule.rule_scope ?? "FAMILY";

  if (resolvedField === "annual_income" && resolvedScope !== "FAMILY") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "annual_income can only be used with FAMILY scope" });
  }

  if (["age", "gender", "occupation", "education"].includes(resolvedField) && resolvedScope !== "MEMBER") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${resolvedField} can only be used with MEMBER scope` });
  }

  if (rule.operator === "IN") {
    if (!Array.isArray(rule.value) || rule.value.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "IN operator requires a non-empty array value" });
    }
  } else if (Array.isArray(rule.value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Only the IN operator accepts array values" });
  }
}).transform((data) => ({
  appliesTo: data.appliesTo ?? data.rule_scope ?? "FAMILY",
  fieldName: data.fieldName ?? data.field_name,
  operator: data.operator,
  value: data.value,
}));

const schemeBaseSchema = z.object({
  name: z.string().trim().min(2),
  department: z.string().trim().min(2).optional().or(z.literal("")),
  description: z.string().trim().min(5).optional().or(z.literal("")),
  benefitDescription: z.string().trim().optional().or(z.literal("")),
  benefit_description: z.string().trim().optional().or(z.literal("")),
  requiredDocuments: z.array(z.string().trim().min(1)).optional(),
  required_documents: z.union([z.string().trim().min(1), z.array(z.string().trim().min(1))]).optional(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional(),
  rules: z.array(ruleInputSchema).optional(),
});

const schemeOutputSchema = schemeBaseSchema.transform((data) => {
  const requiredDocuments = Array.isArray(data.requiredDocuments)
    ? data.requiredDocuments
    : Array.isArray(data.required_documents)
      ? data.required_documents
      : data.required_documents
        ? [data.required_documents]
        : [];

  const benefitDescription = data.benefitDescription ?? data.benefit_description ?? "";
  const isActive = data.isActive ?? data.is_active ?? true;

  return {
    name: data.name,
    department: data.department ?? "",
    description: data.description ?? "",
    benefitDescription,
    requiredDocuments,
    isActive,
    ...(data.rules ? { rules: data.rules } : {}),
  };
});

export const createSchemeSchema = schemeOutputSchema;
export const updateSchemeSchema = schemeBaseSchema.partial().transform((data) => {
  const requiredDocuments = Array.isArray(data.requiredDocuments)
    ? data.requiredDocuments
    : Array.isArray(data.required_documents)
      ? data.required_documents
      : data.required_documents
        ? [data.required_documents]
        : undefined;

  const benefitDescription = data.benefitDescription ?? data.benefit_description ?? undefined;
  const isActive = data.isActive ?? data.is_active ?? undefined;

  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.department !== undefined ? { department: data.department } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(benefitDescription !== undefined ? { benefitDescription } : {}),
    ...(requiredDocuments !== undefined ? { requiredDocuments } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(data.rules !== undefined ? { rules: data.rules } : {}),
  };
});
export const schemeRuleSchema = ruleInputSchema;
