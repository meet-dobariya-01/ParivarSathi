import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { Table } from "../components/Table";
import api from "../services/api";

type DashboardSummary = {
  totalFamilies: number;
  totalMembers: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
};

type SchemeMetric = {
  schemeId: string;
  schemeName: string;
  count: number;
};

type StatusMetric = {
  status: string;
  count: number;
};

type DistrictMetric = {
  district: string;
  count: number;
};

type RecentApplication = {
  _id?: string;
  applicationId: string;
  status: string;
  submittedAt?: string;
  schemeId?: { name?: string; department?: string } | string;
  applicantPersonId?: { name?: string } | string;
  familyId?: { familyId?: string; district?: string } | string;
};

const STATUS_PIE_COLORS: Record<string, string> = {
  SUBMITTED: "#2563eb", // blue
  UNDER_REVIEW: "#d97706", // amber
  APPROVED: "#16a34a", // green
  REJECTED: "#dc2626", // red
  DRAFT: "#64748b", // slate/gray
};

export const OfficerDashboardPage = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary>({
    totalFamilies: 0,
    totalMembers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  });

  const [schemesData, setSchemesData] = useState<SchemeMetric[]>([]);
  const [statusData, setStatusData] = useState<StatusMetric[]>([]);
  const [districtData, setDistrictData] = useState<DistrictMetric[]>([]);
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [sumRes, schemeRes, statRes, distRes, appRes] = await Promise.all([
          api.get("/dashboard/summary").catch(() => ({ data: {} })),
          api.get("/dashboard/applications-by-scheme").catch(() => ({ data: [] })),
          api.get("/dashboard/applications-by-status").catch(() => ({ data: [] })),
          api.get("/dashboard/families-by-district").catch(() => ({ data: [] })),
          api.get("/applications?limit=5").catch(() => ({ data: { items: [] } })),
        ]);

        if (sumRes.data) {
          setSummary({
            totalFamilies: sumRes.data.totalFamilies ?? 0,
            totalMembers: sumRes.data.totalMembers ?? 0,
            totalApplications: sumRes.data.totalApplications ?? 0,
            pendingApplications: sumRes.data.pendingApplications ?? 0,
            approvedApplications: sumRes.data.approvedApplications ?? 0,
            rejectedApplications: sumRes.data.rejectedApplications ?? 0,
          });
        }

        setSchemesData(Array.isArray(schemeRes.data) ? schemeRes.data : []);
        setStatusData(Array.isArray(statRes.data) ? statRes.data : []);
        setDistrictData(Array.isArray(distRes.data) ? distRes.data : []);

        const apps = appRes.data?.items || (Array.isArray(appRes.data) ? appRes.data : []);
        setRecentApps(apps.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load officer dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading government analytics and charts..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Analytics & Verification Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Officer Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time beneficiary records, scheme distribution, and application queue status across Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/officer/schemes")}
            className="text-xs font-semibold"
          >
            Manage Schemes
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/officer/applications")}
            className="text-xs font-semibold"
          >
            Review Applications Queue
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* 6 StatCards from /api/dashboard/summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total Families"
          value={summary.totalFamilies}
          accent="blue"
        />
        <StatCard
          label="Total Members"
          value={summary.totalMembers}
          accent="slate"
        />
        <StatCard
          label="Total Applications"
          value={summary.totalApplications}
          accent="blue"
        />
        <StatCard
          label="Pending Review"
          value={summary.pendingApplications}
          accent="amber"
        />
        <StatCard
          label="Approved"
          value={summary.approvedApplications}
          accent="emerald"
        />
        <StatCard
          label="Rejected"
          value={summary.rejectedApplications}
          accent="slate"
        />
      </div>

      {/* Charts Grid: Recharts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Bar Chart: Applications by Scheme */}
        <Card
          title="Applications by Scheme"
          subtitle="Total citizen demand per welfare scheme"
          className="shadow-sm"
        >
          <div className="h-72 w-full pt-2">
            {schemesData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No application data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={schemesData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                >
                  <XAxis
                    dataKey="schemeName"
                    stroke="#64748b"
                    fontSize={11}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 2: Pie Chart: Application Status Distribution */}
        <Card
          title="Application Status Distribution"
          subtitle="Breakdown across all 5 verification states"
          className="shadow-sm"
        >
          <div className="h-72 w-full pt-2">
            {statusData.length === 0 || statusData.every((s) => s.count === 0) ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No active applications in system.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                    }
                    labelLine={false}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_PIE_COLORS[entry.status] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: "11px", color: "#64748b" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 3: Bar Chart: Families by District */}
        <Card
          title="Families by District"
          subtitle="Geographic penetration across Gujarat administrative districts"
          className="shadow-sm lg:col-span-2"
        >
          <div className="h-64 w-full pt-2">
            {districtData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No district records registered.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={districtData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <XAxis dataKey="district" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#0891b2" radius={[6, 6, 0, 0]} name="Families" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Applications Table (Last 5) */}
      <Card
        title="Recent Submissions (Last 5)"
        subtitle="Incoming applications requiring review and verification"
        className="shadow-sm"
      >
        <Table
          data={recentApps}
          emptyMessage="No applications currently awaiting review."
          columns={[
            {
              key: "applicationId",
              header: "Application ID",
              render: (app) => (
                <Link
                  to={`/officer/applications/${app.applicationId || app._id}`}
                  className="font-mono text-xs font-bold text-blue-700 hover:underline"
                >
                  {app.applicationId}
                </Link>
              ),
            },
            {
              key: "scheme",
              header: "Scheme Name",
              render: (app) => {
                const name = typeof app.schemeId === "object" ? app.schemeId?.name : app.schemeId;
                return <span className="font-semibold text-slate-900 text-xs">{name || "—"}</span>;
              },
            },
            {
              key: "applicant",
              header: "Applicant",
              render: (app) => {
                const name = typeof app.applicantPersonId === "object" ? app.applicantPersonId?.name : "—";
                return <span className="text-xs text-slate-700">{name || "—"}</span>;
              },
            },
            {
              key: "district",
              header: "District",
              render: (app) => {
                const district = typeof app.familyId === "object" ? app.familyId?.district : "—";
                return <span className="text-xs text-slate-600">{district || "—"}</span>;
              },
            },
            {
              key: "status",
              header: "Status",
              render: (app) => <StatusBadge status={app.status} />,
            },
            {
              key: "submittedAt",
              header: "Submitted",
              render: (app) => (
                <span className="text-xs text-slate-500">
                  {app.submittedAt
                    ? new Date(app.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Action",
              render: (app) => (
                <Link to={`/officer/applications/${app.applicationId || app._id}`}>
                  <Button variant="secondary" className="py-1 px-2.5 text-xs">
                    Review &rarr;
                  </Button>
                </Link>
              ),
            },
          ]}
        />

        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
          <Link
            to="/officer/applications"
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            View All Applications &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
};
