import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Table } from "../components/Table";
import { useFamily } from "../hooks/useFamily";

const calculateAge = (dateOfBirth?: string | Date) => {
  if (!dateOfBirth) return "—";

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "—";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return `${Math.max(0, age)} yrs`;
};

export const CitizenFamilyPage = () => {
  const navigate = useNavigate();
  const { family, loading, error, refresh } = useFamily();

  if (loading) {
    return <LoadingSpinner label="Loading your family profile details..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error} />
        <Button variant="secondary" onClick={() => void refresh()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!family) {
    return (
      <EmptyState
        title="No Family Profile Found"
        description="You have not created or linked a family profile yet. Create your family to manage members, review household demographics, and discover eligible welfare schemes."
        actionLabel="Create Family"
        onAction={() => navigate("/family/new")}
      />
    );
  }

  const members = family.members ?? [];
  const headName =
    family.familyHeadPersonId?.name ||
    members.find((m) => m.isHead || m.relationship === "HEAD")?.person?.name ||
    "—";

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Citizen Household
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Family
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            className="border border-slate-300 font-medium"
            onClick={() => navigate("/family/members")}
          >
            Manage Members
          </Button>
          <Button
            variant="secondary"
            className="bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100"
            onClick={() => navigate("/family/members?action=add")}
          >
            + Add Member
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/family/edit")}
          >
            Edit Family
          </Button>
        </div>
      </div>

      {/* Detail Card: Family ID, Head, District, Taluka, Village, Annual Income, Member count */}
      <Card
        title="Household Details"
        subtitle="Registered family information and location"
        className="shadow-sm"
      >
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Family ID
            </p>
            <p className="mt-1 font-mono text-base font-bold text-blue-700">
              {family.familyId || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Head of Family
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">
              {headName}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              District
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {family.district || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Taluka
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {family.taluka || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Village
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {family.village || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Annual Income
            </p>
            <p className="mt-1 text-base font-bold text-emerald-700">
              ₹{Number(family.annualIncome ?? 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Member Count
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">
              {members.length} {members.length === 1 ? "Member" : "Members"}
            </p>
          </div>

          {family.address && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Residential Address
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {family.address}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Members Table: Name, Relationship, Age, Gender, Occupation, Education */}
      <Card
        title="Family Members"
        subtitle="All active verified members included in this family record"
        className="shadow-sm"
      >
        <Table
          data={members}
          emptyMessage="No members listed in this family yet."
          columns={[
            {
              key: "name",
              header: "Name",
              render: (member) => (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {member.person?.name || "—"}
                  </span>
                  {member.isHead && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      HEAD
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "relationship",
              header: "Relationship",
              render: (member) => (
                <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {member.relationship || "—"}
                </span>
              ),
            },
            {
              key: "age",
              header: "Age",
              render: (member) => (
                <span className="text-sm font-medium text-slate-700">
                  {calculateAge(member.person?.dateOfBirth)}
                </span>
              ),
            },
            {
              key: "gender",
              header: "Gender",
              render: (member) => (
                <span className="capitalize text-sm text-slate-700">
                  {member.person?.gender ? member.person.gender.toLowerCase() : "—"}
                </span>
              ),
            },
            {
              key: "occupation",
              header: "Occupation",
              render: (member) => (
                <span className="text-sm text-slate-700">
                  {member.person?.occupation || "—"}
                </span>
              ),
            },
            {
              key: "education",
              header: "Education",
              render: (member) => (
                <span className="text-sm text-slate-700">
                  {member.person?.education || "—"}
                </span>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
