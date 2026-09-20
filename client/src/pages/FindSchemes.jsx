import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api, { dummyEligibilityData } from '../api/client';
import { useToast } from '../context/ToastContext';
import PortalLayout from '../components/layout/PortalLayout';
import SchemeFilterSidebar from '../components/portal/SchemeFilterSidebar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import {
  CheckCircle2, XCircle, Info, Send,
  HelpCircle, UserCheck, AlertTriangle, ArrowRight, Search
} from 'lucide-react';

const FindSchemes = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [error, setError] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    maxIncome: 1000000,
    eligibleOnly: false,
    searchQuery: ''
  });

  // Modals State
  const [activeWhyModal, setActiveWhyModal] = useState(null); // scheme object for criteria inspection
  const [applyingScheme, setApplyingScheme] = useState(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEligibleSchemes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/eligibility/my-family');
      setEligibilityData(res.data);
    } catch (err) {
      console.error('Error fetching scheme eligibility:', err);
      setEligibilityData(dummyEligibilityData);
      setError('Demo scheme evaluation loaded for preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleSchemes();
  }, []);

  const handleOpenApply = (scheme) => {
    setApplyingScheme(scheme);
    if (scheme.qualifying_members && scheme.qualifying_members.length > 0) {
      setSelectedApplicantId(scheme.qualifying_members[0].person_id);
    } else {
      setSelectedApplicantId('');
    }
    setRemarks('');
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedApplicantId) {
      showToast({
        type: 'warning',
        title: 'Applicant Required',
        message: 'Please select a qualified family member as the applicant.'
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/application/apply', {
        scheme_id: applyingScheme.scheme_id,
        applicant_person_id: selectedApplicantId,
        remarks
      });

      showToast({
        type: 'success',
        title: 'Application Submitted',
        message: `Successfully applied for ${applyingScheme.name}. Tracking ID generated.`
      });

      setApplyingScheme(null);
      fetchEligibleSchemes();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.response?.data?.message || 'Failed to submit scheme application'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Combine and normalize schemes with status
  const allProcessedSchemes = useMemo(() => {
    const list = [];

    if (eligibilityData?.eligible_schemes) {
      eligibilityData.eligible_schemes.forEach((s) => {
        list.push({
          ...s,
          eligibilityStatus: 'ELIGIBLE',
          badgeVariant: 'eligible'
        });
      });
    }

    if (eligibilityData?.not_eligible_schemes) {
      eligibilityData.not_eligible_schemes.forEach((s) => {
        list.push({
          ...s,
          eligibilityStatus: 'NOT_ELIGIBLE',
          badgeVariant: 'not_eligible'
        });
      });
    }

    return list;
  }, [eligibilityData]);

  // Apply filters
  const filteredSchemes = useMemo(() => {
    return allProcessedSchemes.filter((item) => {
      if (filters.eligibleOnly && item.eligibilityStatus !== 'ELIGIBLE') {
        return false;
      }
      if (filters.category && item.department && !item.department.toLowerCase().includes(filters.category.toLowerCase()) && !item.name.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [allProcessedSchemes, filters]);

  const eligibleCount = allProcessedSchemes.filter(s => s.eligibilityStatus === 'ELIGIBLE').length;

  const breadcrumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.findSchemes') }
  ];

  return (
    <PortalLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
              <Search size={22} className="text-gov-saffron" aria-hidden="true" />
              <span>{t('schemes.title')}</span>
            </h1>
            <p className="text-xs text-gov-text-muted mt-0.5">
              {t('schemes.subtitle')}
            </p>
          </div>
        </div>

        {/* Error or Profile Notice */}
        {error && (
          <div className="bg-amber-50 border-l-4 border-gov-saffron p-4 rounded-md border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-gov-saffron shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-gov-navy">Family Profile Action Required</h3>
                <p className="text-xs text-gov-text-muted mt-0.5">{error}</p>
                <div className="mt-2">
                  <a href="/dashboard">
                    <Button variant="primary" size="sm">Go to Family Dashboard</Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Left Filter Sidebar + Right Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar (3 cols on desktop) */}
          <div className="lg:col-span-4">
            <SchemeFilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters({ category: '', gender: '', maxIncome: 1000000, eligibleOnly: false, searchQuery: '' })}
              totalResults={allProcessedSchemes.length}
              eligibleCount={eligibleCount}
            />
          </div>

          {/* Right Schemes Results (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="py-20 text-center space-y-3 bg-white border border-gov-border rounded-md">
                <div className="w-10 h-10 border-4 border-gov-navy border-t-gov-saffron rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold text-gov-navy">
                  Evaluating Gujarat Government Scheme eligibility for your household...
                </p>
              </div>
            ) : filteredSchemes.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No schemes match current filters"
                description="Try clearing or adjusting your filters to see more active Gujarat Government welfare programs."
                actionText="Reset All Filters"
                onAction={() => setFilters({ category: '', gender: '', maxIncome: 1000000, eligibleOnly: false, searchQuery: '' })}
              />
            ) : (
              <div className="space-y-4">
                {filteredSchemes.map((scheme) => {
                  const isEligible = scheme.eligibilityStatus === 'ELIGIBLE';

                  return (
                    <Card
                      key={scheme.scheme_id}
                      className={`transition-all border-l-4 ${
                        isEligible ? 'border-l-gov-green' : 'border-l-slate-300'
                      }`}
                      bodyClassName="p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={scheme.badgeVariant} size="sm">
                              {isEligible ? t('schemes.statusEligible') : t('schemes.statusNotEligible')}
                            </Badge>
                            <span className="text-[11px] font-mono text-gov-text-muted">
                              {scheme.scheme_id}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] font-semibold text-gov-teal uppercase tracking-wider">
                              {scheme.department}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-gov-navy leading-snug">
                            {scheme.name}
                          </h3>

                          {scheme.name_gu && (
                            <div className="font-gujarati text-xs text-gov-text-muted">
                              {scheme.name_gu}
                            </div>
                          )}

                          <p className="text-xs text-gov-text-muted leading-relaxed">
                            {scheme.benefit_summary || scheme.benefit_description}
                          </p>

                          {/* Eligible Qualifying Members Chip */}
                          {isEligible && scheme.qualifying_members && scheme.qualifying_members.length > 0 && (
                            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-gov-navy">
                              <span className="font-bold">{t('schemes.qualifyingMembers')}:</span>
                              {scheme.qualifying_members.map((m) => (
                                <span
                                  key={m.person_id}
                                  className="bg-green-50 text-gov-green border border-green-200 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1"
                                >
                                  <UserCheck size={12} />
                                  {m.name} ({m.relationship})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right Actions */}
                        <div className="shrink-0 flex flex-col sm:items-end gap-2 pt-2 sm:pt-0">
                          {isEligible ? (
                            <Button
                              variant="success"
                              size="sm"
                              icon={Send}
                              onClick={() => handleOpenApply(scheme)}
                            >
                              {t('schemes.applyNow')}
                            </Button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveWhyModal(scheme)}
                              className="text-xs font-semibold text-gov-navy hover:underline flex items-center gap-1 p-1 focus-visible:ring-1 focus-visible:ring-gov-navy rounded"
                            >
                              <HelpCircle size={14} className="text-gov-saffron" />
                              <span>{t('schemes.whyNotEligible')}</span>
                            </button>
                          )}

                          {isEligible && (
                            <button
                              type="button"
                              onClick={() => setActiveWhyModal(scheme)}
                              className="text-[11px] text-gov-text-muted hover:text-gov-navy hover:underline"
                            >
                              View Criteria Breakdown
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* "Why?" Criteria Inspection Modal */}
      {activeWhyModal && (
        <Modal
          isOpen={Boolean(activeWhyModal)}
          onClose={() => setActiveWhyModal(null)}
          title={activeWhyModal.name}
          subtitle={`Scheme ID: ${activeWhyModal.scheme_id} • Rules Evaluation Report`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-gov-border rounded">
              <div className="font-bold text-gov-navy mb-1">{t('schemes.benefitAmount')}:</div>
              <p className="text-gov-text-muted">{activeWhyModal.benefit_summary || activeWhyModal.benefit_description}</p>
            </div>

            {activeWhyModal.eligibilityStatus === 'ELIGIBLE' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-gov-green font-bold">
                  <CheckCircle2 size={16} />
                  <span>Household Satisfies All Criteria</span>
                </div>
                <p className="text-gov-text-muted leading-relaxed">
                  Every eligibility rule configured by the Department (including income ceiling, district residency, age requirements, and member demographics) has passed successfully.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-red-700 font-bold">
                  <XCircle size={16} />
                  <span>{t('schemes.failedCriteria')}:</span>
                </div>
                <ul className="space-y-1.5 text-red-800 list-disc list-inside bg-red-50 p-3 rounded border border-red-200">
                  {activeWhyModal.reasons && activeWhyModal.reasons.length > 0 ? (
                    activeWhyModal.reasons.map((r, i) => (
                      <li key={i} className="leading-snug">{r}</li>
                    ))
                  ) : (
                    <li>Criteria requirements (such as age, gender, occupation, or district) are currently unmet by registered household members.</li>
                  )}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-gov-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setActiveWhyModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Apply Scheme Modal Dialog */}
      {applyingScheme && (
        <Modal
          isOpen={Boolean(applyingScheme)}
          onClose={() => setApplyingScheme(null)}
          title={t('schemes.applyModalTitle')}
          subtitle={`Applying for: ${applyingScheme.name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
            <div>
              <label htmlFor="applicant-select" className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-1.5">
                {t('schemes.selectApplicant')} <span className="text-red-600">*</span>
              </label>
              <select
                id="applicant-select"
                required
                value={selectedApplicantId}
                onChange={(e) => setSelectedApplicantId(e.target.value)}
                className="w-full text-sm rounded border border-gov-border p-2.5 bg-white text-gov-text focus-visible:ring-2 focus-visible:ring-gov-navy"
              >
                <option value="" disabled>-- Select Qualifying Family Member --</option>
                {applyingScheme.qualifying_members?.map((m) => (
                  <option key={m.person_id} value={m.person_id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gov-text-muted">
                Only family members who meet the specific eligibility rules for this scheme are listed.
              </p>
            </div>

            <div>
              <label htmlFor="apply-remarks" className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-1.5">
                {t('schemes.remarksLabel')}
              </label>
              <textarea
                id="apply-remarks"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional notes or certificate reference numbers (e.g. Income Certificate No)..."
                className="w-full text-xs rounded border border-gov-border p-2.5 bg-white text-gov-text focus-visible:ring-2 focus-visible:ring-gov-navy outline-none"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-gov-navy text-[11px] leading-relaxed">
              <strong>Declaration:</strong> I hereby apply on behalf of the selected member and consent to verification of household demographic data under ParivarSathi.
            </div>

            <div className="pt-3 border-t border-gov-border flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setApplyingScheme(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="sm"
                loading={submitting}
                icon={Send}
              >
                {t('schemes.submitApplication')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PortalLayout>
  );
};

export default FindSchemes;
