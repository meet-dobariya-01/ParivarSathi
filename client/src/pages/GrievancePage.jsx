import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import PortalLayout from '../components/layout/PortalLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { AlertCircle, Send, CheckCircle2, Shield } from 'lucide-react';

const GrievancePage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    familyId: '',
    category: 'SCHEME_DISPUTE',
    description: ''
  });

  const [submittedToken, setSubmittedToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const token = `GRV-GJ-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedToken(token);
      setSubmitting(false);
      showToast({
        type: 'success',
        title: 'Grievance Registered',
        message: `Your grievance token is ${token}. It has been forwarded to the District Nodal Officer.`
      });
    }, 600);
  };

  return (
    <PortalLayout breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.grievance') }]}>
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gov-navy flex items-center justify-center gap-2">
            <AlertCircle size={26} className="text-gov-saffron" />
            <span>Public Grievance Redressal Portal</span>
          </h1>
          <p className="text-xs text-gov-text-muted">
            Lodge grievances regarding scheme delay, application status, or family registry discrepancy.
          </p>
        </div>

        {submittedToken ? (
          <Card className="text-center p-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 text-gov-green flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-bold text-gov-navy">
              Grievance Registered Successfully
            </h2>
            <p className="text-xs text-gov-text-muted max-w-md mx-auto">
              Your concern has been acknowledged and assigned to the District Welfare Officer. You will receive SMS alerts as your grievance is processed.
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded max-w-xs mx-auto">
              <div className="text-[11px] text-gov-text-muted font-bold">Grievance Tracking Number:</div>
              <div className="text-xl font-mono font-extrabold text-gov-navy mt-0.5">{submittedToken}</div>
            </div>
            <Button variant="primary" size="sm" onClick={() => setSubmittedToken(null)}>
              Lodge Another Grievance
            </Button>
          </Card>
        ) : (
          <Card
            title="Lodge New Grievance"
            subtitle="Government of Gujarat Citizen Redressal Mechanism"
          >
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input
                label="Complainant Name"
                placeholder="e.g. Rajesh Patel"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Mobile"
                  placeholder="10-digit mobile"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
                <Input
                  label="Unified Family ID (If known)"
                  placeholder="e.g. GJ-FAM-XXXXXXXX"
                  value={formData.familyId}
                  onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                />
              </div>

              <Select
                label="Grievance Category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { value: 'SCHEME_DISPUTE', label: 'Scheme Eligibility & Benefit Dispute' },
                  { value: 'DBT_DELAY', label: 'Direct Benefit Transfer (DBT) Payment Delay' },
                  { value: 'FAMILY_REGISTRY', label: 'Family ID Data Rectification / Member Inclusion' },
                  { value: 'OFFICER_REJECTION', label: 'Appeal Against Application Rejection' },
                  { value: 'OTHER', label: 'Other Administrative Query' }
                ]}
              />

              <div>
                <label className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-1.5">
                  Detailed Description of Issue <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide complete facts, dates, application numbers, and details of the grievance..."
                  className="w-full text-xs rounded border border-gov-border p-3 bg-white text-gov-text focus-visible:ring-2 focus-visible:ring-gov-navy outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-gov-border rounded text-[11px] text-gov-text-muted flex items-start gap-2">
                <Shield size={14} className="text-gov-teal shrink-0 mt-0.5" />
                <span>
                  Under Gujarat Citizen Charter guidelines, grievances are reviewed and addressed within 15 working days.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="saffron"
                  size="md"
                  loading={submitting}
                  icon={Send}
                >
                  Submit Grievance
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default GrievancePage;
