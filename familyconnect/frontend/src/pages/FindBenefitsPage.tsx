import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useFamily } from "../hooks/useFamily";
import api from "../services/api";

type EvaluatedScheme = {
  scheme_id: string;
  scheme_name: string;
  department?: string;
  description?: string;
  benefitDescription?: string;
  requiredDocuments?: string[];
  eligible: boolean;
  matched_rules?: Array<{ ruleId?: string | null; description: string; matchedBy?: string }>;
  failed_rules?: Array<{ ruleId?: string | null; description: string; reason?: string }>;
};

export const FindBenefitsPage = () => {
  const navigate = useNavigate();
  const { family, loading: familyLoading, error: familyError } = useFamily();

  const [evaluations, setEvaluations] = useState<EvaluatedScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application submission tracking per scheme
  const [applyingSchemeId, setApplyingSchemeId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilyEligibility = async () => {
      if (!family?.familyId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/eligibility/family/${family.familyId}`);
        setEvaluations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to evaluate benefits for your family.");
      } finally {
        setLoading(false);
      }
    };

    if (family?.familyId) {
      void fetchFamilyEligibility();
    } else if (!familyLoading) {
      setLoading(false);
    }
  }, [family?.familyId, familyLoading]);

  // Handle direct Apply from an eligible card
  const handleApplyScheme = async (schemeId: string, schemeName: string) => {
    setApplyingSchemeId(schemeId);
    setApplyError(null);

    try {
      const { data } = await api.post("/applications", { schemeId });
      const applicationId = data.applicationId || data.id || data._id;

      setToastMessage(`Application for ${schemeName} submitted successfully!`);

      setTimeout(() => {
        navigate(`/applications/${applicationId}`);
      }, 1000);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : `Failed to submit application for ${schemeName}`);
      setApplyingSchemeId(null);
    }
  };

  if (familyLoading || loading) {
    return <LoadingSpinner label="Evaluating family eligibility across all Gujarat welfare schemes..." />;
  }

  if (familyError || error) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={familyError || error || "An error occurred."} />
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!family) {
    return (
      <EmptyState
        title="Family Profile Required"
        description="To discover benefits tailored to your household, register your family profile with income and member details."
        actionLabel="Create Family"
        onAction={() => navigate("/family/new")}
      />
    );
  }

  const eligibleSchemes = evaluations.filter((s) => s.eligible);
  const notEligibleSchemes = evaluations.filter((s) => !s.eligible);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-xl border border-green-300 bg-green-500 px-4 py-3 text-sm font-bold text-white shadow-lg animate-bounce">
          ✓ {toastMessage}
        </div>
      )}

      {/* Global Apply Error */}
      {applyError && <ErrorBanner message={applyError} />}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Rules-Engine Matchmaker
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Find Benefits for My Family
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Personalized welfare evaluation for Family{" "}
            <span className="font-mono font-bold text-blue-700">{family.familyId}</span>{" "}
            ({family.district}, Income: ₹{Number(family.annualIncome ?? 0).toLocaleString("en-IN")})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/schemes">
            <Button variant="secondary" className="text-xs font-semibold">
              Browse All Schemes
            </Button>
          </Link>
          <Link to="/applications">
            <Button variant="secondary" className="text-xs font-semibold">
              My Applications
            </Button>
          </Link>
        </div>
      </div>

      {/* Section 1: Eligible Schemes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-green-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-sm font-black text-white shadow">
              ✓
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Eligible Schemes ({eligibleSchemes.length})
            </h2>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-800">
            Ready to Apply
          </span>
        </div>

        {eligibleSchemes.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50 p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              No currently matched schemes for your household parameters.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check back as new schemes are announced or verify that your family members' demographic details are up to date.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {eligibleSchemes.map((scheme) => {
              const matchedList = scheme.matched_rules ?? [];
              const requiredDocs = scheme.requiredDocuments ?? [];
              const isSubmitting = applyingSchemeId === scheme.scheme_id;

              return (
                <Card
                  key={scheme.scheme_id}
                  className="flex flex-col justify-between border-green-200/80 bg-white shadow-sm transition hover:shadow-md hover:border-green-400"
                >
                  <div className="space-y-4">
                    {/* Header: Department & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        {scheme.department || "Gujarat State"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">
                        <span>✓</span> Eligible
                      </span>
                    </div>

                    {/* Scheme Name */}
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      <Link
                        to={`/schemes/${scheme.scheme_id}`}
                        className="hover:text-blue-600 transition"
                      >
                        {scheme.scheme_name}
                      </Link>
                    </h3>

                    {/* Benefit Description */}
                    <div className="rounded-xl border border-green-100 bg-green-50/50 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-green-900 mb-0.5">
                        Benefit
                      </p>
                      <p className="text-xs font-medium text-slate-800">
                        {scheme.benefitDescription || "Financial or welfare assistance provided."}
                      </p>
                    </div>

                    {/* Why Eligible (Matched Rules as bullet list) */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                        <span className="text-green-600 font-bold">✓</span> Why Eligible (Passed Rules):
                      </p>
                      <ul className="space-y-1.5 pl-1">
                        {matchedList.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="text-green-600 font-black">•</span>
                            <span>
                              {rule.description}
                              {rule.matchedBy && (
                                <span className="ml-1.5 rounded bg-green-100 px-1.5 py-0.2 text-[10px] font-semibold text-green-800">
                                  ({rule.matchedBy})
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Required Documents */}
                    {requiredDocs.length > 0 && (
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Required Documents:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {requiredDocs.map((doc, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                            >
                              📄 {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions: View Details + Apply Button */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <Link
                      to={`/schemes/${scheme.scheme_id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View Full Details &rarr;
                    </Link>

                    <Button
                      variant="primary"
                      disabled={isSubmitting || Boolean(toastMessage)}
                      onClick={() => handleApplyScheme(scheme.scheme_id, scheme.scheme_name)}
                      className="bg-green-600 text-white hover:bg-green-700 shadow-sm px-5 py-2 text-xs font-bold"
                    >
                      {isSubmitting ? "Submitting..." : "Apply Now"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Not Eligible Schemes */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-red-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white shadow">
              ✕
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Not Eligible ({notEligibleSchemes.length})
            </h2>
          </div>
          <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold text-red-800">
            Disqualified by Criteria
          </span>
        </div>

        {notEligibleSchemes.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No disqualified schemes.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {notEligibleSchemes.map((scheme) => {
              const failedList = scheme.failed_rules ?? [];

              return (
                <Card
                  key={scheme.scheme_id}
                  className="flex flex-col justify-between border-slate-200 bg-slate-50/60 shadow-sm opacity-90"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase text-slate-700">
                        {scheme.department || "Gujarat State"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                        <span>✕</span> Disqualified
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800">
                      <Link
                        to={`/schemes/${scheme.scheme_id}`}
                        className="hover:text-blue-600 transition"
                      >
                        {scheme.scheme_name}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {scheme.benefitDescription || scheme.description}
                    </p>

                    {/* Failed Rules as bullet list */}
                    <div className="rounded-xl border border-red-200/70 bg-red-50/50 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-red-900 mb-1.5">
                        Criteria Not Satisfied:
                      </p>
                      <ul className="space-y-1.5 pl-1">
                        {failedList.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-red-900">
                            <span className="text-red-600 font-bold">•</span>
                            <span>{rule.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center">
                    <Link
                      to={`/schemes/${scheme.scheme_id}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Review Criteria &rarr;
                    </Link>
                    <span className="text-[11px] text-slate-400">Cannot apply</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
