import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { dummyFamilyData } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PortalLayout from '../components/layout/PortalLayout';
import FamilyIdCard from '../components/portal/FamilyIdCard';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import AddMemberModal from '../components/modals/AddMemberModal';
import EditFamilyModal from '../components/modals/EditFamilyModal';
import {
  Users, PlusCircle, Sparkles, AlertCircle, CheckCircle2,
  Trash2, UserPlus, ArrowRight, ShieldCheck, Home
} from 'lucide-react';

const CitizenDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditFamily, setShowEditFamily] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);

  // Delete Member Confirm Dialog
  const [deletingMembershipId, setDeletingMembershipId] = useState(null);

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/family/my');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching family data:', err);
      setData(dummyFamilyData);
      showToast({
        type: 'info',
        title: 'Demo Data Loaded',
        message: 'Showing sample household information while the registry service is unavailable.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  // Profile Completeness Calculation
  const calculateCompleteness = (family, members = []) => {
    let score = 30; // base for having a family ID
    if (family?.address && family?.district && family?.taluka) score += 20;
    if (family?.annual_income > 0) score += 20;
    if (members.length > 1) score += 15;
    if (members.some(m => m.person_id?.aadhar_last_4)) score += 15;
    return Math.min(score, 100);
  };

  const handleCreateFamily = async (formData) => {
    try {
      await api.post('/family/create', formData);
      showToast({
        type: 'success',
        title: 'Family Registry Created',
        message: 'Your Gujarat Unified Household ID has been generated successfully.'
      });
      setShowCreateFamily(false);
      fetchFamilyData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.response?.data?.message || 'Failed to create family'
      });
      throw err;
    }
  };

  const handleUpdateFamily = async (formData) => {
    try {
      await api.put('/family/update', formData);
      showToast({
        type: 'success',
        title: 'Family Updated',
        message: 'Household income and residence details updated successfully.'
      });
      setShowEditFamily(false);
      fetchFamilyData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update family'
      });
      throw err;
    }
  };

  const handleAddMember = async (formData) => {
    try {
      await api.post('/family/member', formData);
      showToast({
        type: 'success',
        title: 'Member Added',
        message: `${formData.name} added to family registry.`
      });
      fetchFamilyData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to Add Member',
        message: err.response?.data?.message || 'Error adding member'
      });
      throw err;
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deletingMembershipId) return;
    try {
      await api.delete(`/family/member/${deletingMembershipId}`);
      showToast({
        type: 'success',
        title: 'Member Deactivated',
        message: 'Family member removed from active household registry.'
      });
      setDeletingMembershipId(null);
      fetchFamilyData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Deactivation Failed',
        message: err.response?.data?.message || 'Cannot deactivate member'
      });
    }
  };

  // Breadcrumbs
  const breadcrumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.dashboard') }
  ];

  if (loading) {
    return (
      <PortalLayout breadcrumbs={breadcrumbs}>
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gov-navy border-t-gov-saffron rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gov-navy">
            Loading official household registry...
          </p>
        </div>
      </PortalLayout>
    );
  }

  // If citizen has NO family yet -> Friendly government onboarding card
  if (!data?.hasFamily) {
    return (
      <PortalLayout breadcrumbs={breadcrumbs}>
        <div className="max-w-xl mx-auto py-8">
          <Card className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-gov-navy flex items-center justify-center mx-auto mb-4 border border-blue-200">
              <Home size={32} />
            </div>

            <h1 className="text-2xl font-bold text-gov-navy mb-2">
              {t('dashboard.noFamilyTitle')}, {user.person?.name || 'Citizen'}
            </h1>
            <p className="text-xs text-gov-text-muted leading-relaxed mb-6">
              {t('dashboard.noFamilyDesc')}
            </p>

            <Button
              id="btn-create-family-init"
              variant="saffron"
              size="lg"
              icon={PlusCircle}
              onClick={() => setShowCreateFamily(true)}
            >
              {t('dashboard.createFamilyBtn')}
            </Button>
          </Card>

          {/* Create Family Modal */}
          <EditFamilyModal
            isOpen={showCreateFamily}
            onClose={() => setShowCreateFamily(false)}
            onSubmitFamily={handleCreateFamily}
            isCreate={true}
          />
        </div>
      </PortalLayout>
    );
  }

  const { family, members = [] } = data;
  const head = family.family_head_person_id;
  const completeness = calculateCompleteness(family, members);

  // Household Members Table Columns
  const memberColumns = [
    {
      header: t('dashboard.thName'),
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-gov-navy flex items-center gap-1.5">
            <span>{row.person_id?.name}</span>
            {row.is_head && (
              <Badge variant="citizen" size="sm">Head</Badge>
            )}
          </div>
          {row.person_id?.aadhar_last_4 && (
            <div className="text-[11px] font-mono text-gov-text-muted">
              Aadhaar: •••• •••• {row.person_id.aadhar_last_4}
            </div>
          )}
        </div>
      )
    },
    {
      header: t('dashboard.thRelation'),
      accessor: 'relationship',
      render: (row) => (
        <span className="font-semibold text-xs text-gov-navy uppercase">
          {row.relationship}
        </span>
      )
    },
    {
      header: t('dashboard.thAgeGender'),
      render: (row) => (
        <span className="text-xs">
          {calculateAge(row.person_id?.date_of_birth)} yrs • {row.person_id?.gender}
        </span>
      )
    },
    {
      header: t('dashboard.thOccupation'),
      render: (row) => (
        <span className="text-xs font-medium text-gov-text">
          {row.person_id?.occupation || '—'}
        </span>
      )
    },
    {
      header: t('dashboard.thEducation'),
      render: (row) => (
        <span className="text-xs text-gov-text-muted">
          {row.person_id?.education?.replace('_', ' ') || '—'}
        </span>
      )
    },
    {
      header: t('dashboard.thActions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.is_head ? (
            <button
              type="button"
              onClick={() => setDeletingMembershipId(row._id)}
              title="Deactivate Member"
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-red-600 rounded px-1"
            >
              <Trash2 size={13} />
              <span>{t('dashboard.remove')}</span>
            </button>
          ) : (
            <span className="text-[11px] text-gov-text-muted italic">Protected</span>
          )}
        </div>
      )
    }
  ];

  return (
    <PortalLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gov-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy">
              {t('dashboard.title')}
            </h1>
            <p className="text-xs text-gov-text-muted mt-0.5">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="btn-add-member-top"
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => setShowAddMember(true)}
            >
              {t('dashboard.addMember')}
            </Button>
          </div>
        </div>

        {/* 1. Official Unified Family ID Card */}
        <FamilyIdCard
          family={family}
          head={head}
          onEditFamily={() => setShowEditFamily(true)}
          onFindBenefits={() => navigate('/find-schemes')}
        />

        {/* 2. Profile Completeness Progress Bar */}
        <div className="bg-white p-4 rounded-md border border-gov-border shadow-gov-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex justify-between text-xs font-bold text-gov-navy">
              <span>{t('dashboard.completeness')}</span>
              <span className="text-gov-green font-mono">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gov-green h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
                role="progressbar"
                aria-valuenow={completeness}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>
          <div className="text-[11px] text-gov-text-muted sm:max-w-xs">
            {completeness === 100
              ? '✓ Full household profile verified for all scheme rules.'
              : 'Add missing Aadhaar or member details to maximize scheme discovery.'}
          </div>
        </div>

        {/* 3. "Eligible but not enrolled" Alert Strip */}
        <div className="bg-[#f0fdf4] border-l-4 border-gov-green p-4 rounded-md border border-green-200 shadow-gov-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-gov-green shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-bold text-sm text-gov-navy">
                {t('dashboard.unlockedAlert')}
              </h3>
              <p className="text-xs text-gov-text-muted mt-0.5">
                {t('dashboard.unlockedAlertDesc')}
              </p>
            </div>
          </div>

          <Link to="/find-schemes" className="shrink-0">
            <Button variant="success" size="sm">
              <span>{t('dashboard.viewSchemesBtn')}</span>
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>

        {/* 4. Household Members Section */}
        <section aria-labelledby="members-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="members-heading" className="text-base font-bold text-gov-navy flex items-center gap-2">
                <Users size={18} aria-hidden="true" />
                <span>{t('dashboard.membersTitle')}</span>
                <span className="text-xs font-normal text-gov-text-muted">({members.length} active)</span>
              </h2>
              <p className="text-xs text-gov-text-muted">
                {t('dashboard.membersSubtitle')}
              </p>
            </div>

            <Button
              id="btn-add-member-table"
              variant="secondary"
              size="sm"
              icon={PlusCircle}
              onClick={() => setShowAddMember(true)}
            >
              {t('dashboard.addMember')}
            </Button>
          </div>

          {/* Members Table */}
          {members.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('dashboard.noMembers')}
              description="Add your spouse, children, and dependent family members to automatically check their individual scheme eligibility."
              actionText={t('dashboard.addMember')}
              onAction={() => setShowAddMember(true)}
            />
          ) : (
            <DataTable
              columns={memberColumns}
              data={members}
              keyField="_id"
              zebra={true}
              mobileCardView={true}
            />
          )}
        </section>
      </div>

      {/* Add Member Stepper Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAddMember={handleAddMember}
      />

      {/* Edit Family Details Modal */}
      <EditFamilyModal
        isOpen={showEditFamily}
        onClose={() => setShowEditFamily(false)}
        initialData={family}
        onSubmitFamily={handleUpdateFamily}
        isCreate={false}
      />

      {/* Confirm Member Deactivation Dialog */}
      <Modal
        isOpen={Boolean(deletingMembershipId)}
        onClose={() => setDeletingMembershipId(null)}
        title="Confirm Member Deactivation"
        subtitle="This action will remove the member from active household welfare evaluations."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-gov-text">
          <p className="leading-relaxed">
            {t('dashboard.confirmRemove')}
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
            <strong>Notice:</strong> Historic applications submitted under this member will remain archived in government logs for audit purposes.
          </div>

          <div className="pt-3 border-t border-gov-border flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setDeletingMembershipId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDeactivate}>
              Deactivate Member
            </Button>
          </div>
        </div>
      </Modal>
    </PortalLayout>
  );
};

export default CitizenDashboard;
