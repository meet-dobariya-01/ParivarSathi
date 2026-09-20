import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EligibilityResult, type EligibilityData } from "../components/EligibilityResult";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useFamily } from "../hooks/useFamily";
import { CitizenLayout } from "../layouts/CitizenLayout";
import api from "../services/api";

type SchemeRuleItem = {
  id?: string;
  appliesTo: "FAMILY" | "MEMBER";
  fieldName: string;
  operator: string;
  value: unknown;
};

type SchemeDetail = {
  _id?: string;
  id?: string;
  name: string;
  department?: string;
  description?: string;
  benefitDescription?: string;
  requiredDocuments?: string[];
  rules?: SchemeRuleItem[];
  isActive?: boolean;
};

const formatRuleHumanReadable = (rule: SchemeRuleItem) => {
  const { fieldName, operator, value, appliesTo } = rule;
  const scopePrefix = appliesTo === "FAMILY" ? "Family" : "Individual Member";

  const operatorNames: Record<string, string> = {
    "==": "must be",
    "!=": "must not be",
    ">": "greater than",
    ">=": "at least",
    "<": "less than",
    "<=": "at most",
    IN: "must be in",
  };

  const opLabel = operatorNames[operator] || operator;

  if (fieldName === "annual_income") {
    return `Annual household income must be ${opLabel} ₹${Number(value).toLocaleString("en-IN")}`;
  }
  if (fieldName === "age") {
    return `${scopePrefix} age must be ${opLabel} ${value} years`;
  }
  if (fieldName === "district") {
    const distText = Array.isArray(value) ? value.join(", ") : value;
    return `Must reside in ${distText} district`;
  }
  if (fieldName === "gender") {
    return `${scopePrefix} gender ${opLabel} ${String(value).toLowerCase()}`;
  }
  if (fieldName === "occupation") {
    return `${scopePrefix} occupation ${opLabel} ${value}`;
  }
  if (fieldName === "education") {
    return `${scopePrefix} education ${opLabel} ${value}`;
  }

  const valStr = Array.isArray(value) ? `[${value.join(", ")}]` : String(value);
  return `${scopePrefix} ${fieldName.replace("_", " ")} ${opLabel} ${valStr}`;
};

