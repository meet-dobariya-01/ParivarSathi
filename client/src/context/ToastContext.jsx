import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'info', title, message, duration = 4500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Accessible Live Region for Toasts */}
      <aside
        aria-live="polite"
        aria-label="Notification Center"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none"
      >
        {toasts.map((toast) => {
          let bg = 'bg-gov-navy text-white border-blue-400';
          let Icon = Info;

          if (toast.type === 'success') {
            bg = 'bg-[#138808] text-white border-green-300';
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            bg = 'bg-[#b91c1c] text-white border-red-300';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            bg = 'bg-[#d97706] text-white border-amber-300';
            Icon = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-md shadow-lg border ${bg} transition-all duration-300`}
            >
              <Icon size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
                <div>{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                className="shrink-0 p-1 hover:bg-white/20 rounded focus-visible:ring-2 focus-visible:ring-white"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
