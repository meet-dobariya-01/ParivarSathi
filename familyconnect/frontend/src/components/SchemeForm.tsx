import { useState } from "react";
import { Button } from "./Button";
import { ErrorBanner } from "./ErrorBanner";
import { Input } from "./Input";
import { Select } from "./Select";

export type RuleDraft = {
  appliesTo: "FAMILY" | "MEMBER";
  fieldName: "annual_income" | "district" | "taluka" | "village" | "age" | "gender" | "occupation" | "education";
  operator: "==" | "!=" | ">" | ">=" | "<" | "<=" | "IN";
  value: string | number | string[];
};

export type SchemeFormData = {
  name: string;
  department: string;
  description: string;
  benefitDescription: string;
  requiredDocuments: string[];
  isActive: boolean;
  rules: RuleDraft[];
};

type SchemeFormProps = {
  initialData?: Partial<SchemeFormData>;
  onSubmit: (data: SchemeFormData) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
};

const defaultRule: RuleDraft = {
  appliesTo: "FAMILY",
  fieldName: "annual_income",
  operator: "<=",
  value: 300000,
};

const fieldOptions = [
  { value: "annual_income", label: "Annual Income (₹)", appliesTo: "FAMILY" },
  { value: "district", label: "District", appliesTo: "FAMILY" },
  { value: "taluka", label: "Taluka", appliesTo: "FAMILY" },
  { value: "village", label: "Village", appliesTo: "FAMILY" },
  { value: "age", label: "Age", appliesTo: "MEMBER" },
  { value: "gender", label: "Gender", appliesTo: "MEMBER" },
  { value: "occupation", label: "Occupation", appliesTo: "MEMBER" },
  { value: "education", label: "Education", appliesTo: "MEMBER" },
];

const operatorOptions = [
  { value: "==", label: "Equal to (==)" },
  { value: "!=", label: "Not equal (!=)" },
  { value: "<=", label: "Less than or equal (<=)" },
  { value: "<", label: "Less than (<)" },
  { value: ">=", label: "Greater than or equal (>=)" },
  { value: ">", label: "Greater than (>)" },
  { value: "IN", label: "Included in list (IN)" },
];

export const SchemeForm = ({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
}: SchemeFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [benefitDescription, setBenefitDescription] = useState(initialData?.benefitDescription || "");
  const [docsInput, setDocsInput] = useState(
    initialData?.requiredDocuments ? initialData.requiredDocuments.join(", ") : ""
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [rules, setRules] = useState<RuleDraft[]>(
    initialData?.rules && initialData.rules.length > 0
      ? initialData.rules.map((r) => ({
          ...r,
          value: Array.isArray(r.value) ? r.value.join(", ") : (r.value as string | number),
        }))
      : [defaultRule]
  );

  const [error, setError] = useState<string | null>(null);

  // Add rule row
  const handleAddRule = () => {
    setRules([...rules, { ...defaultRule }]);
  };

  // Remove rule row
  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Update rule field
  const handleRuleChange = (index: number, key: keyof RuleDraft, value: unknown) => {
    setRules((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [key]: value };

      // Auto set appliesTo based on fieldName if field changed
      if (key === "fieldName") {
        const found = fieldOptions.find((f) => f.value === value);
        if (found) {
          current.appliesTo = found.appliesTo as "FAMILY" | "MEMBER";
        }
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Scheme name is required.");
      return;
    }

    try {
      // Process required documents
      const requiredDocuments = docsInput
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      // Process rules
      const parsedRules: RuleDraft[] = rules.map((r) => {
        let parsedVal: string | number | string[] = r.value;

        if (r.operator === "IN") {
          // Multi-input: split comma-separated values
          parsedVal = String(r.value)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        } else if (r.fieldName === "annual_income" || r.fieldName === "age") {
          parsedVal = Number(r.value) || 0;
        } else {
          parsedVal = String(r.value).trim();
        }

        return {
          appliesTo: r.appliesTo,
          fieldName: r.fieldName,
          operator: r.operator,
          value: parsedVal,
        };
      });

      await onSubmit({
        name: name.trim(),
        department: department.trim(),
        description: description.trim(),
        benefitDescription: benefitDescription.trim(),
        requiredDocuments,
        isActive,
        rules: parsedRules,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save scheme.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorBanner message={error} />}

      {/* Basic Scheme Information */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Scheme Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kisan Sahay Yojana"
          required
        />

        <Input
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Agriculture & Farmers Welfare"
          required
        />

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed policy overview and target beneficiaries..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Benefit Entitlement Description"
            value={benefitDescription}
            onChange={(e) => setBenefitDescription(e.target.value)}
            placeholder="e.g. ₹20,000 per hectare crop loss financial support"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Required Documents (Comma-separated list)"
            value={docsInput}
            onChange={(e) => setDocsInput(e.target.value)}
            placeholder="Aadhaar Card, 7/12 Land Records, Bank Passbook, Farmer Certificate"
          />
        </div>

        {/* Active Toggle */}
        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="scheme-active-toggle"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="scheme-active-toggle" className="text-sm font-semibold text-slate-800">
            Active Scheme (Visible to citizens for eligibility checks)
          </label>
        </div>
      </div>

      {/* Dynamic Rule Builder */}
      <div className="border-t border-slate-200 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Eligibility Rules Builder ({rules.length})
            </h3>
            <p className="text-xs text-slate-500">
              Rules evaluated automatically by the decision engine to determine citizen qualification.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="text-xs py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100"
            onClick={handleAddRule}
          >
            + Add Rule
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            No rules added yet. (Scheme will be open to all citizens by default)
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, idx) => {
              const isOperatorIn = rule.operator === "IN";

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm"
                >
                  {/* Applies To */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Applies To
                    </label>
                    <select
                      value={rule.appliesTo}
                      onChange={(e) => handleRuleChange(idx, "appliesTo", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="FAMILY">FAMILY (Household)</option>
                      <option value="MEMBER">MEMBER (Individual)</option>
                    </select>
                  </div>

                  {/* Field Name */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Field
                    </label>
                    <select
                      value={rule.fieldName}
                      onChange={(e) => handleRuleChange(idx, "fieldName", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {fieldOptions.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label} ({f.appliesTo})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Operator
                    </label>
                    <select
                      value={rule.operator}
                      onChange={(e) => handleRuleChange(idx, "operator", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {operatorOptions.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value Input (Single or Multi-input when operator == IN) */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      {isOperatorIn ? "Values (Comma-separated)" : "Value"}
                    </label>
                    <input
                      type={
                        !isOperatorIn && (rule.fieldName === "annual_income" || rule.fieldName === "age")
                          ? "number"
                          : "text"
                      }
                      value={String(rule.value ?? "")}
                      onChange={(e) => handleRuleChange(idx, "value", e.target.value)}
                      placeholder={
                        isOperatorIn
                          ? "e.g. Rajkot, Surat, Kheda"
                          : rule.fieldName === "annual_income"
                          ? "300000"
                          : rule.fieldName === "gender"
                          ? "FEMALE"
                          : "Value"
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="h-8 w-8 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center text-xs font-bold"
                      title="Remove rule"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving Scheme..." : "Save Scheme"}
        </Button>
      </div>
    </form>
  );
};
