import React from 'react';

const Input = React.forwardRef(({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  autoComplete,
  icon: Icon,
  ...props
}, ref) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-gov-navy mb-1.5"
        >
          {label}
          {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gov-text-muted">
            <Icon size={18} aria-hidden="true" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full rounded-md border text-gov-text bg-white px-3.5 py-2.5 text-sm min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-gov-navy focus-visible:ring-offset-1 focus-visible:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : ''
          } ${
            error ? 'border-red-600 focus:border-red-600' : 'border-gov-border focus:border-gov-navy'
          } ${className}`}
          {...props}
        />
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

Input.displayName = 'Input';

export default Input;
