import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EligibilityResult, type EligibilityData } from "../components/EligibilityResult";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatusBadge } from "../components/StatusBadge";
import api from "../services/api";

type PopulatedPerson = {
  _id?: string;
  name?: string;
  gender?: string;
  mobile?: string;
  occupation?: string;
  education?: string;
  dateOfBirth?: string;
};

type PopulatedFamily = {
  _id?: string;
  familyId?: string;
  district?: string;
  taluka?: string;
  village?: string;
  annualIncome?: number;
};

type PopulatedScheme = {
  _id?: string;
  name?: string;
  department?: string;
  benefitDescription?: string;
  requiredDocuments?: string[];
};

type ApplicationRecord = {
  _id?: string;
  applicationId: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  remarks?: string;
  submittedAt?: string;
  reviewedAt?: string;
  schemeId?: PopulatedScheme;
  applicantPersonId?: PopulatedPerson;
  familyId?: PopulatedFamily;
  eligibilityResult?: EligibilityData;
};

export const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/applications/${id}`);
        setApplication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load application details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) void fetchApplication();
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Loading application record & status..." />;
  }

  if (error || !application) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error || "Application not found"} />
        <Button variant="secondary" onClick={() => navigate("/applications")}>
          &larr; Back to My Applications
        </Button>
      </div>
    );
  }

  const { status, remarks, submittedAt, reviewedAt, schemeId, applicantPersonId, familyId, eligibilityResult } = application;

  // Timeline step calculation
  // Possible statuses: SUBMITTED -> UNDER_REVIEW -> APPROVED / REJECTED
  const isRejected = status === "REJECTED";
  const isApproved = status === "APPROVED";
  const isUnderReview = status === "UNDER_REVIEW" || isApproved || isRejected;
  const isSubmitted = true; // Always submitted if record exists

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/applications"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            &larr; Back to My Applications
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Application <span className="font-mono text-blue-700">{application.applicationId}</span>
            </h1>
            <StatusBadge status={status} />
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate("/find-benefits")}
          className="text-xs font-semibold"
        >
          Explore More Schemes
        </Button>
      </div>

      {/* Status Timeline Card */}
      <Card title="Application Progress" subtitle="Official review lifecycle" className="shadow-sm">
        <div className="relative py-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Step 1: SUBMITTED */}
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow">
                ✓
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                1. Submitted
              </p>
              <p className="text-[11px] text-slate-500">
                {submittedAt
                  ? new Date(submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Completed"}
              </p>
            </div>

            {/* Step 2: UNDER_REVIEW */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full font-bold shadow transition",
                  isUnderReview
                    ? "bg-amber-500 text-white"
                    : "bg-slate-200 text-slate-500 border border-slate-300",
                ].join(" ")}
              >
                {isUnderReview ? "⏳" : "2"}
              </div>
              <p
                className={[
                  "mt-2 text-xs font-bold uppercase tracking-wider",
                  isUnderReview ? "text-amber-900" : "text-slate-400",
                ].join(" ")}
              >
                2. Under Review
              </p>
              <p className="text-[11px] text-slate-500">
                {status === "UNDER_REVIEW"
                  ? "Officer currently verifying"
                  : isApproved || isRejected
                  ? "Verification finished"
                  : "Awaiting officer queue"}
              </p>
            </div>

            {/* Step 3: DECISION (APPROVED / REJECTED) */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full font-bold shadow transition",
                  isApproved
                    ? "bg-green-600 text-white"
                    : isRejected
                    ? "bg-red-600 text-white"
                    : "bg-slate-200 text-slate-500 border border-slate-300",
                ].join(" ")}
              >
                {isApproved ? "✓" : isRejected ? "✕" : "3"}
              </div>
              <p
                className={[
                  "mt-2 text-xs font-bold uppercase tracking-wider",
                  isApproved
                    ? "text-green-800"
                    : isRejected
                    ? "text-red-800"
                    : "text-slate-400",
                ].join(" ")}
              >
                {isApproved ? "3. Approved" : isRejected ? "3. Rejected" : "3. Decision"}
              </p>
              <p className="text-[11px] text-slate-500">
                {reviewedAt
                  ? new Date(reviewedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Final decision pending"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Overview Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Scheme & Benefit Information */}
        <Card title="Welfare Scheme Information" className="shadow-sm">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Scheme Name</p>
              <p className="text-base font-bold text-slate-900">
                {schemeId?.name || "Welfare Scheme"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Department</p>
              <p className="text-sm font-medium text-slate-700">
                {schemeId?.department || "Government of Gujarat"}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
              <p className="text-xs font-semibold uppercase text-blue-900">Benefit Entitlement</p>
              <p className="mt-0.5 text-xs text-blue-950 font-medium">
                {schemeId?.benefitDescription || "Financial / social security benefit per policy."}
              </p>
            </div>
          </div>
        </Card>

        {/* Applicant & Household Information */}
        <Card title="Applicant & Household Details" className="shadow-sm">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="font-semibold text-slate-400 uppercase">Applicant</p>
              <p className="font-bold text-slate-900 mt-0.5">{applicantPersonId?.name || "—"}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="font-semibold text-slate-400 uppercase">Family ID</p>
              <p className="font-mono font-bold text-blue-700 mt-0.5">{familyId?.familyId || "—"}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="font-semibold text-slate-400 uppercase">District / Taluka</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {familyId?.district || "—"} {familyId?.taluka ? `(${familyId.taluka})` : ""}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="font-semibold text-slate-400 uppercase">Household Income</p>
              <p className="font-bold text-emerald-700 mt-0.5">
                ₹{Number(familyId?.annualIncome ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="col-span-2 rounded-lg bg-slate-50 p-2.5">
              <p className="font-semibold text-slate-400 uppercase">Occupation / Education</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {applicantPersonId?.occupation || "—"} • {applicantPersonId?.education || "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Officer Remarks Section */}
      <Card
        title="Officer Feedback & Remarks"
        subtitle="Notes provided by the government verification officer during processing"
        className="shadow-sm"
      >
        {remarks && remarks.trim() ? (
          <div
            className={[
              "rounded-xl border p-4 text-sm font-medium",
              isRejected
                ? "border-red-200 bg-red-50 text-red-900"
                : isApproved
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-blue-200 bg-blue-50 text-blue-900",
            ].join(" ")}
          >
            <p className="text-xs uppercase font-bold tracking-wider mb-1 text-slate-500">
              Official Remark:
            </p>
            <p className="text-sm italic">“{remarks}”</p>
            {reviewedAt && (
              <p className="mt-2 text-[11px] text-slate-500">
                Logged on: {new Date(reviewedAt).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500 italic">
            No remarks logged yet. The application is in processing queue.
          </div>
        )}
      </Card>

      {/* Eligibility Snapshot */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-slate-900">
          Eligibility Snapshot (At Time of Submission)
        </h3>
        <p className="text-xs text-slate-500">
          Historical record of rules evaluated by the decision engine when this application was lodged.
        </p>

        {eligibilityResult ? (
          <EligibilityResult eligibility={eligibilityResult} />
        ) : (
          <Card className="p-4 text-xs text-slate-500 italic">
            No cached eligibility snapshot available for this application.
          </Card>
        )}
      </div>
    </div>
  );
};
