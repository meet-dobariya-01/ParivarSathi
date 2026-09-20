import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PortalLayout from '../components/layout/PortalLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import api from '../api/client';
import { UserPlus, Shield, Check } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a valid gender' })
  }),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid Date of Birth is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number').optional().or(z.literal('')),
  aadhar_last_4: z.string().regex(/^\d{4}$/, 'Enter exactly 4 digits').optional().or(z.literal(''))
});

const Register = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      gender: 'Male',
      date_of_birth: '',
      mobile: '',
      aadhar_last_4: ''
    }
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);

    try {
      const res = await registerUser(data);
      showToast({
        type: 'success',
        title: 'Registration Successful',
        message: 'Your citizen account has been created.'
      });

      if (res.role === 'OFFICER') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setServerError(msg);
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.register') }]}>
      <div className="max-w-lg mx-auto py-6">
        <Card
          className="shadow-lg border-t-4 border-t-gov-saffron"
          headerClassName="bg-slate-50 text-center"
          title="Citizen Registration"
          subtitle="Enrol for Gujarat Unified Household Beneficiary Registry"
        >
          {serverError && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <Input
              id="reg-name"
              label="Citizen Full Name (As per Government Records)"
              placeholder="e.g. Ramesh Patel"
              required
              {...register('name')}
              error={errors.name?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="reg-email"
                label="Email Address"
                type="email"
                placeholder="citizen@example.com"
                required
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                id="reg-password"
                label="Create Password"
                type="password"
                placeholder="Min 6 characters"
                required
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="reg-dob"
                label="Date of Birth"
                type="date"
                required
                {...register('date_of_birth')}
                error={errors.date_of_birth?.message}
              />

              <Select
                id="reg-gender"
                label="Gender"
                required
                options={[
                  { value: 'Male', label: 'Male / પુરુષ' },
                  { value: 'Female', label: 'Female / સ્ત્રી' },
                  { value: 'Other', label: 'Other / અન્ય' }
                ]}
                {...register('gender')}
                error={errors.gender?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="reg-mobile"
                label="Mobile Number (Optional)"
                placeholder="e.g. 9876543210"
                {...register('mobile')}
                error={errors.mobile?.message}
              />

              <div>
                <Input
                  id="reg-aadhar"
                  label="Aadhaar Last 4 Digits"
                  placeholder="•••• 1234"
                  maxLength={4}
                  {...register('aadhar_last_4')}
                  error={errors.aadhar_last_4?.message}
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-gov-navy text-[11px] flex items-start gap-2">
              <Shield size={16} className="text-gov-teal shrink-0 mt-0.5" />
              <span>
                Your data is protected under State Data Security protocols. Aadhaar information is strictly stored in masked format.
              </span>
            </div>

            <Button
              id="btn-register-submit"
              type="submit"
              variant="saffron"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={Check}
            >
              Complete Registration & Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-gov-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-gov-navy hover:underline">
              {t('nav.login')}
            </Link>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default Register;
