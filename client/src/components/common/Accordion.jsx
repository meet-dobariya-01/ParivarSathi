import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const AccordionItem = ({
  id,
  title,
  children,
  isOpen,
  onToggle
}) => {
  const contentId = `accordion-content-${id}`;
  const headerId = `accordion-header-${id}`;

  return (
    <div className="border border-gov-border rounded-md overflow-hidden bg-white mb-2.5">
      <h3>
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-gov-navy hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-gov-navy focus-visible:outline-none"
        >
          <span>{title}</span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`text-gov-text-muted transition-transform duration-200 shrink-0 ml-3 ${
              isOpen ? 'rotate-180 text-gov-navy' : ''
            }`}
          />
        </button>
      </h3>

      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isOpen}
        className={`px-4 pb-4 pt-1 text-sm text-gov-text border-t border-slate-100 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export const Accordion = ({ items = [], allowMultiple = false, className = '' }) => {
  const [openItems, setOpenItems] = useState([items[0]?.id || 0]);

  const toggleItem = (id) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {items.map((item, idx) => {
        const itemId = item.id !== undefined ? item.id : idx;
        const isOpen = openItems.includes(itemId);
        return (
          <AccordionItem
            key={itemId}
            id={itemId}
            title={item.title}
            isOpen={isOpen}
            onToggle={() => toggleItem(itemId)}
          >
            {item.content}
          </AccordionItem>
        );
      })}
    </div>
  );
};

export default Accordion;
