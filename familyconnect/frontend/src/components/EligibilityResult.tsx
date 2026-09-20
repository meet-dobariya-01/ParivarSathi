import { Card } from "./Card";

export type MatchedRule = {
  ruleId?: string | null;
  description: string;
  matchedBy?: string;
};

export type FailedRule = {
  ruleId?: string | null;
  description: string;
  reason?: string;
};

export type EligibilityData = {
  eligible?: boolean;
  scheme_id?: string;
  scheme_name?: string;
  matched_rules?: MatchedRule[];
  failed_rules?: FailedRule[];
};

type EligibilityResultProps = {
  eligibility: EligibilityData | null | undefined;
  loading?: boolean;
  error?: string | null;
  className?: string;
};

export const EligibilityResult = ({
  eligibility,
  loading = false,
  error = null,
  className = "",
}: EligibilityResultProps) => {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-blue-800 shadow-sm">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
        <span className="text-sm font-medium">Evaluating family eligibility criteria...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-semibold">Unable to check eligibility:</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (!eligibility) {
    return null;
  }

  const isEligible = Boolean(eligibility.eligible);
  const matchedRules = eligibility.matched_rules ?? [];
  const failedRules = eligibility.failed_rules ?? [];

  return (
    <Card
      title="Eligibility Verification Result"
      subtitle="Automated rules engine evaluation against your active household data"
      className={["shadow-sm", className].join(" ")}
    >
      {/* Status banner */}
      <div
        className={[
          "mb-5 flex items-center justify-between rounded-xl border p-4 shadow-sm",
          isEligible
            ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 text-green-900"
            : "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <span
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full text-lg font-black shadow-sm",
              isEligible ? "bg-green-600 text-white" : "bg-amber-600 text-white",
            ].join(" ")}
          >
            {isEligible ? "✓" : "✗"}
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">
              {isEligible ? "Eligible for this Scheme" : "Currently Not Eligible"}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {isEligible
                ? "Your household meets all criteria established by the Department."
                : "One or more eligibility criteria were not satisfied."}
            </p>
          </div>
        </div>

        <span
          className={[
            "hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
            isEligible ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800",
          ].join(" ")}
        >
          {isEligible ? "Qualified" : "Disqualified"}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Matched Rules */}
        <div className="rounded-xl border border-green-200/80 bg-green-50/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              ✓
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-green-800">
              Matched Rules ({matchedRules.length})
            </h4>
          </div>

          {matchedRules.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No matched rules recorded.</p>
          ) : (
            <ul className="space-y-2">
              {matchedRules.map((rule, index) => (
                <li key={rule.ruleId || index} className="flex items-start gap-2 text-xs text-slate-800">
                  <span className="mt-0.5 text-green-600 font-bold">•</span>
                  <div>
                    <span className="font-medium">{rule.description}</span>
                    {rule.matchedBy && (
                      <span className="ml-1.5 inline-block rounded bg-green-100 px-1.5 py-0.2 text-[10px] font-semibold text-green-800">
                        by {rule.matchedBy}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Failed Rules */}
        <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              ✕
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
              Failed Rules ({failedRules.length})
            </h4>
          </div>

          {failedRules.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No failed rules. All conditions met!</p>
          ) : (
            <ul className="space-y-2">
              {failedRules.map((rule, index) => (
                <li key={rule.ruleId || index} className="flex items-start gap-2 text-xs text-slate-800">
                  <span className="mt-0.5 text-red-500 font-bold">•</span>
                  <div>
                    <span className="font-medium text-red-950">{rule.description}</span>
                    {rule.reason && rule.reason !== rule.description && (
                      <p className="text-[11px] text-red-700 mt-0.5">{rule.reason}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
};
