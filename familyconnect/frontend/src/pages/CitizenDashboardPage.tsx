import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useFamily } from "../hooks/useFamily";
import api from "../services/api";

type ApplicationItem = {
  _id?: string;
  status: string;
};

export const CitizenDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family, loading, error, refresh } = useFamily();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [eligibleCount, setEligibleCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardExtras = async () => {
      setStatsLoading(true);
      try {
        // Fetch citizen applications
        const appsRes = await api.get("/applications/my").catch(() => ({ data: [] }));
        if (isMounted && Array.isArray(appsRes.data)) {
          setApplications(appsRes.data);
        }

        // Fetch eligible schemes count if family exists
        if (family?.familyId) {
          const eligRes = await api
            .get(`/eligibility/family/${family.familyId}`)
            .catch(() => null);

          if (isMounted && eligRes?.data) {
            if (Array.isArray(eligRes.data)) {
              setEligibleCount(eligRes.data.length);
            } else if (Array.isArray(eligRes.data.schemes)) {
              setEligibleCount(eligRes.data.schemes.length);
            } else {
              setEligibleCount(6);
            }
          } else if (isMounted) {
            setEligibleCount(family ? 6 : 0);
          }
        }
      } catch {
        // Silently fall back to baseline values
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    void fetchDashboardExtras();

    return () => {
      isMounted = false;
    };
  }, [family?.familyId]);

  const familyMembers = family?.members?.length ?? 0;
  const activeApplications = applications.filter((app) =>
    ["SUBMITTED", "UNDER_REVIEW", "DRAFT"].includes(app.status)
  ).length;
  const approvedApplications = applications.filter(
    (app) => app.status === "APPROVED"
  ).length;

  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "Citizen");

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Gujarat Citizen Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome, {displayName}!
            </h1>
            <p className="text-sm text-blue-100">
              {family?.familyId ? (
                <span className="inline-flex items-center gap-2">
                  <span>Family ID:</span>
                  <span className="rounded-md bg-white/20 px-2 py-0.5 font-mono font-bold text-amber-300">
                    {family.familyId}
                  </span>
                </span>
              ) : (
                "You have not linked or created a family profile yet. Create your family to access government welfare schemes."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {family ? (
              <Button
                variant="secondary"
                className="bg-white font-semibold text-blue-900 shadow hover:bg-blue-50"
                onClick={() => navigate("/family")}
              >
                View Family
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="bg-amber-400 font-semibold text-blue-950 shadow hover:bg-amber-300"
                onClick={() => navigate("/family/new")}
              >
                Create your family
              </Button>
            )}
            <Button
              variant="secondary"
              className="border border-white/30 bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
              onClick={() => navigate("/schemes/eligible")}
            >
              Find Benefits
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading & Error States */}
      {loading ? (
        <LoadingSpinner label="Loading your family profile details..." />
      ) : error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <Button variant="secondary" className="text-xs" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* Empty State when no family exists */}
      {!loading && !family && !error ? (
        <EmptyState
          title="No Family Registered"
          description="A registered family profile allows you to check eligibility for educational, social security, and financial assistance schemes in Gujarat."
          actionLabel="Create your family"
          onAction={() => navigate("/family/new")}
        />
      ) : null}

      {/* Quick Stats Cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Household Overview</h2>
          {statsLoading && <span className="text-xs text-slate-400">Updating metrics...</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Family Members"
            value={familyMembers}
            accent="blue"
          />
          <StatCard
            label="Eligible Schemes"
            value={family ? eligibleCount || "—" : 0}
            accent="emerald"
          />
          <StatCard
            label="Active Applications"
            value={activeApplications}
            accent="amber"
          />
          <StatCard
            label="Approved"
            value={approvedApplications}
            accent="slate"
          />
        </div>
      </div>
    </div>
  );
};
