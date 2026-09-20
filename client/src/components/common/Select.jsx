import React from 'react';

const Select = React.forwardRef(({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  placeholder,
  ...props
}, ref) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className="w-full mb-4">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-bold uppercase tracking-wider text-gov-navy mb-1.5"
        >
          {label}
          {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full rounded-md border text-gov-text bg-white px-3.5 py-2.5 text-sm min-h-[44px] appearance-none transition-colors focus-visible:ring-2 focus-visible:ring-gov-navy focus-visible:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed ${
            error ? 'border-red-600 focus:border-red-600' : 'border-gov-border focus:border-gov-navy'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gov-text-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-xs text-gov-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
