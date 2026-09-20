import React, { useEffect, useState } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { FileText, Calendar, Info, RefreshCw } from 'lucide-react';

const CitizenApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/application/my');
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Format short application ID like APP-10293
  const formatAppId = (id) => {
    if (!id) return 'APP-00000';
    return `APP-${id.slice(-5).toUpperCase()}`;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText className="text-emerald-400" size={28} /> My Applications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track the live review status and officer decisions for your family's scheme enrollments.
          </p>
        </div>

        <button
          id="btn-refresh-applications"
          onClick={fetchApplications}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading your applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <FileText size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Applications Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
            Your family has not applied for any government schemes yet. Explore eligible schemes tailored for your household.
          </p>
          <a href="/find-schemes" className="btn btn-primary" id="btn-explore-schemes">
            Find Benefits for My Family ⭐
          </a>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '8px' }}>
          <div className="table-container">
            <table className="custom-table" id="applications-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Scheme</th>
                  <th>Applicant Member</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Officer Remarks</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} id={`application-row-${app._id}`}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {formatAppId(app._id)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {app.scheme_id?.name || 'Government Scheme'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {app.scheme_id?.department}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{app.applicant_person_id?.name || 'Household'}</span>
                      {app.applicant_person_id?.occupation && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          {app.applicant_person_id.occupation}
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} />
                        {new Date(app.submitted_at || app.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      {app.remarks ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          <Info size={13} style={{ flexShrink: 0, color: 'var(--accent-cyan)' }} />
                          <span>{app.remarks}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Pending review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenApplications;
