import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatusBadge } from "../components/StatusBadge";
import { Table } from "../components/Table";
import api from "../services/api";

type ApplicationItem = {
  _id?: string;
  id?: string;
  applicationId: string;
  schemeId?: { _id?: string; name?: string; department?: string } | string;
  applicantPersonId?: { _id?: string; name?: string; gender?: string } | string;
  status: string;
  remarks?: string;
  submittedAt?: string;
};

export const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/applications/my");
        setApplications(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load applications.");
      } finally {
        setLoading(false);
      }
    };

    void fetchApplications();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading your scheme applications..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error} />
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Citizen Submissions
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track status, review officer feedback, and check benefit progress.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/find-benefits")}
        >
          + Apply for New Benefit
        </Button>
      </div>

      {!applications.length ? (
        <EmptyState
          title="No Applications Submitted Yet"
          description="You have not submitted any welfare applications. Find benefits tailored to your family and submit an online application."
          actionLabel="Find Eligible Schemes"
          onAction={() => navigate("/find-benefits")}
        />
      ) : (
        <Card
          title={`All Submitted Applications (${applications.length})`}
          subtitle="Real-time status updates from Gujarat Government reviewing officers"
          className="shadow-sm"
        >
          <Table
            data={applications}
            columns={[
              {
                key: "scheme",
                header: "Scheme",
                render: (item) => {
                  const schemeObj = typeof item.schemeId === "object" ? item.schemeId : null;
                  const schemeName = schemeObj?.name || String(item.schemeId || "Welfare Scheme");
                  const dept = schemeObj?.department;

                  return (
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{schemeName}</span>
                      {dept && (
                        <span className="text-[11px] text-slate-500">{dept}</span>
                      )}
                    </div>
                  );
                },
              },
              {
                key: "applicationId",
                header: "Application ID",
                render: (item) => (
                  <Link
                    to={`/applications/${item.applicationId || item._id}`}
                    className="font-mono text-xs font-bold text-blue-700 hover:underline"
                  >
                    {item.applicationId}
                  </Link>
                ),
              },
              {
                key: "submittedAt",
                header: "Submitted Date",
                render: (item) => (
                  <span className="text-xs text-slate-700">
                    {item.submittedAt
                      ? new Date(item.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (item) => <StatusBadge status={item.status} />,
              },
              {
                key: "remarks",
                header: "Officer Remarks",
                render: (item) => (
                  <span className="text-xs text-slate-600 max-w-xs block truncate" title={item.remarks || ""}>
                    {item.remarks ? `“${item.remarks}”` : "—"}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (item) => (
                  <Link to={`/applications/${item.applicationId || item._id}`}>
                    <Button variant="secondary" className="text-xs py-1.5 px-3">
                      View Details &rarr;
                    </Button>
                  </Link>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
};
