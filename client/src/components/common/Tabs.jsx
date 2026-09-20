import React from 'react';

const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = ''
}) => {
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % tabs.length;
      onChange(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onChange(tabs[prevIndex].id);
    }
  };

  return (
    <div className={`border-b border-gov-border ${className}`}>
      <div role="tablist" aria-label="Sections" className="flex flex-wrap -mb-px gap-1">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`inline-flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-gov-navy focus-visible:outline-none ${
                isActive
                  ? 'border-gov-navy text-gov-navy bg-blue-50/50'
                  : 'border-transparent text-gov-text-muted hover:text-gov-navy hover:border-slate-300'
              }`}
            >
              {tab.icon && <tab.icon size={16} aria-hidden="true" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                  isActive ? 'bg-gov-navy text-white' : 'bg-slate-200 text-gov-text'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
