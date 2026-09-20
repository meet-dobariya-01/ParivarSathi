import React from 'react';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-md focus-visible:ring-2 focus-visible:ring-gov-navy focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target select-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-2.5 text-base gap-2.5 min-h-[48px]'
  };

  const variantStyles = {
    primary: 'bg-gov-navy hover:bg-gov-navy-800 text-white shadow-gov-sm border border-transparent active:bg-gov-navy-900',
    secondary: 'bg-white hover:bg-slate-50 text-gov-text border border-gov-border shadow-gov-sm active:bg-slate-100',
    saffron: 'bg-gov-saffron hover:bg-orange-600 text-white shadow-gov-sm border border-transparent font-semibold',
    success: 'bg-gov-green hover:bg-green-700 text-white shadow-gov-sm border border-transparent',
    danger: 'bg-red-700 hover:bg-red-800 text-white shadow-gov-sm border border-transparent',
    ghost: 'bg-transparent hover:bg-slate-100 text-gov-text active:bg-slate-200'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} aria-hidden="true" className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
