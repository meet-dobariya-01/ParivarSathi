import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { CitizenLayout } from "../layouts/CitizenLayout";
import api from "../services/api";

type SchemeItem = {
  _id?: string;
  id?: string;
  name: string;
  department?: string;
  description?: string;
  benefitDescription?: string;
  requiredDocuments?: string[];
  isActive?: boolean;
};

export const SchemesListPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/schemes?active=true");
        setSchemes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load welfare schemes.");
      } finally {
        setLoading(false);
      }
    };

    void fetchSchemes();
  }, []);

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    schemes.forEach((s) => {
      if (s.department && s.department.trim()) {
        set.add(s.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [schemes]);

  // Filter schemes by search and department
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchesDept =
        selectedDepartment === "ALL" || s.department === selectedDepartment;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        (s.department && s.department.toLowerCase().includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        (s.benefitDescription && s.benefitDescription.toLowerCase().includes(term));

      return matchesDept && matchesSearch;
    });
  }, [schemes, selectedDepartment, searchTerm]);

  const content = (
    <div className="space-y-6">
      {/* Page Title & Search/Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Government Welfare Directory
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Active Welfare Schemes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Explore government assistance, education subsidies, health benefits, and farmer support.
          </p>
        </div>

        {isAuthenticated && (
          <Button
            variant="secondary"
            className="bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
            onClick={() => navigate("/find-benefits")}
          >
            🎯 Check My Family Eligibility
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Search Schemes
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by scheme name, keyword, or benefit..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Departments ({schemes.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Loading & Error States */}
      {loading ? (
        <LoadingSpinner label="Loading government schemes..." />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : null}

      {/* Empty State */}
      {!loading && !error && filteredSchemes.length === 0 ? (
        <EmptyState
          title="No Schemes Found"
          description="No welfare schemes match your search filters. Try clearing your search term or selecting another department."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm("");
            setSelectedDepartment("ALL");
          }}
        />
      ) : null}

      {/* Scheme Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredSchemes.map((scheme) => {
          const schemeId = scheme._id || scheme.id;
          const shortBenefit =
            scheme.benefitDescription ||
            scheme.description ||
            "Financial or welfare assistance provided by the department.";

          return (
            <Card
              key={schemeId}
              className="flex flex-col justify-between border-slate-200 shadow-sm transition hover:shadow-md hover:border-blue-300"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-block rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    {scheme.department || "Gujarat State"}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    ACTIVE
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                  {scheme.name}
                </h3>

                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Benefit Summary
                  </p>
                  <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                    {shortBenefit}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {scheme.requiredDocuments?.length
                    ? `${scheme.requiredDocuments.length} Documents Required`
                    : "Basic KYC Required"}
                </span>

                <Button
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs py-2"
                  onClick={() => navigate(`/schemes/${schemeId}`)}
                >
                  View Details &rarr;
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // If citizen is authenticated, render inside CitizenLayout; otherwise render with public navbar
  if (isAuthenticated) {
    return <CitizenLayout>{content}</CitizenLayout>;
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
              Citizen Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );
};
