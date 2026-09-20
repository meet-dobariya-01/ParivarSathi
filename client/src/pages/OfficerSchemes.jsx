import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Layers, PlusCircle, ToggleLeft, ToggleRight, Trash2, Plus, ShieldAlert } from 'lucide-react';

const OfficerSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ruleModalScheme, setRuleModalScheme] = useState(null);

  const [schemeForm, setSchemeForm] = useState({
    name: '',
    department: 'Education Department',
    description: '',
    benefit_description: '',
    required_documents: 'Income Certificate, Residence Certificate'
  });

  const [ruleForm, setRuleForm] = useState({
    rule_scope: 'FAMILY',
    field_name: 'annual_income',
    operator: '<=',
    value: '200000'
  });

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/scheme');
      setSchemes(data);
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      await api.post('/scheme', schemeForm);
      setShowCreateModal(false);
      setSchemeForm({
        name: '',
        department: 'Education Department',
        description: '',
        benefit_description: '',
        required_documents: 'Income Certificate, Residence Certificate'
      });
      fetchSchemes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create scheme');
    }
  };

  const handleToggleActive = async (schemeId) => {
    try {
      await api.patch(`/scheme/${schemeId}/toggle`);
      fetchSchemes();
    } catch (err) {
      alert('Failed to toggle scheme status');
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/scheme/${ruleModalScheme._id}/rules`, ruleForm);
      setRuleModalScheme(null);
      fetchSchemes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add rule');
    }
  };

  const handleDeleteRule = async (schemeId, ruleId) => {
    try {
      await api.delete(`/scheme/rules/${ruleId}`);
      fetchSchemes();
    } catch (err) {
      alert('Failed to delete rule');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers className="text-emerald-400" size={28} /> Government Schemes & Rules
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Configure eligibility criteria and manage welfare schemes across all departments.
          </p>
        </div>

        <button
          id="btn-create-scheme-open"
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem' }}
        >
          <PlusCircle size={16} /> New Scheme
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading schemes...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {schemes.map((scheme) => (
            <div
              key={scheme._id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: scheme.is_active ? '4px solid var(--primary)' : '4px solid var(--text-dim)',
                opacity: scheme.is_active ? 1 : 0.6
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {scheme.department}
                  </span>
                  <button
                    id={`btn-toggle-scheme-${scheme._id}`}
                    onClick={() => handleToggleActive(scheme._id)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {scheme.is_active ? (
                      <><ToggleRight size={16} style={{ color: '#34d399' }} /> Active</>
                    ) : (
                      <><ToggleLeft size={16} style={{ color: '#f87171' }} /> Inactive</>
                    )}
                  </button>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                  {scheme.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                  {scheme.description}
                </p>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.8rem' }}>
                  <strong>Benefit:</strong> {scheme.benefit_description}
                </div>

                {/* Rules Section */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Eligibility Rules ({scheme.rules?.length || 0})
                    </span>
                    <button
                      id={`btn-add-rule-open-${scheme._id}`}
                      onClick={() => setRuleModalScheme(scheme)}
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                    >
                      <Plus size={12} /> Add Rule
                    </button>
                  </div>

                  {(!scheme.rules || scheme.rules.length === 0) ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      No rules configured (Open to all families)
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {scheme.rules.map((rule) => (
                        <div
                          key={rule._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace'
                          }}
                        >
                          <div>
                            <span style={{ color: rule.rule_scope === 'FAMILY' ? 'var(--accent-cyan)' : 'var(--primary-light)', fontWeight: 700, marginRight: '6px' }}>
                              [{rule.rule_scope}]
                            </span>
                            <span>{rule.field_name} {rule.operator} {rule.value}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteRule(scheme._id, rule._id)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                            title="Delete Rule"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Scheme Modal */}
      {showCreateModal && (
        <div className="modal-overlay" id="create-scheme-modal">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Create New Government Scheme</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreateScheme}>
              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Scheme Name</label>
                <input
                  id="input-scheme-name"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Gujarat Youth Skill Voucher"
                  value={schemeForm.name}
                  onChange={(e) => setSchemeForm({ ...schemeForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Department</label>
                <input
                  id="input-scheme-dept"
                  type="text"
                  className="input-field"
                  value={schemeForm.department}
                  onChange={(e) => setSchemeForm({ ...schemeForm, department: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Description</label>
                <textarea
                  id="input-scheme-desc"
                  className="input-field"
                  rows="2"
                  value={schemeForm.description}
                  onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Benefit Description</label>
                <input
                  id="input-scheme-benefit"
                  type="text"
                  className="input-field"
                  placeholder="e.g. ₹5,000 allowance per term"
                  value={schemeForm.benefit_description}
                  onChange={(e) => setSchemeForm({ ...schemeForm, benefit_description: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label-text">Required Documents</label>
                <input
                  id="input-scheme-docs"
                  type="text"
                  className="input-field"
                  value={schemeForm.required_documents}
                  onChange={(e) => setSchemeForm({ ...schemeForm, required_documents: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" id="btn-submit-scheme" className="btn btn-primary">Create Scheme</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {ruleModalScheme && (
        <div className="modal-overlay" id="add-rule-modal">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Add Rule to {ruleModalScheme.name}</h3>
              <button onClick={() => setRuleModalScheme(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleAddRule}>
              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Rule Scope</label>
                <select
                  id="select-rule-scope"
                  className="input-field"
                  value={ruleForm.rule_scope}
                  onChange={(e) => {
                    const scope = e.target.value;
                    setRuleForm({
                      ...ruleForm,
                      rule_scope: scope,
                      field_name: scope === 'FAMILY' ? 'annual_income' : 'age'
                    });
                  }}
                >
                  <option value="FAMILY">FAMILY (Household)</option>
                  <option value="MEMBER">MEMBER (Individual)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Field Name</label>
                {ruleForm.rule_scope === 'FAMILY' ? (
                  <select
                    id="select-rule-field"
                    className="input-field"
                    value={ruleForm.field_name}
                    onChange={(e) => setRuleForm({ ...ruleForm, field_name: e.target.value })}
                  >
                    <option value="annual_income">annual_income</option>
                    <option value="district">district</option>
                    <option value="taluka">taluka</option>
                    <option value="village">village</option>
                  </select>
                ) : (
                  <select
                    id="select-rule-field"
                    className="input-field"
                    value={ruleForm.field_name}
                    onChange={(e) => setRuleForm({ ...ruleForm, field_name: e.target.value })}
                  >
                    <option value="age">age</option>
                    <option value="gender">gender</option>
                    <option value="occupation">occupation</option>
                    <option value="education">education</option>
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label className="label-text">Operator</label>
                  <select
                    id="select-rule-operator"
                    className="input-field"
                    value={ruleForm.operator}
                    onChange={(e) => setRuleForm({ ...ruleForm, operator: e.target.value })}
                  >
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                    <option value="<=">&lt;=</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value=">">&gt;</option>
                  </select>
                </div>

                <div>
                  <label className="label-text">Comparison Value</label>
                  <input
                    id="input-rule-value"
                    type="text"
                    className="input-field"
                    placeholder="e.g. 300000 or STUDENT"
                    value={ruleForm.value}
                    onChange={(e) => setRuleForm({ ...ruleForm, value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setRuleModalScheme(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" id="btn-save-rule" className="btn btn-primary">Add Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerSchemes;
