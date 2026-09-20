// schemas/scheme.schema.js
import { z } from "zod";

export const createSchemeSchema = z.object({
  name: z.string().min(2),
  department: z.string().min(2),
  description: z.string().min(5),
  benefit_description: z.string().optional(),
  required_documents: z.string().optional(),
  is_active: z.boolean().optional(),
  rules: z.array(z.object({
    rule_scope: z.enum(["FAMILY","MEMBER"]),
    field_name: z.string(),
    operator: z.enum(["==","!=",">","<",">=","<="]),
    value: z.string(),
    logical_group: z.string().optional(),
  })).optional(),
});

export const schemeRuleSchema = z.object({
  rule_scope: z.enum(["FAMILY","MEMBER"]),
  field_name: z.string(),
  operator: z.enum(["==","!=",">","<",">=","<="]),
  value: z.string(),
  logical_group: z.string().optional(),
});
