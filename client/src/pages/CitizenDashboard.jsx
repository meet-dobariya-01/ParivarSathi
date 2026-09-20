import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users, Home, PlusCircle, Edit3, UserMinus, ShieldCheck,
  MapPin, IndianRupee, Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditFamilyModal, setShowEditFamilyModal] = useState(false);

  // Form States
  const [familyForm, setFamilyForm] = useState({
    annual_income: '',
    address: '',
    district: 'Ahmedabad',
    taluka: 'City',
    village: 'Navrangpura'
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    date_of_birth: '',
    gender: 'Male',
    mobile: '',
    occupation: 'Student',
    education: 'STUDENT',
    relationship: 'SON'
  });

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/family/my');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching family data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    try {
      await api.post('/family/create', familyForm);
      setShowCreateModal(false);
      fetchFamilyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create family');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post('/family/member', memberForm);
      setShowAddMemberModal(false);
      setMemberForm({
        name: '',
        date_of_birth: '',
        gender: 'Male',
        mobile: '',
        occupation: 'Student',
        education: 'STUDENT',
        relationship: 'SON'
      });
      fetchFamilyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateFamily = async (e) => {
    e.preventDefault();
    try {
      await api.put('/family/update', familyForm);
      setShowEditFamilyModal(false);
      fetchFamilyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update family');
    }
  };

  const handleDeactivateMember = async (membershipId) => {
    if (!window.confirm('Are you sure you want to deactivate/remove this member from the active household?')) return;
    try {
      await api.delete(`/family/member/${membershipId}`);
      fetchFamilyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate member');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '40px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading household registry...
      </div>
    );
  }

  // 1. Flow: If citizen has NO family yet -> Prompt to create one
  if (!data?.hasFamily) {
    return (
      <div style={{ maxWidth: '680px', margin: '48px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-light)',
            margin: '0 auto 20px'
          }}>
            <Home size={32} />
          </div>

          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome, {user.person?.name || 'Citizen'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
            You do not have an active Gujarat Family ID registered yet. Create your household to unlock automated scheme discovery for all your family members.
          </p>

          <button
            id="btn-open-create-family"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '1rem' }}
          >
            <PlusCircle size={18} /> Create Family Registry
          </button>
        </div>

        {/* Create Family Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem' }}>Create New Gujarat Household</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleCreateFamily}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label-text">Annual Household Income (₹)</label>
                  <input
                    id="input-annual-income"
                    type="number"
                    className="input-field"
                    placeholder="e.g. 180000"
                    value={familyForm.annual_income}
                    onChange={(e) => setFamilyForm({ ...familyForm, annual_income: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label-text">Street Address</label>
                  <input
                    id="input-address"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Plot 42, Kisan Nagar"
                    value={familyForm.address}
                    onChange={(e) => setFamilyForm({ ...familyForm, address: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label className="label-text">District</label>
                    <input
                      id="input-district"
                      type="text"
                      className="input-field"
                      value={familyForm.district}
                      onChange={(e) => setFamilyForm({ ...familyForm, district: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-text">Taluka</label>
                    <input
                      id="input-taluka"
                      type="text"
                      className="input-field"
                      value={familyForm.taluka}
                      onChange={(e) => setFamilyForm({ ...familyForm, taluka: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-text">Village / City</label>
                    <input
                      id="input-village"
                      type="text"
                      className="input-field"
                      value={familyForm.village}
                      onChange={(e) => setFamilyForm({ ...familyForm, village: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" id="btn-submit-family" className="btn btn-primary">Generate Family ID</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Existing Family Dashboard
  const { family, members } = data;
  const head = family.family_head_person_id;

  return (
    <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '28px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.9) 0%, rgba(13, 148, 136, 0.15) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--primary-light)', textTransform: 'uppercase' }}>
                Unified Household ID
              </span>
              <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                <ShieldCheck size={12} /> Verified Household
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontFamily: 'monospace', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', marginTop: '4px' }}>
              {family.family_id}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px', marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span><strong>Head:</strong> {head?.name || 'Assigned'}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                {family.village}, {family.taluka}, {family.district}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IndianRupee size={14} style={{ color: 'var(--primary-light)' }} />
                ₹{family.annual_income?.toLocaleString('en-IN')}/yr
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              id="btn-edit-family"
              onClick={() => {
                setFamilyForm({
                  annual_income: family.annual_income,
                  address: family.address,
                  district: family.district,
                  taluka: family.taluka,
                  village: family.village
                });
                setShowEditFamilyModal(true);
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Edit3 size={15} /> Edit Family
            </button>

            <a
              id="btn-find-benefits"
              href="/find-schemes"
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <Sparkles size={16} /> Find Benefits ⭐
            </a>
          </div>
        </div>
      </div>

      {/* Household Members Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={22} className="text-emerald-400" />
          Household Members ({members.length})
        </h2>

        <button
          id="btn-add-member"
          onClick={() => setShowAddMemberModal(true)}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem' }}
        >
          <PlusCircle size={15} /> Add Member
        </button>
      </div>

      {/* Members Table */}
      <div className="glass-panel" style={{ padding: '8px', marginBottom: '36px' }}>
        <div className="table-container">
          <table className="custom-table" id="family-members-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Relationship</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Occupation</th>
                <th>Education</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.membership_id} id={`member-row-${m.membership_id}`}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {m.name} {m.is_head && <span style={{ fontSize: '0.7rem', color: '#fbbf24', marginLeft: '6px' }}>(HEAD)</span>}
                    </div>
                    {m.mobile && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{m.mobile}</div>}
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                      {m.relationship}
                    </span>
                  </td>
                  <td>{calculateAge(m.date_of_birth)} yrs</td>
                  <td>{m.gender}</td>
                  <td>{m.occupation || '-'}</td>
                  <td>{m.education || '-'}</td>
                  <td>
                    {!m.is_head ? (
                      <button
                        id={`btn-remove-member-${m.membership_id}`}
                        onClick={() => handleDeactivateMember(m.membership_id)}
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <UserMinus size={13} /> Deactivate
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Head of Household</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay" id="add-member-modal">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Add Family Member</h3>
              <button onClick={() => setShowAddMemberModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Full Name</label>
                <input
                  id="input-member-name"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Amit Patel"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="label-text">Date of Birth</label>
                  <input
                    id="input-member-dob"
                    type="date"
                    className="input-field"
                    value={memberForm.date_of_birth}
                    onChange={(e) => setMemberForm({ ...memberForm, date_of_birth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Gender</label>
                  <select
                    id="select-member-gender"
                    className="input-field"
                    value={memberForm.gender}
                    onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="label-text">Relationship to Head</label>
                  <select
                    id="select-member-relation"
                    className="input-field"
                    value={memberForm.relationship}
                    onChange={(e) => setMemberForm({ ...memberForm, relationship: e.target.value })}
                  >
                    <option value="SPOUSE">SPOUSE</option>
                    <option value="SON">SON</option>
                    <option value="DAUGHTER">DAUGHTER</option>
                    <option value="FATHER">FATHER</option>
                    <option value="MOTHER">MOTHER</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Mobile</label>
                  <input
                    id="input-member-mobile"
                    type="text"
                    className="input-field"
                    placeholder="9876543210"
                    value={memberForm.mobile}
                    onChange={(e) => setMemberForm({ ...memberForm, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label className="label-text">Occupation</label>
                  <input
                    id="input-member-occupation"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Student / Farmer / Teacher"
                    value={memberForm.occupation}
                    onChange={(e) => setMemberForm({ ...memberForm, occupation: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-text">Education</label>
                  <input
                    id="input-member-education"
                    type="text"
                    className="input-field"
                    placeholder="e.g. STUDENT / High School"
                    value={memberForm.education}
                    onChange={(e) => setMemberForm({ ...memberForm, education: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddMemberModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" id="btn-submit-member" className="btn btn-primary">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Family Modal */}
      {showEditFamilyModal && (
        <div className="modal-overlay" id="edit-family-modal">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Edit Household Information</h3>
              <button onClick={() => setShowEditFamilyModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleUpdateFamily}>
              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Annual Income (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={familyForm.annual_income}
                  onChange={(e) => setFamilyForm({ ...familyForm, annual_income: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label-text">Street Address</label>
                <input
                  type="text"
                  className="input-field"
                  value={familyForm.address}
                  onChange={(e) => setFamilyForm({ ...familyForm, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label className="label-text">District</label>
                  <input
                    type="text"
                    className="input-field"
                    value={familyForm.district}
                    onChange={(e) => setFamilyForm({ ...familyForm, district: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Taluka</label>
                  <input
                    type="text"
                    className="input-field"
                    value={familyForm.taluka}
                    onChange={(e) => setFamilyForm({ ...familyForm, taluka: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Village / City</label>
                  <input
                    type="text"
                    className="input-field"
                    value={familyForm.village}
                    onChange={(e) => setFamilyForm({ ...familyForm, village: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowEditFamilyModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
