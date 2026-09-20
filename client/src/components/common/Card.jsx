import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={`bg-white rounded-md border border-gov-border shadow-gov-card overflow-hidden transition-shadow ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`px-5 py-4 border-b border-gov-border flex flex-wrap items-center justify-between gap-3 ${headerClassName}`}>
          <div>
            {title && <h2 className="text-base font-bold text-gov-navy leading-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-gov-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className={`px-5 py-3.5 bg-slate-50 border-t border-gov-border ${footerClassName}`}>
          {footer}
        </div>
      )}
    </Component>
  );
};

export default Card;
