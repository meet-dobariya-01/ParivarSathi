import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

import { evaluateSchemeDefinition } from "../src/services/eligibilityService.js";

const makeFamily = (overrides = {}) => ({
  _id: "family-1",
  familyId: "GJ-FAM-TEST1",
  annualIncome: 250000,
  district: "Rajkot",
  taluka: "Jetpur",
  village: "Mota",
  ...overrides,
});

const makeMember = (person) => ({
  _id: "mem-1",
  personId: person,
  status: "ACTIVE",
});

describe("eligibilityService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("passes an income rule when the family is within the annual income limit", () => {
    const family = makeFamily({ annualIncome: 280000 });
    const scheme = { _id: "scheme-1", name: "Education Support" };
    const rules = [{ _id: "rule-1", appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 300000 }];

    const result = evaluateSchemeDefinition({ family, members: [], scheme, rules, now: new Date("2025-01-01") });

    expect(result.eligible).toBe(true);
    expect(result.failed_rules).toHaveLength(0);
    expect(result.matched_rules[0].description).toBe("Annual income is within the limit");
  });

  it("fails an income rule when the family exceeds the allowed income", () => {
    const family = makeFamily({ annualIncome: 450000 });
    const scheme = { _id: "scheme-2", name: "Housing Grant" };
    const rules = [{ _id: "rule-2", appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 300000 }];

    const result = evaluateSchemeDefinition({ family, members: [], scheme, rules, now: new Date("2025-01-01") });

    expect(result.eligible).toBe(false);
    expect(result.failed_rules).toHaveLength(1);
    expect(result.failed_rules[0].reason).toContain("Annual income");
  });

  it("evaluates age using a fixed current date", () => {
    jest.setSystemTime(new Date("2025-01-01T00:00:00Z"));

    const family = makeFamily();
    const scheme = { _id: "scheme-3", name: "Senior Citizen Support" };
    const members = [
      makeMember({ name: "Raman", dateOfBirth: new Date("1960-12-31T00:00:00Z") }),
    ];
    const rules = [{ _id: "rule-3", appliesTo: "MEMBER", fieldName: "age", operator: ">=", value: 60 }];

    const result = evaluateSchemeDefinition({ family, members, scheme, rules, now: new Date("2025-01-01") });

    expect(result.eligible).toBe(true);
    expect(result.matched_rules[0].matchedBy).toBe("Raman");
  });

  it("supports IN operator for district matching", () => {
    const family = makeFamily({ district: "Rajkot" });
    const scheme = { _id: "scheme-4", name: "Regional Assistance" };
    const rules = [{ _id: "rule-4", appliesTo: "FAMILY", fieldName: "district", operator: "IN", value: ["Surendranagar", "Rajkot"] }];

    const result = evaluateSchemeDefinition({ family, members: [], scheme, rules, now: new Date("2025-01-01") });

    expect(result.eligible).toBe(true);
    expect(result.matched_rules[0].description).toContain("eligible list");
  });

  it("matches a member rule if any active member satisfies the condition", () => {
    const family = makeFamily();
    const scheme = { _id: "scheme-5", name: "Farmer Assistance" };
    const members = [
      makeMember({ name: "Meera", gender: "FEMALE", occupation: "Teacher" }),
      makeMember({ name: "Keshav", gender: "MALE", occupation: "Farmer" }),
    ];
    const rules = [{ _id: "rule-5", appliesTo: "MEMBER", fieldName: "occupation", operator: "==", value: "Farmer" }];

    const result = evaluateSchemeDefinition({ family, members, scheme, rules, now: new Date("2025-01-01") });

    expect(result.eligible).toBe(true);
    expect(result.matched_rules[0].matchedBy).toBe("Keshav");
  });

  it("evaluates mixed family and member rules together", () => {
    const family = makeFamily({ annualIncome: 180000, district: "Surendranagar" });
    const scheme = { _id: "scheme-6", name: "Student Scholarship" };
    const members = [
      makeMember({ name: "Asha", gender: "FEMALE", education: "STUDENT", dateOfBirth: new Date("2008-01-01") }),
      makeMember({ name: "Raju", gender: "MALE", education: "EMPLOYED", dateOfBirth: new Date("1975-01-01") }),
    ];
    const rules = [
      { _id: "rule-6a", appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 300000 },
      { _id: "rule-6b", appliesTo: "MEMBER", fieldName: "education", operator: "==", value: "STUDENT" },
    ];

    const result = evaluateSchemeDefinition({ family, members, scheme, rules, now: new Date("2025-01-01") });

    expect(result.eligible).toBe(true);
    expect(result.matched_rules).toHaveLength(2);
  });
});
