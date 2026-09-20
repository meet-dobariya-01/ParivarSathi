import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { dummyApplications } from '../api/client';
import { useToast } from '../context/ToastContext';
import PortalLayout from '../components/layout/PortalLayout';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import {
  CheckSquare, RefreshCw, CheckCircle2, XCircle,
  FileText, User, Calendar, Eye
} from 'lucide-react';

const OfficerApplications = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Review Dialog
  const [reviewingApp, setReviewingApp] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('APPROVED'); // 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
  const [remarks, setRemarks] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/officer/applications');
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching officer applications:', err);
      setApplications(dummyApplications);
      showToast({
        type: 'info',
        title: 'Demo Review Queue',
        message: 'Sample application records are shown for preview while the queue service is unavailable.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingApp) return;

    setSubmittingReview(true);
    try {
      await api.put(`/application/${reviewingApp._id}/review`, {
        status: reviewDecision,
        remarks: remarks || `Application ${reviewDecision.toLowerCase()} by officer.`
      });

      showToast({
        type: 'success',
        title: 'Review Completed',
        message: `Application marked as ${reviewDecision}.`
      });

      setReviewingApp(null);
      fetchApplications();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Review Failed',
        message: err.response?.data?.message || 'Failed to update application status'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (selectedStatus === 'ALL') return true;
    return app.status === selectedStatus;
  });

  const formatAppId = (id) => {
    if (!id) return 'APP-00000';
    return `APP-${id.slice(-6).toUpperCase()}`;
  };

  const getStatusVariant = (status) => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'UNDER_REVIEW') return 'under_review';
    if (status === 'SUBMITTED') return 'submitted';
    if (status === 'REJECTED') return 'rejected';
    return 'default';
  };

  const columns = [
    {
      header: 'App ID',
      accessor: '_id',
      render: (row) => (
        <span className="font-mono font-bold text-gov-navy text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {formatAppId(row._id)}
        </span>
      )
    },
    {
      header: 'Scheme Name',
      render: (row) => (
        <div>
          <div className="font-bold text-gov-navy text-xs sm:text-sm">
            {row.scheme_id?.name || 'Welfare Scheme'}
          </div>
          <div className="text-[11px] text-gov-text-muted">
            {row.scheme_id?.department}
          </div>
        </div>
      )
    },
    {
      header: 'Applicant & Family',
      render: (row) => (
        <div className="text-xs">
          <div className="font-bold text-gov-navy">
            {row.applicant_person_id?.name || 'Applicant'}
          </div>
          <div className="text-[11px] font-mono text-gov-text-muted">
            {row.family_id?.family_id || 'Family'}
          </div>
        </div>
      )
    },
    {
      header: 'District',
      render: (row) => (
        <span className="text-xs text-gov-text">
          {row.family_id?.district || 'Gujarat'}
        </span>
      )
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-xs text-gov-text-muted font-mono">
          {new Date(row.createdAt).toLocaleDateString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={getStatusVariant(row.status)} size="sm">
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Action',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setReviewingApp(row);
            setReviewDecision(row.status === 'APPROVED' ? 'APPROVED' : 'APPROVED');
            setRemarks(row.officer_remarks || '');
          }}
        >
          Review
        </Button>
      )
    }
  ];

  const breadcrumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.officerDashboard'), to: '/officer/dashboard' },
    { label: 'Application Queue' }
  ];

  return (
    <PortalLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
              <CheckSquare size={24} className="text-gov-navy" />
              <span>Citizen Applications Verification Queue</span>
            </h1>
            <p className="text-xs text-gov-text-muted mt-0.5">
              Review and certify citizen welfare applications submitted across Gujarat districts.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchApplications}
          >
            Refresh Queue
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-gov-navy ${
                selectedStatus === status
                  ? 'bg-gov-navy text-white'
                  : 'bg-white text-gov-text border border-gov-border hover:bg-slate-100'
              }`}
            >
              {status} {status !== 'ALL' && `(${applications.filter(a => a.status === status).length})`}
            </button>
          ))}
        </div>

        {/* Applications DataTable */}
        <DataTable
          columns={columns}
          data={filteredApps}
          keyField="_id"
          emptyMessage="No applications currently match the selected status filter."
        />
      </div>

      {/* Officer Review Modal Dialog */}
      {reviewingApp && (
        <Modal
          isOpen={Boolean(reviewingApp)}
          onClose={() => setReviewingApp(null)}
          title={`Review Application — ${formatAppId(reviewingApp._id)}`}
          subtitle={reviewingApp.scheme_id?.name}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-gov-border rounded space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-gov-navy">Applicant:</span>
                <span>{reviewingApp.applicant_person_id?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gov-navy">Family ID:</span>
                <span className="font-mono">{reviewingApp.family_id?.family_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gov-navy">Location:</span>
                <span>{reviewingApp.family_id?.taluka}, {reviewingApp.family_id?.district}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-1.5">
                Official Determination / Decision <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewDecision('APPROVED')}
                  className={`p-2.5 rounded border text-xs font-bold transition-colors ${
                    reviewDecision === 'APPROVED'
                      ? 'bg-green-700 text-white border-green-800'
                      : 'bg-white border-gov-border text-gov-text hover:bg-slate-50'
                  }`}
                >
                  Approve (મંજૂર)
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision('UNDER_REVIEW')}
                  className={`p-2.5 rounded border text-xs font-bold transition-colors ${
                    reviewDecision === 'UNDER_REVIEW'
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-white border-gov-border text-gov-text hover:bg-slate-50'
                  }`}
                >
                  Under Review
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision('REJECTED')}
                  className={`p-2.5 rounded border text-xs font-bold transition-colors ${
                    reviewDecision === 'REJECTED'
                      ? 'bg-red-700 text-white border-red-800'
                      : 'bg-white border-gov-border text-gov-text hover:bg-slate-50'
                  }`}
                >
                  Reject (નામંજૂર)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-1.5">
                Officer Remarks / Feedback to Citizen
              </label>
              <textarea
                rows={3}
                required
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="State basis of approval or grounds for rejection (e.g. Income certificate verified)..."
                className="w-full text-xs rounded border border-gov-border p-2.5 bg-white text-gov-text focus-visible:ring-2 focus-visible:ring-gov-navy outline-none"
              />
            </div>

            <div className="pt-3 border-t border-gov-border flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setReviewingApp(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submittingReview}
              >
                Submit Official Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PortalLayout>
  );
};

export default OfficerApplications;
