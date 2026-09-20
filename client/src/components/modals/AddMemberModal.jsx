import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Stepper from '../common/Stepper';
import { ArrowRight, ArrowLeft, Check, Shield } from 'lucide-react';

// Zod Schema for Member Validation
const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name must be under 60 characters'),
  relationship: z.enum(['SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a valid relationship' })
  }),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid Date of Birth (YYYY-MM-DD) is required'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a valid gender' })
  }),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
  occupation: z.string().min(2, 'Occupation is required'),
  education: z.enum(['PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'GRADUATE', 'POST_GRADUATE', 'ILLITERATE', 'STUDENT'], {
    errorMap: () => ({ message: 'Please select education level' })
  }),
  aadhar_last_4: z.string().regex(/^\d{4}$/, 'Enter exactly last 4 digits of Aadhaar').optional().or(z.literal(''))
});

const AddMemberModal = ({ isOpen, onClose, onAddMember }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(memberSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      relationship: 'SON',
      date_of_birth: '',
      gender: 'Male',
      mobile: '',
      occupation: 'Student',
      education: 'STUDENT',
      aadhar_last_4: ''
    }
  });

  const steps = [
    { title: 'Basic Info' },
    { title: 'Demographics' },
    { title: 'Socio-Economic' },
    { title: 'Review & Submit' }
  ];

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(['name', 'relationship']);
    } else if (currentStep === 2) {
      isValid = await trigger(['date_of_birth', 'gender', 'mobile']);
    } else if (currentStep === 3) {
      isValid = await trigger(['occupation', 'education', 'aadhar_last_4']);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onAddMember(data);
      reset();
      setCurrentStep(1);
      onClose();
    } catch (err) {
      // Error handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const values = getValues();

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        setCurrentStep(1);
        onClose();
      }}
      title="Add Family Member to Registry"
      subtitle="Step-by-step registration for inclusion in Gujarat Unified Household Beneficiary Database"
      maxWidth="max-w-xl"
    >
      <div className="mb-6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* STEP 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Input
              label="Full Name (As per Aadhaar/Birth Certificate)"
              placeholder="e.g. Ramesh Rajesh Patel"
              required
              {...register('name')}
              error={errors.name?.message}
              helperText="Enter official name without salutations (Mr./Shri)"
            />

            <Select
              label="Relationship to Household Head"
              required
              {...register('relationship')}
              error={errors.relationship?.message}
              options={[
                { value: 'SPOUSE', label: 'Spouse / પત્ની / પતિ' },
                { value: 'SON', label: 'Son / પુત્ર' },
                { value: 'DAUGHTER', label: 'Daughter / પુત્રી' },
                { value: 'FATHER', label: 'Father / પિતા' },
                { value: 'MOTHER', label: 'Mother / માતા' },
                { value: 'BROTHER', label: 'Brother / ભાઈ' },
                { value: 'SISTER', label: 'Sister / બહેન' },
                { value: 'OTHER', label: 'Other Dependent / અન્ય' }
              ]}
            />
          </div>
        )}

        {/* STEP 2: Demographics */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Input
              label="Date of Birth"
              type="date"
              required
              {...register('date_of_birth')}
              error={errors.date_of_birth?.message}
              helperText="Used for automated age-dependent scheme eligibility evaluation"
            />

            <Select
              label="Gender"
              required
              {...register('gender')}
              error={errors.gender?.message}
              options={[
                { value: 'Male', label: 'Male / પુરુષ' },
                { value: 'Female', label: 'Female / સ્ત્રી' },
                { value: 'Other', label: 'Other / અન્ય' }
              ]}
            />

            <Input
              label="Mobile Number (Optional)"
              placeholder="e.g. 9876543210"
              {...register('mobile')}
              error={errors.mobile?.message}
              helperText="For direct SMS updates regarding application and subsidy releases"
            />
          </div>
        )}

        {/* STEP 3: Socio-Economic */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Input
              label="Primary Occupation"
              placeholder="e.g. Farmer, Student, Artisan, Homemaker"
              required
              {...register('occupation')}
              error={errors.occupation?.message}
            />

            <Select
              label="Highest Education Attained"
              required
              {...register('education')}
              error={errors.education?.message}
              options={[
                { value: 'STUDENT', label: 'Currently Studying / Student' },
                { value: 'PRIMARY', label: 'Primary School (Class 1-5)' },
                { value: 'SECONDARY', label: 'Secondary School (Class 6-10)' },
                { value: 'HIGHER_SECONDARY', label: 'Higher Secondary (Class 11-12)' },
                { value: 'GRADUATE', label: 'Graduate / Diploma' },
                { value: 'POST_GRADUATE', label: 'Post Graduate and above' },
                { value: 'ILLITERATE', label: 'Informal / No formal schooling' }
              ]}
            />

            <div>
              <Input
                label="Aadhaar Number (Last 4 Digits Only)"
                placeholder="XXXX XXXX 1234"
                maxLength={4}
                {...register('aadhar_last_4')}
                error={errors.aadhar_last_4?.message}
                helperText="UIDAI GIGW 3.0 Compliance: Only the last 4 digits are stored for privacy protection."
              />
              <div className="flex items-center gap-1.5 text-[11px] text-gov-green font-medium -mt-2">
                <Shield size={13} aria-hidden="true" />
                <span>Masked storage strictly follows Gujarat Aadhaar data security norms.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review Step */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            <div className="bg-blue-50/70 p-4 border border-blue-200 rounded-md">
              <h4 className="font-bold text-gov-navy text-sm mb-3">
                Review Family Member Information
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <dt className="text-gov-text-muted font-bold">Full Name:</dt>
                  <dd className="font-semibold text-gov-text text-sm">{values.name}</dd>
                </div>
                <div>
                  <dt className="text-gov-text-muted font-bold">Relationship:</dt>
                  <dd className="font-semibold text-gov-text">{values.relationship}</dd>
                </div>
                <div>
                  <dt className="text-gov-text-muted font-bold">Date of Birth:</dt>
                  <dd className="font-semibold text-gov-text">{values.date_of_birth}</dd>
                </div>
                <div>
                  <dt className="text-gov-text-muted font-bold">Gender:</dt>
                  <dd className="font-semibold text-gov-text">{values.gender}</dd>
                </div>
                <div>
                  <dt className="text-gov-text-muted font-bold">Occupation:</dt>
                  <dd className="font-semibold text-gov-text">{values.occupation}</dd>
                </div>
                <div>
                  <dt className="text-gov-text-muted font-bold">Education:</dt>
                  <dd className="font-semibold text-gov-text">{values.education}</dd>
                </div>
                <div>
                  <dt className="text-gov-text-muted font-bold">Aadhaar Last 4:</dt>
                  <dd className="font-semibold font-mono text-gov-navy">
                    {values.aadhar_last_4 ? `•••• •••• ${values.aadhar_last_4}` : 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gov-text-muted font-bold">Mobile:</dt>
                  <dd className="font-semibold text-gov-text">{values.mobile || 'Not provided'}</dd>
                </div>
              </dl>
            </div>

            <div className="p-3 bg-slate-50 border border-gov-border rounded text-[11px] text-gov-text-muted">
              By submitting this form, you certify that the information provided is accurate and verifiable against Government of Gujarat administrative records.
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="mt-6 pt-4 border-t border-gov-border flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={handleBack}
            >
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
            >
              <span>Continue</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="success"
              size="sm"
              loading={isSubmitting}
              icon={Check}
            >
              Confirm & Add Member
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AddMemberModal;
