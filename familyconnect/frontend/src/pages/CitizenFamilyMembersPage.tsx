import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { Input } from "../components/Input";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { Table } from "../components/Table";
import { useFamily, type FamilyMember } from "../hooks/useFamily";

const defaultMemberForm = {
  name: "",
  relationship: "SON",
  dateOfBirth: "",
  gender: "MALE",
  mobile: "",
  occupation: "",
  education: "",
};

const relationshipOptions = [
  { value: "SPOUSE", label: "Spouse" },
  { value: "SON", label: "Son" },
  { value: "DAUGHTER", label: "Daughter" },
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "OTHER", label: "Other" },
];

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const calculateAge = (dateOfBirth?: string | Date) => {
  if (!dateOfBirth) return "—";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "—";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${Math.max(0, age)} yrs`;
};

const formatDateForInput = (dateValue?: string | Date) => {
  if (!dateValue) return "";
  try {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const CitizenFamilyMembersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { family, loading, error, refresh, addMember, updateMember, deactivateMember } = useFamily();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(defaultMemberForm);
  const [modalError, setModalError] = useState<string | null>(null);
  const [savingAdd, setSavingAdd] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [savingInline, setSavingInline] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Deactivation confirmation modal state
  const [deactivatingMember, setDeactivatingMember] = useState<{ id: string; name: string } | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Check URL query parameters for auto-opening modal (e.g. ?action=add)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "add") {
      setIsAddModalOpen(true);
    }
  }, [location.search]);

  if (loading) {
    return <LoadingSpinner label="Loading family members..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error} />
        <Button variant="secondary" onClick={() => void refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!family) {
    return (
      <EmptyState
        title="Family Not Created"
        description="Please create your family record before you can view and manage family members."
        actionLabel="Create Family"
        onAction={() => navigate("/family/new")}
      />
    );
  }

  const members: FamilyMember[] = family.members ?? [];

  // Handler for Add Modal submission
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingAdd(true);
    setModalError(null);

    try {
      if (!addForm.name.trim()) throw new Error("Member name is required");
      if (!addForm.dateOfBirth) throw new Error("Date of birth is required");

      const payload = {
        name: addForm.name.trim(),
        relationship: addForm.relationship,
        dateOfBirth: addForm.dateOfBirth,
        gender: addForm.gender,
        mobile: addForm.mobile.trim(),
        occupation: addForm.occupation.trim(),
        education: addForm.education.trim(),
      };

      await addMember(payload);
      setIsAddModalOpen(false);
      setAddForm(defaultMemberForm);
      setActionSuccess("New family member added successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setSavingAdd(false);
    }
  };

  // Handler to start inline edit
  const handleStartEdit = (member: FamilyMember) => {
    const id = member._id || member.person?._id || "";
    setEditingId(id);
    setInlineError(null);
    setEditDraft({
      name: member.person?.name || "",
      relationship: member.relationship || "OTHER",
      dateOfBirth: formatDateForInput(member.person?.dateOfBirth),
      gender: member.person?.gender || "MALE",
      mobile: member.person?.mobile || "",
      occupation: member.person?.occupation || "",
      education: member.person?.education || "",
    });
  };

  // Handler for saving inline edit
  const handleSaveInline = async (memberId: string) => {
    setSavingInline(true);
    setInlineError(null);

    try {
      if (!editDraft.name?.trim()) throw new Error("Name is required");

      const cleanedDraft: Record<string, unknown> = {
        name: editDraft.name.trim(),
        relationship: editDraft.relationship || "OTHER",
        gender: editDraft.gender || "MALE",
        mobile: editDraft.mobile ? editDraft.mobile.trim() : "",
        occupation: editDraft.occupation ? editDraft.occupation.trim() : "",
        education: editDraft.education ? editDraft.education.trim() : "",
      };
      if (editDraft.dateOfBirth) {
        cleanedDraft.dateOfBirth = editDraft.dateOfBirth;
      }

      await updateMember(memberId, cleanedDraft);
      setEditingId(null);
      setEditDraft({});
      setActionSuccess("Member updated successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setInlineError(err instanceof Error ? err.message : "Failed to update member");
    } finally {
      setSavingInline(false);
    }
  };

  // Handler for confirmed deactivation
  const handleConfirmDeactivate = async () => {
    if (!deactivatingMember) return;
    setDeactivating(true);

    try {
      await deactivateMember(deactivatingMember.id);
      setDeactivatingMember(null);
      setActionSuccess(`${deactivatingMember.name} has been removed from the active family list.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setInlineError(err instanceof Error ? err.message : "Failed to deactivate member");
      setDeactivatingMember(null);
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Household Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Family Members
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, update member details inline, or deactivate members of your household.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/family")}>
            Back to Family
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setModalError(null);
              setIsAddModalOpen(true);
            }}
          >
            + Add New Member
          </Button>
        </div>
      </div>

      {/* Success notification banner */}
      {actionSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-sm transition">
          ✓ {actionSuccess}
        </div>
      )}

      {/* Inline error banner */}
      {inlineError && <ErrorBanner message={inlineError} />}

      {/* Main Members Card with Table */}
      <Card
        title={`All Active Members (${members.length})`}
        subtitle="Manage and edit member details inline"
        className="shadow-sm"
      >
        <Table
          data={members}
          emptyMessage="No members currently registered in this family."
          columns={[
            {
              key: "name",
              header: "Name",
              render: (member) => {
                const memberId = member._id || member.person?._id || "";
                const isEditing = editingId === memberId;

                if (isEditing) {
                  return (
                    <div className="min-w-[130px]">
                      <input
                        type="text"
                        value={editDraft.name || ""}
                        onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                        className="w-full rounded-lg border border-blue-400 bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Full Name"
                        required
                      />
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">
                      {member.person?.name || "—"}
                    </span>
                    {member.isHead && (
                      <span className="mt-0.5 inline-flex w-fit items-center rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                        HEAD
                      </span>
                    )}
                  </div>
                );
              },
            },
            {
              key: "relationship",
              header: "Relationship",
              render: (member) => {
                const memberId = member._id || member.person?._id || "";
                const isEditing = editingId === memberId;

                if (isEditing) {
                  if (member.isHead) {
                    return <span className="text-xs font-bold text-blue-700">HEAD</span>;
                  }
                  return (
                    <select
                      value={editDraft.relationship || "OTHER"}
                      onChange={(e) => setEditDraft({ ...editDraft, relationship: e.target.value })}
                      className="rounded-lg border border-blue-400 bg-white px-2 py-1 text-xs font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {relationshipOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                }

                return (
                  <span className="inline-block rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {member.relationship || "—"}
                  </span>
                );
              },
            },
            {
              key: "age",
              header: "Age / DOB",
              render: (member) => {
                const memberId = member._id || member.person?._id || "";
                const isEditing = editingId === memberId;

                if (isEditing) {
                  return (
                    <div className="min-w-[125px]">
                      <input
                        type="date"
                        value={editDraft.dateOfBirth || ""}
                        onChange={(e) => setEditDraft({ ...editDraft, dateOfBirth: e.target.value })}
                        className="w-full rounded-lg border border-blue-400 bg-white px-1.5 py-1 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  );
                }

                return (
                  <div className="text-xs">
                    <p className="font-medium text-slate-800">
                      {calculateAge(member.person?.dateOfBirth)}
                    </p>
                    {member.person?.dateOfBirth && (
                      <p className="text-[11px] text-slate-400">
                        {formatDateForInput(member.person.dateOfBirth)}
                      </p>
                    )}
                  </div>
                );
              },
            },
            {
              key: "gender",
              header: "Gender",
              render: (member) => {
                const memberId = member._id || member.person?._id || "";
                const isEditing = editingId === memberId;

                if (isEditing) {
                  return (
                    <select
                      value={editDraft.gender || "MALE"}
                      onChange={(e) => setEditDraft({ ...editDraft, gender: e.target.value })}
                      className="rounded-lg border border-blue-400 bg-white px-2 py-1 text-xs font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {genderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                }

                return (
                  <span className="capitalize text-xs text-slate-700">
                    {member.person?.gender ? member.person.gender.toLowerCase() : "—"}
                  </span>
                );
              },
            },
            {
              key: "occupation",
              header: "Occupation",
              render: (member) => {
                const memberId = member._id || member.person?._id || "";
                const isEditing = editingId === memberId;

                if (isEditing) {
                  return (
                    <input
                      type="text"
                      value={editDraft.occupation || ""}
                      onChange={(e) => setEditDraft({ ...editDraft, occupation: e.target.value })}
                      className="w-full rounded-lg border border-blue-400 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Occupation"
                    />
                  );
                }

                return <span className="text-xs text-slate-700">{member.person?.occupation || "—"}</span>;
              },
            },
            {
              key: "education",
              header: "Education",
              render: (member) => {
                const memberId = member._id || member.person?._id || "";
                const isEditing = editingId === memberId;

                if (isEditing) {
                  return (
                    <input
                      type="text"
                      value={editDraft.education || ""}
                      onChange={(e) => setEditDraft({ ...editDraft, education: e.target.value })}
                      className="w-full rounded-lg border border-blue-400 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Education"
                    />
                  );
                }

                return <span className="text-xs text-slate-700">{member.person?.education || "—"}</span>;
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (member) => {
                const memberId = member._id || member.person?._id || "";
                const isEditing = editingId === memberId;
                const isHead = member.isHead || member.relationship === "HEAD";

                if (isEditing) {
                  return (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={savingInline}
                        onClick={() => handleSaveInline(memberId)}
                        className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white shadow hover:bg-green-700 disabled:opacity-50"
                      >
                        {savingInline ? "..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft({});
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(member)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 hover:border-blue-200"
                    >
                      Edit
                    </button>
                    {!isHead ? (
                      <button
                        type="button"
                        onClick={() =>
                          setDeactivatingMember({
                            id: memberId,
                            name: member.person?.name || "this member",
                          })
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-600 hover:text-white hover:border-red-600"
                      >
                        Deactivate
                      </button>
                    ) : null}
                  </div>
                );
              },
            },
          ]}
        />
      </Card>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title="Add New Family Member"
        onClose={() => setIsAddModalOpen(false)}
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="e.g. Ramesh Patel"
              required
            />

            <Select
              label="Relationship to Head"
              value={addForm.relationship}
              onChange={(e) => setAddForm({ ...addForm, relationship: e.target.value })}
              required
            >
              {relationshipOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Input
              label="Date of Birth"
              type="date"
              value={addForm.dateOfBirth}
              onChange={(e) => setAddForm({ ...addForm, dateOfBirth: e.target.value })}
              required
            />

            <Select
              label="Gender"
              value={addForm.gender}
              onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
              required
            >
              {genderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Input
              label="Mobile Number (Optional)"
              type="tel"
              value={addForm.mobile}
              onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
              placeholder="10-digit mobile"
            />

            <Input
              label="Occupation (Optional)"
              value={addForm.occupation}
              onChange={(e) => setAddForm({ ...addForm, occupation: e.target.value })}
              placeholder="e.g. Student, Farmer, Teacher"
            />

            <div className="sm:col-span-2">
              <Input
                label="Education (Optional)"
                value={addForm.education}
                onChange={(e) => setAddForm({ ...addForm, education: e.target.value })}
                placeholder="e.g. 10th Pass, Graduate, Post Graduate"
              />
            </div>
          </div>

          {modalError && <ErrorBanner message={modalError} />}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={savingAdd}>
              {savingAdd ? "Adding Member..." : "Save Member"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={Boolean(deactivatingMember)}
        title="Confirm Deactivation"
        onClose={() => setDeactivatingMember(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-slate-900">
              {deactivatingMember?.name}
            </span>
            ? This will remove them from the active family roster and affect benefit calculations.
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            ⚠️ Note: Family heads cannot be deactivated while other active members exist.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeactivatingMember(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deactivating}
              onClick={handleConfirmDeactivate}
            >
              {deactivating ? "Deactivating..." : "Yes, Deactivate"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
