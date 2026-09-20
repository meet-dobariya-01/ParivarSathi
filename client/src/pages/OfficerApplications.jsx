import React, { useEffect, useState } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { FileText, CheckCircle2, XCircle, Clock, Filter, Eye, AlertCircle } from 'lucide-react';

const OfficerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Review Modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/application/all?status=${statusFilter}` : '/application/all';
      const { data } = await api.get(url);
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications for officer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleOpenReview = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status === 'SUBMITTED' ? 'UNDER_REVIEW' : app.status);
    setRemarks(app.remarks || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/application/${selectedApp._id}/review`, {
        status: newStatus,
        remarks
      });
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText className="text-emerald-400" size={28} /> Application Review Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Verify citizen eligibility and grant scheme approvals with official remarks.
          </p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} style={{ color: 'var(--text-dim)' }} />
          <select
            id="filter-application-status"
            className="input-field"
            style={{ width: '180px', padding: '8px 12px', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No applications match the selected criteria.
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '8px' }}>
          <div className="table-container">
            <table className="custom-table" id="officer-applications-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Family ID & District</th>
                  <th>Beneficiary Member</th>
                  <th>Applied Scheme</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      APP-{app._id.slice(-5).toUpperCase()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                        {app.family_id?.family_id || 'GJ-FAM-UNKNOWN'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {app.family_id?.district} (Inc: ₹{app.family_id?.annual_income?.toLocaleString('en-IN')})
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.applicant_person_id?.name || 'Applicant'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {app.applicant_person_id?.gender}, {app.applicant_person_id?.occupation || 'Citizen'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.scheme_id?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{app.scheme_id?.department}</div>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <button
                        id={`btn-review-${app._id}`}
                        onClick={() => handleOpenReview(app)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Eye size={13} /> Review / Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="modal-overlay" id="review-application-modal">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                Review Application APP-{selectedApp._id.slice(-5).toUpperCase()}
              </h3>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '20px', fontSize: '0.875rem' }}>
              <div><strong>Scheme:</strong> {selectedApp.scheme_id?.name}</div>
              <div><strong>Beneficiary:</strong> {selectedApp.applicant_person_id?.name}</div>
              <div><strong>Family ID:</strong> {selectedApp.family_id?.family_id} ({selectedApp.family_id?.district})</div>
            </div>

            <form onSubmit={handleSaveReview}>
              <div style={{ marginBottom: '16px' }}>
                <label className="label-text">Select Decision Status</label>
                <select
                  id="select-decision-status"
                  className="input-field"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="APPROVED">APPROVED ✓</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label-text">Officer Remarks</label>
                <textarea
                  id="input-officer-remarks"
                  className="input-field"
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Verified by District Officer. Land records and family income verified."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setSelectedApp(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" id="btn-save-decision" disabled={updating} className="btn btn-primary">
                  {updating ? 'Saving...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerApplications;
