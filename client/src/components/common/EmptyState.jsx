import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionText,
  onAction,
  actionHref,
  className = ''
}) => {
  return (
    <div className={`p-10 text-center bg-white border border-gov-border rounded-md shadow-gov-card ${className}`}>
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-gov-navy">
        <Icon size={28} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-gov-navy mb-1.5">{title}</h3>
      <p className="text-xs text-gov-text-muted max-w-md mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && (
        <div>
          {actionHref ? (
            <a href={actionHref}>
              <Button variant="primary">{actionText}</Button>
            </a>
          ) : (
            <Button variant="primary" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
