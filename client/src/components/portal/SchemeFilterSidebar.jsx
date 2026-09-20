import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, RotateCcw } from 'lucide-react';
import Button from '../common/Button';

const CATEGORIES = [
  'All Categories',
  'Agriculture',
  'Education',
  'Health',
  'Women & Child',
  'Social Welfare',
  'Housing',
  'Labour & Employment'
];

const SchemeFilterSidebar = ({
  filters,
  onChange,
  onReset,
  totalResults = 0,
  eligibleCount = 0,
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <aside
      aria-label="Scheme Filter Controls"
      className={`bg-white rounded-md border border-gov-border shadow-gov-card p-5 space-y-6 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-gov-border">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gov-navy" aria-hidden="true" />
          <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wider">
            {t('schemes.filters')}
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          title="Reset All Filters"
          className="text-xs text-gov-text-muted hover:text-gov-navy flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-gov-navy rounded px-1"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div className="bg-blue-50/70 p-3 rounded border border-blue-200 text-xs space-y-1">
        <div className="flex justify-between font-bold text-gov-navy">
          <span>{t('schemes.eligibleCount')}:</span>
          <span className="text-gov-green font-extrabold">{eligibleCount}</span>
        </div>
        <div className="flex justify-between text-gov-text-muted">
          <span>Total Schemes:</span>
          <span>{totalResults}</span>
        </div>
      </div>

      {/* 1. Category Filter */}
      <div>
        <label htmlFor="filter-category" className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-2">
          Scheme Category
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full text-xs rounded border border-gov-border p-2 bg-white text-gov-text focus-visible:ring-2 focus-visible:ring-gov-navy"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat === 'All Categories' ? '' : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Beneficiary Gender */}
      <div>
        <span className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-2">
          Beneficiary Gender
        </span>
        <div className="space-y-1.5 text-xs text-gov-text">
          {['All', 'Male', 'Female'].map((gender) => (
            <label key={gender} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="filter-gender"
                checked={filters.gender === (gender === 'All' ? '' : gender)}
                onChange={() => onChange({ ...filters, gender: gender === 'All' ? '' : gender })}
                className="w-4 h-4 text-gov-navy border-gov-border focus:ring-gov-navy"
              />
              <span>{gender === 'All' ? 'All Genders / કોઈપણ' : gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Max Household Income */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1.5">
          <label htmlFor="filter-income" className="font-bold text-gov-navy uppercase tracking-wider">
            Max Income (₹)
          </label>
          <span className="font-mono text-gov-green font-bold">
            {filters.maxIncome ? `≤ ₹${Number(filters.maxIncome).toLocaleString('en-IN')}` : 'Any'}
          </span>
        </div>
        <input
          id="filter-income"
          type="range"
          min="50000"
          max="1000000"
          step="50000"
          value={filters.maxIncome || 1000000}
          onChange={(e) => onChange({ ...filters, maxIncome: Number(e.target.value) })}
          className="w-full accent-gov-navy"
        />
        <div className="flex justify-between text-[10px] text-gov-text-muted mt-1">
          <span>₹50K</span>
          <span>₹5L</span>
          <span>₹10L+</span>
        </div>
      </div>

      {/* 4. Eligible Only Checkbox */}
      <div className="pt-2 border-t border-gov-border">
        <label className="flex items-center gap-2.5 text-xs font-bold text-gov-navy cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.eligibleOnly}
            onChange={(e) => onChange({ ...filters, eligibleOnly: e.target.checked })}
            className="w-4 h-4 rounded text-gov-green border-gov-border focus:ring-gov-green"
          />
          <span>{t('schemes.eligibleOnly')}</span>
        </label>
      </div>
    </aside>
  );
};

export default SchemeFilterSidebar;
