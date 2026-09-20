import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { dummySchemeList } from '../api/client';
import { useToast } from '../context/ToastContext';
import PortalLayout from '../components/layout/PortalLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import { Layers, Plus, ToggleLeft, ToggleRight, Check, AlertTriangle } from 'lucide-react';

const OfficerSchemes = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newScheme, setNewScheme] = useState({
    scheme_id: '',
    name: '',
    name_gu: '',
    department: '',
    benefit_type: 'DIRECT_TRANSFER',
    benefit_amount: '',
    description: ''
  });

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/scheme');
      setSchemes(data || []);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setSchemes(dummySchemeList);
      showToast({
        type: 'info',
        title: 'Demo scheme registry loaded',
        message: 'Sample welfare schemes are visible while the government registry service is unavailable.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/scheme/${id}/toggle`);
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Scheme operational status toggled successfully.'
      });
      fetchSchemes();
    } catch (err) {
      setSchemes((prev) =>
        prev.map((scheme) =>
          scheme._id === id ? { ...scheme, is_active: !scheme.is_active } : scheme
        )
      );
      showToast({
        type: 'info',
        title: 'Demo status updated',
        message: 'The scheme status was toggled in the local preview model.'
      });
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/scheme', {
        ...newScheme,
        benefit_amount: Number(newScheme.benefit_amount) || 0
      });

      showToast({
        type: 'success',
        title: 'Scheme Created',
        message: `Scheme ${newScheme.name} added to state registry.`
      });

      setShowAddModal(false);
      setNewScheme({
        scheme_id: '',
        name: '',
        name_gu: '',
        department: '',
        benefit_type: 'DIRECT_TRANSFER',
        benefit_amount: '',
        description: ''
      });
      fetchSchemes();
    } catch (err) {
      const createdScheme = {
        _id: `demo_${Date.now()}`,
        ...newScheme,
        benefit_amount: Number(newScheme.benefit_amount) || 0,
        is_active: true,
        rules: [
          { rule_type: 'department', operator: '=', value: newScheme.department || 'General', description: 'Preview configuration' }
        ]
      };
      setSchemes((prev) => [createdScheme, ...prev]);
      setShowAddModal(false);
      setNewScheme({
        scheme_id: '',
        name: '',
        name_gu: '',
        department: '',
        benefit_type: 'DIRECT_TRANSFER',
        benefit_amount: '',
        description: ''
      });
      showToast({
        type: 'info',
        title: 'Demo scheme added',
        message: 'The new scheme has been added to the local demo registry.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.officerDashboard'), to: '/officer/dashboard' },
    { label: 'Manage Schemes' }
  ];

  return (
    <PortalLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
              <Layers size={24} className="text-gov-navy" />
              <span>Gujarat Welfare Schemes Directory & Rule Registry</span>
            </h1>
            <p className="text-xs text-gov-text-muted mt-0.5">
              Configure active departments, eligibility parameters, and monetary allocations.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add New Scheme
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white border border-gov-border rounded-md">
            <div className="w-10 h-10 border-4 border-gov-navy border-t-gov-saffron rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-gov-navy">Loading state scheme registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schemes.map((scheme) => (
              <Card
                key={scheme._id || scheme.scheme_id}
                title={scheme.name}
                subtitle={`${scheme.scheme_id} • ${scheme.department}`}
                action={
                  <Badge variant={scheme.is_active ? 'approved' : 'default'} size="sm">
                    {scheme.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                }
                bodyClassName="space-y-3 text-xs"
                footer={
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gov-green">
                      ₹{Number(scheme.benefit_amount || 0).toLocaleString('en-IN')} ({scheme.benefit_type?.replace('_', ' ')})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(scheme._id)}
                      className="text-xs font-bold text-gov-navy hover:underline flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-gov-navy rounded p-1"
                    >
                      {scheme.is_active ? (
                        <>
                          <ToggleRight size={18} className="text-gov-green" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={18} className="text-slate-400" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </div>
                }
              >
                {scheme.name_gu && (
                  <div className="font-gujarati text-xs text-gov-text-muted">
                    {scheme.name_gu}
                  </div>
                )}
                <p className="text-gov-text-muted leading-relaxed">
                  {scheme.description || scheme.benefit_summary || 'Comprehensive state financial benefit for qualified households.'}
                </p>

                {scheme.rules && scheme.rules.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-bold text-gov-navy text-[11px] block mb-1">
                      Configured Criteria Rules ({scheme.rules.length}):
                    </span>
                    <ul className="space-y-1 text-[11px] text-gov-text-muted list-disc list-inside">
                      {scheme.rules.map((rule, idx) => (
                        <li key={idx}>
                          {rule.rule_type}: {rule.operator} {rule.value} ({rule.description || rule.target_entity})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Scheme Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Register New Welfare Scheme"
          subtitle="Add scheme to Gujarat state unified eligibility evaluation registry"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Scheme Code / ID"
                placeholder="e.g. SCH-KMY-2026"
                required
                value={newScheme.scheme_id}
                onChange={(e) => setNewScheme({ ...newScheme, scheme_id: e.target.value })}
              />

              <Input
                label="Department"
                placeholder="e.g. Agriculture Department"
                required
                value={newScheme.department}
                onChange={(e) => setNewScheme({ ...newScheme, department: e.target.value })}
              />
            </div>

            <Input
              label="Scheme Name (English)"
              placeholder="e.g. Mukhyamantri Kisan Sahay Yojana"
              required
              value={newScheme.name}
              onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
            />

            <Input
              label="Scheme Name (Gujarati)"
              placeholder="દા.ત. મુખ્યમંત્રી કિસાન સહાય યોજના"
              value={newScheme.name_gu}
              onChange={(e) => setNewScheme({ ...newScheme, name_gu: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Benefit Type"
                required
                value={newScheme.benefit_type}
                onChange={(e) => setNewScheme({ ...newScheme, benefit_type: e.target.value })}
                options={[
                  { value: 'DIRECT_TRANSFER', label: 'Direct Benefit Transfer (DBT)' },
                  { value: 'SUBSIDY', label: 'Subsidy / Discount Voucher' },
                  { value: 'HEALTH_COVER', label: 'Cashless Healthcare Cover' },
                  { value: 'SCHOLARSHIP', label: 'Tuition & Fee Scholarship' }
                ]}
              />

              <Input
                label="Benefit Value (₹)"
                type="number"
                placeholder="e.g. 20000"
                required
                value={newScheme.benefit_amount}
                onChange={(e) => setNewScheme({ ...newScheme, benefit_amount: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-1.5">
                Summary Description
              </label>
              <textarea
                rows={3}
                required
                value={newScheme.description}
                onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                placeholder="Explain the objectives, target beneficiary groups, and disbursement schedule..."
                className="w-full text-xs rounded border border-gov-border p-2.5 bg-white text-gov-text outline-none focus-visible:ring-2 focus-visible:ring-gov-navy"
              />
            </div>

            <div className="pt-3 border-t border-gov-border flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
              >
                Register Scheme
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PortalLayout>
  );
};

export default OfficerSchemes;
