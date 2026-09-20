import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { Check } from 'lucide-react';

const familySchema = z.object({
  annual_income: z.preprocess((val) => Number(val), z.number().min(0, 'Income must be >= 0')),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  district: z.string().min(2, 'District is required'),
  taluka: z.string().min(2, 'Taluka is required'),
  village: z.string().min(2, 'Village/Town is required')
});

const GUJARAT_DISTRICTS = [
  'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
  'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka',
  'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
  'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
  'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
  'Tapi', 'Vadodara', 'Valsad'
];

const EditFamilyModal = ({
  isOpen,
  onClose,
  initialData,
  onSubmitFamily,
  isCreate = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(familySchema),
    defaultValues: {
      annual_income: initialData?.annual_income || '',
      address: initialData?.address || '',
      district: initialData?.district || 'Ahmedabad',
      taluka: initialData?.taluka || 'City',
      village: initialData?.village || ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        annual_income: initialData.annual_income || '',
        address: initialData.address || '',
        district: initialData.district || 'Ahmedabad',
        taluka: initialData.taluka || '',
        village: initialData.village || ''
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmitFamily(data);
      onClose();
    } catch (err) {
      // Handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreate ? "Create New Household Registry" : "Update Family Registry Information"}
      subtitle={isCreate ? "Generate an 8-character Gujarat Unified Family ID (UFID)" : "Update verified address and income data for scheme eligibility"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label="Total Annual Household Income (₹)"
          type="number"
          placeholder="e.g. 180000"
          required
          {...register('annual_income')}
          error={errors.annual_income?.message}
          helperText="Combined annual gross income of all household earning members"
        />

        <Input
          label="Residential Street Address"
          placeholder="e.g. House No. 12, Sardar Patel Society"
          required
          {...register('address')}
          error={errors.address?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="District"
            required
            options={GUJARAT_DISTRICTS}
            {...register('district')}
            error={errors.district?.message}
          />

          <Input
            label="Taluka"
            placeholder="e.g. Daskroi"
            required
            {...register('taluka')}
            error={errors.taluka?.message}
          />

          <Input
            label="Village / City"
            placeholder="e.g. Bopal"
            required
            {...register('village')}
            error={errors.village?.message}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-gov-border flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            icon={Check}
          >
            {isCreate ? "Generate Unified Family ID" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFamilyModal;
