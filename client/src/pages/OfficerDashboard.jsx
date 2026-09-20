import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { dummyOfficerStats } from '../api/client';
import PortalLayout from '../components/layout/PortalLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, Home, FileText, CheckCircle2, Clock, XCircle,
  TrendingUp, MapPin, Layers, RefreshCw
} from 'lucide-react';

const STATUS_COLORS = {
  APPROVED: '#138808',
  UNDER_REVIEW: '#ff9933',
  SUBMITTED: '#1a3a6b',
  REJECTED: '#b91c1c',
  DRAFT: '#64748b'
};

const OfficerDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOfficerStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/officer/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching officer statistics:', err);
      setStats(dummyOfficerStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerStats();
  }, []);

  const kpis = stats?.kpis || {
    totalFamilies: 12,
    totalMembers: 45,
    totalApplications: 25,
    pendingApplications: 11,
    approvedApplications: 8,
    rejectedApplications: 4
  };

  const applicationsByScheme = stats?.charts?.applicationsByScheme || [
    { name: 'Kisan Sahay', count: 9 },
    { name: 'Vhali Dikri', count: 6 },
    { name: 'MAA Health', count: 5 },
    { name: 'MYSY Scholarship', count: 3 },
    { name: 'Old Age Pension', count: 2 }
  ];

  const statusDistribution = stats?.charts?.statusDistribution || [
    { name: 'APPROVED', count: 8 },
    { name: 'UNDER_REVIEW', count: 5 },
    { name: 'SUBMITTED', count: 6 },
    { name: 'REJECTED', count: 4 },
    { name: 'DRAFT', count: 2 }
  ];

  const familiesByDistrict = stats?.charts?.familiesByDistrict || [
    { name: 'Surendranagar', count: 4 },
    { name: 'Rajkot', count: 3 },
    { name: 'Ahmedabad', count: 3 },
    { name: 'Bhavnagar', count: 2 }
  ];

  const breadcrumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.officerDashboard') }
  ];

  return (
    <PortalLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Officer Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gov-saffron">
                Government Administrative Console
              </span>
              <Badge variant="officer" size="sm">Officer Clearance</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-0.5">
              State Beneficiary Analytics & Verification Desk
            </h1>
            <p className="text-xs text-gov-text-muted">
              Real-time monitoring of household registrations, district distributions, and pending application queues.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchOfficerStats}
          >
            Refresh Data
          </Button>
        </div>

        {/* 6 Key Performance Indicators (KPI Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-md border border-gov-border shadow-gov-sm">
            <div className="text-gov-navy mb-1"><Home size={20} /></div>
            <div className="text-xs text-gov-text-muted font-bold uppercase tracking-wider">Registered Families</div>
            <div className="text-2xl font-mono font-extrabold text-gov-navy mt-1">{kpis.totalFamilies}</div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gov-border shadow-gov-sm">
            <div className="text-gov-teal mb-1"><Users size={20} /></div>
            <div className="text-xs text-gov-text-muted font-bold uppercase tracking-wider">Total Persons</div>
            <div className="text-2xl font-mono font-extrabold text-gov-teal mt-1">{kpis.totalMembers}</div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gov-border shadow-gov-sm">
            <div className="text-gov-navy mb-1"><FileText size={20} /></div>
            <div className="text-xs text-gov-text-muted font-bold uppercase tracking-wider">Total Applications</div>
            <div className="text-2xl font-mono font-extrabold text-gov-navy mt-1">{kpis.totalApplications}</div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gov-border shadow-gov-sm">
            <div className="text-gov-saffron mb-1"><Clock size={20} /></div>
            <div className="text-xs text-gov-text-muted font-bold uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-mono font-extrabold text-gov-saffron mt-1">{kpis.pendingApplications}</div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gov-border shadow-gov-sm">
            <div className="text-gov-green mb-1"><CheckCircle2 size={20} /></div>
            <div className="text-xs text-gov-text-muted font-bold uppercase tracking-wider">Approved</div>
            <div className="text-2xl font-mono font-extrabold text-gov-green mt-1">{kpis.approvedApplications}</div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gov-border shadow-gov-sm">
            <div className="text-red-700 mb-1"><XCircle size={20} /></div>
            <div className="text-xs text-gov-text-muted font-bold uppercase tracking-wider">Rejected</div>
            <div className="text-2xl font-mono font-extrabold text-red-700 mt-1">{kpis.rejectedApplications}</div>
          </div>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications by Scheme */}
          <Card title="Applications by Scheme" subtitle="Departmental distribution of citizen filings">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationsByScheme} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4b5563' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d9dee7', borderRadius: '6px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#1a3a6b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Status Distribution */}
          <Card title="Application Review Status" subtitle="Breakdown of decisions across current cycle">
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d9dee7', borderRadius: '6px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default OfficerDashboard;
