import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Award, CheckCircle2, XCircle, Sparkles, Send, FileText, UserCheck, AlertTriangle } from 'lucide-react';

const FindSchemes = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application Modal state
  const [applyingScheme, setApplyingScheme] = useState(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchEligibleSchemes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/eligibility/my-family');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching scheme eligibility:', err);
      setError(err.response?.data?.message || 'Failed to evaluate family eligibility.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleSchemes();
  }, []);

  const handleApplyClick = (scheme) => {
    setApplyingScheme(scheme);
    if (scheme.qualifying_members && scheme.qualifying_members.length > 0) {
      setSelectedApplicantId(scheme.qualifying_members[0].person_id);
    }
    setRemarks('');
    setSuccessMsg('');
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!selectedApplicantId) {
      alert('Please select an eligible family member.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/application/apply', {
        scheme_id: applyingScheme.scheme_id,
        applicant_person_id: selectedApplicantId,
        remarks
      });
      setSuccessMsg(`Application for ${applyingScheme.name} submitted successfully! Status: SUBMITTED`);
      setTimeout(() => {
        setApplyingScheme(null);
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '40px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Evaluating Gujarat Government Scheme eligibility for your family...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '36px' }}>
          <AlertTriangle size={48} style={{ color: 'var(--accent-orange)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Family Profile Needed</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <a href="/dashboard" className="btn btn-primary" id="btn-goto-family-profile">
            Register / View Family Profile
          </a>
        </div>
      </div>
    );
  }

  const eligibleSchemes = data?.eligible_schemes || [];
  const notEligibleSchemes = data?.not_eligible_schemes || [];

  return (
    <div style={{ maxWidth: '1180px', margin: '32px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={16} /> Rule-Based Engine
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginTop: '4px' }}>
            Benefits for Family: <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{data?.family_id}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '4px' }}>
            Our eligibility engine evaluated {data?.total_active_schemes} schemes. Your household currently qualifies for {eligibleSchemes.length} scheme(s).
          </p>
        </div>

        <button
          id="btn-re-evaluate"
          onClick={fetchEligibleSchemes}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          Re-evaluate
        </button>
      </div>

      {/* Eligible Schemes Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <CheckCircle2 size={22} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
            Eligible Schemes ({eligibleSchemes.length})
          </h2>
        </div>

        {eligibleSchemes.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No schemes currently match your family's profile.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {eligibleSchemes.map((scheme) => (
              <div
                key={scheme.scheme_id}
                id={`scheme-card-${scheme.scheme_id}`}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '3px solid var(--primary)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {scheme.department}
                    </span>
                    <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                      ✓ Eligible
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    {scheme.name}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5' }}>
                    {scheme.description}
                  </p>

                  {/* Benefit */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    marginBottom: '14px'
                  }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary-light)', fontWeight: 700 }}>
                      Benefit
                    </div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                      {scheme.benefit_description || 'Direct Financial Assistance'}
                    </div>
                  </div>

                  {/* Why eligible / Matched Rules */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Why Eligible:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {scheme.matched_rules?.map((rule, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: '#a7f3d0', marginBottom: '4px' }}>
                          <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '3px' }} />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Documents */}
                  {scheme.required_documents && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
                      <FileText size={13} />
                      <span><strong>Documents:</strong> {scheme.required_documents}</span>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <button
                  id={`btn-apply-${scheme.scheme_id}`}
                  onClick={() => handleApplyClick(scheme)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  <Send size={15} /> Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ineligible Schemes Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <XCircle size={22} style={{ color: 'var(--accent-rose)' }} />
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
            Other Active Schemes (Currently Not Eligible) ({notEligibleSchemes.length})
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {notEligibleSchemes.map((scheme) => (
            <div
              key={scheme.scheme_id}
              className="glass-panel"
              style={{ padding: '20px', opacity: 0.75 }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {scheme.department}
              </div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                {scheme.name}
              </h4>

              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fca5a5', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Criteria Not Satisfied:
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {scheme.failed_rules?.map((rule, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: '#f87171', marginBottom: '3px' }}>
                      <XCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Apply Modal */}
      {applyingScheme && (
        <div className="modal-overlay" id="apply-scheme-modal">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
                Apply for {applyingScheme.name}
              </h3>
              <button
                onClick={() => setApplyingScheme(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {successMsg ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', padding: '16px', color: '#34d399', textAlign: 'center' }}>
                <CheckCircle2 size={28} style={{ margin: '0 auto 8px' }} />
                <div>{successMsg}</div>
              </div>
            ) : (
              <form onSubmit={submitApplication}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label-text">Select Qualifying Family Member</label>
                  <select
                    id="select-applicant-member"
                    className="input-field"
                    value={selectedApplicantId}
                    onChange={(e) => setSelectedApplicantId(e.target.value)}
                    required
                  >
                    {applyingScheme.qualifying_members?.map((m) => (
                      <option key={m.person_id} value={m.person_id} style={{ background: '#0f172a' }}>
                        {m.name} {m.occupation ? `(${m.occupation})` : ''} {m.age ? `- Age ${m.age}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label-text">Required Documents Reminder</label>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    {applyingScheme.required_documents || 'Standard Identity Proof'}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label className="label-text">Applicant Remarks (Optional)</label>
                  <textarea
                    id="input-applicant-remarks"
                    className="input-field"
                    rows="3"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Enrolled in 1st year B.Sc, applying with college admission receipt."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setApplyingScheme(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-confirm-apply"
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? 'Submitting...' : 'Confirm & Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindSchemes;
