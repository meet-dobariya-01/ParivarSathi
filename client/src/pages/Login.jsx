import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PortalLayout from '../components/layout/PortalLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { Lock, Mail, Shield, UserCheck, ArrowRight } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      showToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back, ${user.person?.name || user.name || 'User'}`
      });

      if (user.role === 'OFFICER') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please verify credentials.';
      setError(msg);
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const demoAccounts = [
    { role: 'OFFICER', name: 'Officer Chauhan', email: 'officer@gujarat.gov.in', note: 'Admin/Reviewer' },
    { role: 'CITIZEN', name: 'Rajesh Patel', email: 'rajesh.patel@gmail.com', note: 'Farmer ₹1.8L' },
    { role: 'CITIZEN', name: 'Meena Shah', email: 'meena.shah@gmail.com', note: 'Women-Head ₹2.4L' },
    { role: 'CITIZEN', name: 'Hiren Rabari', email: 'hiren.rabari@gmail.com', note: 'Farmer ₹2.2L' }
  ];

  return (
    <PortalLayout breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.login') }]}>
      <div className="max-w-md mx-auto py-8">
        <Card
          className="shadow-lg border-t-4 border-t-gov-navy"
          headerClassName="bg-slate-50 text-center"
          title="Sign In to ParivarSathi"
          subtitle="Gujarat Unified Family Beneficiary Access Portal"
        >
          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              label="Registered Email Address"
              type="email"
              placeholder="e.g. rajesh.patel@gmail.com"
              required
              autoComplete="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="login-password"
              label="Account Password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              id="btn-login-submit"
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full"
            >
              <span>{t('nav.login')}</span>
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Quick Demo Credentials Strip */}
          <div className="mt-6 pt-5 border-t border-gov-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gov-navy uppercase tracking-wider mb-2.5">
              <UserCheck size={14} className="text-gov-teal" />
              <span>Quick Test Logins (Demo Build)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoLogin(acc.email, 'Test@123')}
                  className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-gov-border hover:border-gov-navy rounded transition-colors"
                >
                  <div className="font-bold text-gov-navy truncate">{acc.name}</div>
                  <div className="text-[10px] text-gov-text-muted">{acc.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-gov-text-muted">
            Don't have a registered family account?{' '}
            <Link to="/register" className="font-bold text-gov-navy hover:underline">
              {t('nav.register')}
            </Link>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default Login;
