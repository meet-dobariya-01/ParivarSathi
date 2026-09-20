import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';
import Button from '../common/Button';
import logoSvg from '../../assets/logo.svg';
import { LogOut, User as UserIcon } from 'lucide-react';

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gov-border">
      <div className="max-w-7xl mx-auto px-4 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-3.5 focus-visible:ring-2 focus-visible:ring-gov-navy rounded-md p-1 group"
        >
          <img
            src={logoSvg}
            alt="ParivarSathi Gujarat Portal Emblem"
            className="w-12 h-13 sm:w-14 sm:h-15 shrink-0 object-contain drop-shadow-sm"
          />

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-gujarati text-xl sm:text-2xl font-black text-gov-navy tracking-tight">
                {t('header.portalNameGuj')}
              </span>
              <span className="text-lg sm:text-xl font-bold text-gov-navy tracking-tight">
                / {t('header.portalNameEng')}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gov-teal">
              {t('header.portalSubtitle')}
            </span>
            <span className="text-[11px] text-gov-text-muted hidden sm:inline">
              Government of Gujarat • કૌટુંબિક યોજના અને લાભાર્થી સેવાઓ
            </span>
          </div>
        </Link>

        {/* Right: Authenticated User Chip or Login/Register Links */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-50 border border-gov-border rounded-md px-3 py-1.5 shadow-gov-sm">
              <div className="w-8 h-8 rounded-full bg-gov-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                <UserIcon size={16} aria-hidden="true" />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-gov-navy leading-tight truncate max-w-[150px]">
                  {user.person?.name || user.name || user.email?.split('@')[0] || 'User'}
                </span>
                <div className="mt-0.5">
                  <Badge variant={user.role === 'OFFICER' ? 'officer' : 'citizen'} size="sm">
                    {user.role === 'OFFICER' ? 'GOVT OFFICER' : 'CITIZEN'}
                  </Badge>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title={t('nav.logout')}
                aria-label={t('nav.logout')}
                className="ml-2 p-1.5 text-gov-text-muted hover:text-red-700 hover:bg-red-50 rounded transition-colors focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="saffron" size="sm">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
