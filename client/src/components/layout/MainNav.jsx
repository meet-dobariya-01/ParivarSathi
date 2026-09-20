import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Users, Sparkles, FileText, HelpCircle, AlertCircle,
  Menu, X, BarChart3, CheckSquare, Layers
} from 'lucide-react';

const MainNav = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileMenuOpen]);

  // Citizen Navigation Links
  const citizenLinks = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/dashboard', label: t('nav.dashboard'), icon: Users },
    { to: '/find-schemes', label: t('nav.findSchemes'), icon: Sparkles },
    { to: '/applications', label: t('nav.myApplications'), icon: FileText },
    { to: '/grievance', label: t('nav.grievance'), icon: AlertCircle },
    { to: '/faq', label: t('nav.faq'), icon: HelpCircle },
  ];

  // Officer Navigation Links
  const officerLinks = [
    { to: '/officer/dashboard', label: t('nav.officerDashboard'), icon: BarChart3 },
    { to: '/officer/applications', label: t('nav.officerApplications'), icon: CheckSquare },
    { to: '/officer/schemes', label: t('nav.officerSchemes'), icon: Layers },
    { to: '/faq', label: t('nav.faq'), icon: HelpCircle },
  ];

  const links = user?.role === 'OFFICER' ? officerLinks : citizenLinks;

  return (
    <nav
      aria-label="Main Navigation"
      className="bg-gov-navy text-white sticky top-0 z-40 shadow-md border-b-2 border-gov-saffron"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Desktop Navigation Menu (Horizontal, Formal Bottom-Border Indicator) */}
        <div className="hidden md:flex items-center space-x-1 overflow-x-auto py-0">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-gov-saffron focus-visible:outline-none whitespace-nowrap ${
                  isActive
                    ? 'border-gov-saffron text-gov-saffron bg-[#15294a] font-bold shadow-inner'
                    : 'border-transparent text-white/90 hover:text-white hover:bg-white/10 hover:border-white/40'
                }`
              }
            >
              <link.icon size={16} aria-hidden="true" className="shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center justify-between w-full py-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-gov-saffron">
            {user?.role === 'OFFICER' ? 'Officer Portal' : 'ParivarSathi Navigation'}
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="p-2 rounded text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gov-saffron"
          >
            {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden bg-[#15294a] border-t border-white/10 px-4 py-3 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-200"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gov-saffron text-gov-navy-950 font-bold'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <link.icon size={18} aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default MainNav;
