import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoSvg from '../assets/logo.svg';
import { Shield, Users, Award, FileText, BarChart3, LogOut, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isOfficer = user.role === 'OFFICER';

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 14px rgba(16, 185, 129, 0.4)'
          }}>
            <img src={logoSvg} alt="ParivarSathi logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 30%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ParivarSathi
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '-2px' }}>
              Gujarat Family Beneficiary Portal
            </div>
          </div>
        </Link>

        {/* Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isOfficer ? (
            <>
              <Link
                id="nav-family-link"
                to="/dashboard"
                className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <Users size={16} /> Family Dashboard
              </Link>
              <Link
                id="nav-find-schemes-link"
                to="/find-schemes"
                className={`btn ${isActive('/find-schemes') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <Award size={16} /> Find Schemes ⭐
              </Link>
              <Link
                id="nav-applications-link"
                to="/applications"
                className={`btn ${isActive('/applications') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <FileText size={16} /> My Applications
              </Link>
            </>
          ) : (
            <>
              <Link
                id="nav-officer-dash-link"
                to="/officer/dashboard"
                className={`btn ${isActive('/officer/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <BarChart3 size={16} /> Analytics Dashboard
              </Link>
              <Link
                id="nav-officer-schemes-link"
                to="/officer/schemes"
                className={`btn ${isActive('/officer/schemes') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <Layers size={16} /> Manage Schemes
              </Link>
              <Link
                id="nav-officer-apps-link"
                to="/officer/applications"
                className={`btn ${isActive('/officer/applications') ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <FileText size={16} /> Review Applications
              </Link>
            </>
          )}
        </nav>

        {/* User Badge & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '9999px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isOfficer ? '#f59e0b' : '#10b981'
            }}></span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              {user.person?.name || user.email}
            </span>
            <span style={{
              fontSize: '0.7rem',
              background: isOfficer ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isOfficer ? '#fbbf24' : '#34d399',
              padding: '1px 6px',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              {user.role}
            </span>
          </div>

          <button
            id="btn-logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