export const SchemeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { family } = useFamily();

  const [scheme, setScheme] = useState<SchemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Eligibility evaluation state
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  // Application submission state
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Fetch Scheme Details
  useEffect(() => {
    const fetchScheme = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/schemes/${id}?include=rules`);
        setScheme(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load scheme details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) void fetchScheme();
  }, [id]);

  // 2. Fetch Eligibility if Citizen has a Family
  useEffect(() => {
    const checkEligibility = async () => {
      if (!family?.familyId || !id) return;

      setCheckingEligibility(true);
      setEligibilityError(null);
      try {
        const { data } = await api.get(
          `/eligibility/family/${family.familyId}/scheme/${id}`
        );
        setEligibility(data);
      } catch (err) {
        setEligibilityError(
          err instanceof Error ? err.message : "Failed to evaluate scheme eligibility."
        );
      } finally {
        setCheckingEligibility(false);
      }
    };

    if (family?.familyId && id) {
      void checkEligibility();
    }
  }, [family?.familyId, id]);

  // 3. Handle Application Submission
  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    setApplyError(null);

    try {
      const payload: Record<string, unknown> = {
        schemeId: scheme?._id || scheme?.id || id,
      };

      const { data } = await api.post("/applications", payload);

      setToastMessage("Application submitted successfully!");

      const appId = data.applicationId || data.id || data._id;
      setTimeout(() => {
        navigate(`/applications/${appId}`);
      }, 1200);
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : "Failed to submit scheme application."
      );
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingSpinner label="Loading scheme details..." />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <ErrorBanner message={error || "Scheme not found"} />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate("/schemes")}>
            &larr; Back to Schemes Directory
          </Button>
        </div>
      </div>
    );
  }

  const isEligible = Boolean(eligibility?.eligible);
  const rules = scheme.rules ?? [];
  const requiredDocs = scheme.requiredDocuments ?? [];

  const mainContent = (
    <div className="space-y-6">
      {/* Toast banner */}
      {toastMessage && (
        <div className="rounded-xl border border-green-300 bg-green-500 px-4 py-3 text-sm font-bold text-white shadow-lg animate-bounce">
          ✓ {toastMessage} Redirecting to your application details...
        </div>
      )}

      {/* Top Header Card */}
      <Card className="border-0 bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400 px-2.5 py-0.5 text-xs font-black uppercase text-blue-950">
                {scheme.department || "Government of Gujarat"}
              </span>
              <span className="rounded-full bg-emerald-400/20 border border-emerald-300/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200">
                Active Scheme
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {scheme.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs font-semibold"
              onClick={() => navigate("/schemes")}
            >
              &larr; All Schemes
            </Button>
          </div>
        </div>
      </Card>

      {/* Scheme Description & Benefit Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Scheme Overview" className="md:col-span-2 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
            {scheme.description || "Detailed description will be updated by the department."}
          </p>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5 flex items-center gap-2">
              <span>🎁</span> Financial & Welfare Benefits
            </h4>
            <p className="text-sm font-semibold text-blue-950">
              {scheme.benefitDescription || "Financial assistance per government guidelines."}
            </p>
          </div>
        </Card>

        {/* Required Documents */}
        <Card title="Required Documents" subtitle="KYC & verification papers" className="shadow-sm">
          {requiredDocs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No specific documents specified. Basic Aadhaar / Family ID required.</p>
          ) : (
            <ul className="space-y-2">
              {requiredDocs.map((doc, index) => (
                <li key={index} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    📄
                  </span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Eligibility Rules (Human Readable) */}
      <Card
        title="Eligibility Criteria Rules"
        subtitle="Conditions mandated by the Government of Gujarat to qualify for this benefit"
        className="shadow-sm"
      >
        {rules.length === 0 ? (
          <p className="text-xs text-slate-500 italic">This scheme is open to all Gujarat residents by default.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {formatRuleHumanReadable(rule)}
                  </p>
                  <span className="mt-1 inline-block rounded bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 uppercase">
                    Applies to {rule.appliesTo.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Check Eligibility Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Check Eligibility & Apply</h2>
          {family && (
            <span className="text-xs font-medium text-slate-500">
              Evaluating Family: <strong className="text-blue-700">{family.familyId}</strong>
            </span>
          )}
        </div>

        {/* State A: Not logged in */}
        {!isAuthenticated ? (
          <Card className="border-dashed border-amber-300 bg-amber-50/60 p-6 text-center shadow-sm">
            <h3 className="text-base font-bold text-amber-950">
              Citizen Authentication Required
            </h3>
            <p className="mt-1.5 text-xs text-amber-800 max-w-md mx-auto">
              Sign in with your citizen account to automatically verify your household's eligibility against this scheme and apply online.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button onClick={() => navigate("/login")}>Sign In to Check Eligibility</Button>
            </div>
          </Card>
        ) : !family ? (
          /* State B: Logged in but no family record */
          <Card className="border-dashed border-blue-300 bg-blue-50/50 p-6 text-center shadow-sm">
            <h3 className="text-base font-bold text-blue-950">
              Create Family Profile First
            </h3>
            <p className="mt-1.5 text-xs text-blue-800 max-w-md mx-auto">
              You need an active family record with household income and member demographics to evaluate scheme eligibility.
            </p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => navigate("/family/new")}>Create Family Profile</Button>
            </div>
          </Card>
        ) : (
          /* State C: Logged in and has family -> Evaluate & Display */
          <div className="space-y-4">
            <EligibilityResult
              eligibility={eligibility}
              loading={checkingEligibility}
              error={eligibilityError}
            />

            {applyError && <ErrorBanner message={applyError} />}

            {/* Apply Now Button if eligible */}
            {isEligible && !checkingEligibility && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-green-300 bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white shadow-md">
                <div>
                  <h4 className="text-base font-bold">Your Family is Eligible!</h4>
                  <p className="text-xs text-green-100 mt-0.5">
                    Click apply to submit your online application directly to the department for review.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  disabled={applying || Boolean(toastMessage)}
                  onClick={handleApply}
                  className="bg-white font-bold text-green-800 shadow hover:bg-green-50 px-6 py-3 text-sm shrink-0"
                >
                  {applying ? "Submitting Application..." : "🚀 Apply Now"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isAuthenticated) {
    return <CitizenLayout>{mainContent}</CitizenLayout>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-blue-900/30 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-black text-blue-950 text-xs shadow-inner">
              GUJ
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-200">
                Government of Gujarat
              </p>
              <h1 className="text-base font-bold text-white sm:text-lg">
                FamilyConnect Schemes Directory
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {mainContent}
      </div>
    </div>
  );
};
