import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
  className = '',
  hideCloseButton = false
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-white rounded-md border border-gov-border shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-gov-border flex items-center justify-between gap-4">
          <div>
            <h3 id="modal-headline" className="text-lg font-bold text-gov-navy leading-tight">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-gov-text-muted mt-0.5">{subtitle}</p>}
          </div>

          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-gov-text-muted hover:text-gov-navy hover:bg-slate-200 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-gov-navy"
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
