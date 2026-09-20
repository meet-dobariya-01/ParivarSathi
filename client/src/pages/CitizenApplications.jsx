import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { dummyApplications } from '../api/client';
import { useToast } from '../context/ToastContext';
import PortalLayout from '../components/layout/PortalLayout';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import {
  FileText, RefreshCw, CheckCircle2, Clock,
  Calendar, Award, User, ChevronRight, Eye
} from 'lucide-react';

const TRACKER_STEPS = [
  { key: 'SUBMITTED', title: 'Submitted' },
  { key: 'UNDER_REVIEW', title: 'Verified' },
  { key: 'APPROVED', title: 'Approved' },
  { key: 'DISBURSED', title: 'Benefit Released' }
];

const CitizenApplications = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/application/my');
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications(dummyApplications);
      showToast({
        type: 'info',
        title: 'Demo Applications Loaded',
        message: 'Sample application records are shown while the service is unavailable.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const formatAppId = (id) => {
    if (!id) return 'APP-00000';
    return `APP-${id.slice(-6).toUpperCase()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStepIndex = (status) => {
    if (status === 'SUBMITTED') return 1;
    if (status === 'UNDER_REVIEW') return 2;
    if (status === 'APPROVED') return 3;
    if (status === 'DISBURSED') return 4;
    return 1; // Default or Rejected
  };

  const getStatusVariant = (status) => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'UNDER_REVIEW') return 'under_review';
    if (status === 'SUBMITTED') return 'submitted';
    if (status === 'REJECTED') return 'rejected';
    return 'default';
  };

  // Applications DataTable columns
  const columns = [
    {
      header: t('applications.appId'),
      accessor: '_id',
      render: (row) => (
        <span className="font-mono font-bold text-gov-navy text-xs bg-blue-50 px-2 py-1 rounded border border-blue-200">
          {formatAppId(row._id)}
        </span>
      )
    },
    {
      header: t('applications.scheme'),
      render: (row) => (
        <div>
          <div className="font-bold text-gov-navy text-xs sm:text-sm">
            {row.scheme_id?.name || 'Welfare Scheme'}
          </div>
          <div className="text-[11px] text-gov-teal uppercase font-semibold">
            {row.scheme_id?.department}
          </div>
        </div>
      )
    },
    {
      header: t('applications.applicant'),
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-gov-text">
          <User size={13} className="text-gov-text-muted shrink-0" />
          <span>{row.applicant_person_id?.name || 'Household Head'}</span>
        </div>
      )
    },
    {
      header: t('applications.submittedDate'),
      render: (row) => (
        <span className="text-xs text-gov-text-muted font-mono">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      header: t('applications.status'),
      render: (row) => (
        <Badge variant={getStatusVariant(row.status)} size="sm">
          {t(`applications.status${row.status}`) || row.status}
        </Badge>
      )
    },
    {
      header: 'Tracker / Details',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedApp(row)}
          className="text-xs font-bold text-gov-navy hover:text-gov-saffron inline-flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-gov-navy rounded p-1"
        >
          <Eye size={14} />
          <span>Track Status</span>
        </button>
      )
    }
  ];

  const breadcrumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.myApplications') }
  ];

  return (
    <PortalLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
              <FileText size={24} className="text-gov-navy" aria-hidden="true" />
              <span>{t('applications.title')}</span>
            </h1>
            <p className="text-xs text-gov-text-muted mt-0.5">
              {t('applications.subtitle')}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchApplications}
          >
            {t('applications.refresh')}
          </Button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white border border-gov-border rounded-md">
            <div className="w-10 h-10 border-4 border-gov-navy border-t-gov-saffron rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-gov-navy">
              Retrieving live application tracking records...
            </p>
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t('applications.noApplications')}
            description={t('applications.noApplicationsDesc')}
            actionText={t('applications.findBenefitsBtn')}
            actionHref="/find-schemes"
          />
        ) : (
          <div className="space-y-6">
            <DataTable
              columns={columns}
              data={applications}
              keyField="_id"
              zebra={true}
              mobileCardView={true}
            />
          </div>
        )}
      </div>

      {/* Visual Application Tracker Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Application Tracker — ${formatAppId(selectedApp._id)}`}
          subtitle={selectedApp.scheme_id?.name}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs text-gov-text">
            {/* Visual Step Tracker (GIGW Compliant Stepper Bar) */}
            <div className="p-5 bg-slate-50 border border-gov-border rounded-md">
              <div className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-6 text-center">
                Live Verification & Disbursement Progress
              </div>

              {selectedApp.status === 'REJECTED' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-center text-red-800 space-y-1">
                  <div className="font-bold text-sm">Application Rejected by Reviewing Authority</div>
                  <div>See officer feedback below for specific discrepancy details.</div>
                </div>
              ) : (
                <div className="flex items-center justify-between relative px-2">
                  {/* Connecting Track Line */}
                  <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-300 -z-0"></div>
                  <div
                    className="absolute left-6 top-4 h-0.5 bg-gov-green transition-all duration-500 -z-0"
                    style={{
                      width: `${((getStepIndex(selectedApp.status) - 1) / (TRACKER_STEPS.length - 1)) * 100}%`
                    }}
                  ></div>

                  {TRACKER_STEPS.map((step, idx) => {
                    const stepNum = idx + 1;
                    const currentStepNum = getStepIndex(selectedApp.status);
                    const isPassed = stepNum <= currentStepNum;
                    const isCurrent = stepNum === currentStepNum;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                            isPassed
                              ? 'bg-gov-green text-white ring-2 ring-gov-green ring-offset-2'
                              : 'bg-white text-slate-400 border-2 border-slate-300'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 size={16} /> : stepNum}
                        </div>
                        <span className={`text-[11px] mt-2 font-semibold text-center whitespace-nowrap ${
                          isCurrent ? 'text-gov-navy font-bold' : isPassed ? 'text-gov-green' : 'text-slate-400'
                        }`}>
                          {t(`applications.trackerStep${stepNum}`) || step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Application Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-white border border-gov-border rounded space-y-1.5">
                <div className="text-gov-text-muted font-bold">Applicant Beneficiary:</div>
                <div className="font-bold text-gov-navy text-sm">
                  {selectedApp.applicant_person_id?.name}
                </div>
                <div className="text-gov-text-muted">
                  Occupation: {selectedApp.applicant_person_id?.occupation || 'Dependent'}
                </div>
              </div>

              <div className="p-3.5 bg-white border border-gov-border rounded space-y-1.5">
                <div className="text-gov-text-muted font-bold">Submission Timestamp:</div>
                <div className="font-mono text-gov-text">
                  {new Date(selectedApp.createdAt).toLocaleString('en-IN')}
                </div>
                <div className="text-gov-text-muted">
                  Current Status: <Badge variant={getStatusVariant(selectedApp.status)} size="sm">{selectedApp.status}</Badge>
                </div>
              </div>
            </div>

            {/* Officer Remarks Block */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded space-y-1 text-xs">
              <div className="font-bold text-gov-navy">
                {t('applications.officerRemarks')}:
              </div>
              <p className="text-gov-text leading-relaxed italic">
                {selectedApp.officer_remarks || selectedApp.remarks || 'Application under routine scrutiny by Block Development Officer.'}
              </p>
            </div>

            <div className="pt-3 border-t border-gov-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)}>
                Close Tracker
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PortalLayout>
  );
};

export default CitizenApplications;
