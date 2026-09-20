import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, Home, FileText, CheckCircle2, Clock, XCircle,
  TrendingUp, MapPin, Layers
} from 'lucide-react';

const STATUS_COLORS = {
  APPROVED: '#10b981',
  UNDER_REVIEW: '#f59e0b',
  SUBMITTED: '#06b6d4',
  REJECTED: '#f43f5e',
  DRAFT: '#64748b'
};

const OfficerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficerStats = async () => {
      try {
        const { data } = await api.get('/officer/stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching officer statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficerStats();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Government Officer Analytics...
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalFamilies: 0,
    totalMembers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  };

  const applicationsByScheme = stats?.charts?.applicationsByScheme || [];
  const statusDistribution = stats?.charts?.statusDistribution || [];
  const familiesByDistrict = stats?.charts?.familiesByDistrict || [];

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 20px' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingUp className="text-emerald-400" size={32} /> Government Officer Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Gujarat State Beneficiary & Family ID Unified Analytics Overview
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Total Families */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent-cyan)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Families</span>
            <Home size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>
            {kpis.totalFamilies}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Registered Households</div>
        </div>

        {/* Total Members */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--primary-light)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Members</span>
            <Users size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>
            {kpis.totalMembers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Active Beneficiaries</div>
        </div>

        {/* Total Applications */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a855f7' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Applications</span>
            <FileText size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>
            {kpis.totalApplications}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Processed & Incoming</div>
        </div>

        {/* Pending Applications */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent-orange)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending</span>
            <Clock size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: '#fbbf24' }}>
            {kpis.pendingApplications}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Awaiting Officer Review</div>
        </div>

        {/* Approved Applications */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--primary)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Approved</span>
            <CheckCircle2 size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: '#34d399' }}>
            {kpis.approvedApplications}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Benefit Distributed</div>
        </div>

        {/* Rejected Applications */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent-rose)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Rejected</span>
            <XCircle size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '8px', color: '#f87171' }}>
            {kpis.rejectedApplications}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Ineligible Submissions</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Chart 1: Applications by Scheme */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Applications by Scheme</h3>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            {applicationsByScheme.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                No application data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationsByScheme} margin={{ top: 10, right: 20, left: -20, bottom: 40 }}>
                  <XAxis
                    dataKey="schemeName"
                    stroke="#94a3b8"
                    fontSize={11}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="applications" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Application Status Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <FileText size={18} style={{ color: 'var(--accent-orange)' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Application Status Distribution</h3>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            {statusDistribution.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                No applications submitted yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || '#8884d8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Families by District */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <MapPin size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Families Enrolled by Gujarat District</h3>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            {familiesByDistrict.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                No district records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={familiesByDistrict} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                  <XAxis dataKey="district" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="families" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
