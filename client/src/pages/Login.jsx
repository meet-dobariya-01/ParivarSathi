import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'OFFICER') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'OFFICER') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            marginBottom: '12px'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '1.9rem', color: '#fff' }}>ParivarSathi</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Unified Gujarat Family Beneficiary Platform
          </p>
        </div>

        {/* Login Box */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--text-main)' }}>Sign In</h2>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', borderRadius: '8px', padding: '10px 14px', color: '#fda4af', fontSize: '0.85rem', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label-text">Email Address</label>
              <input
                id="input-login-email"
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label className="label-text">Password</label>
              <input
                id="input-login-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* 1-Click Quick Demo Switchers */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, textAlign: 'center', marginBottom: '10px', letterSpacing: '0.05em' }}>
              Quick Demo Accounts (1-Click)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                id="btn-demo-citizen1"
                type="button"
                onClick={() => handleQuickLogin('rajesh@gmail.com', 'password123')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
              >
                <UserCheck size={14} style={{ color: 'var(--primary-light)' }} />
                <span><strong>Citizen:</strong> Rajesh (Farmer Family in Surendranagar)</span>
              </button>

              <button
                id="btn-demo-citizen2"
                type="button"
                onClick={() => handleQuickLogin('priya@gmail.com', 'password123')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
              >
                <UserCheck size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span><strong>Citizen:</strong> Priya (Teacher with Senior Citizen Dad)</span>
              </button>

              <button
                id="btn-demo-officer"
                type="button"
                onClick={() => handleQuickLogin('officer@gujarat.gov.in', 'password123')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
              >
                <ShieldAlert size={14} style={{ color: '#fbbf24' }} />
                <span><strong>Officer:</strong> Dr. Harshil Mehta (District Officer)</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Register as Citizen</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
