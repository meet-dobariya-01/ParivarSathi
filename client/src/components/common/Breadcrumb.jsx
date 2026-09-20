import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-gov-text-muted mb-4 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-gov-text-muted hover:text-gov-navy hover:underline focus-visible:ring-1 focus-visible:ring-gov-navy"
          >
            <Home size={14} aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={item.label || idx} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-slate-400 shrink-0" aria-hidden="true" />
              {isLast || !item.to ? (
                <span
                  className="font-bold text-gov-navy truncate max-w-[200px]"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="text-gov-text-muted hover:text-gov-navy hover:underline focus-visible:ring-1 focus-visible:ring-gov-navy"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
