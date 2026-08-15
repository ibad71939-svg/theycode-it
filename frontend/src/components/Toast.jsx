import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANTS = {
  error: {
    border: 'border-danger/20',
    bar: 'bg-danger',
    icon: <AlertCircle className="w-5 h-5 text-danger shrink-0" strokeWidth={2} />,
  },
  success: {
    border: 'border-success/20',
    bar: 'bg-success',
    icon: <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" strokeWidth={2} />,
  },
  info: {
    border: 'border-neutral-200',
    bar: 'bg-neutral-500',
    icon: <Info className="w-5 h-5 text-neutral-500 shrink-0" strokeWidth={2} />,
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((message, variant = 'info', duration = 5000) => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, message, variant }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const toast = {
    show,
    error: (message, duration) => show(message, 'error', duration),
    success: (message, duration) => show(message, 'success', duration),
    info: (message, duration) => show(message, 'info', duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((t) => {
          const v = VARIANTS[t.variant] || VARIANTS.info;
          return (
            <div
              key={t.id}
              role="alert"
              className={`relative overflow-hidden bg-white border ${v.border} rounded-card shadow-editor px-4 py-3 flex items-start gap-3 animate-[toast-in_0.18s_ease-out]`}
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${v.bar}`} />
              {v.icon}
              <p className="text-sm text-ink leading-snug flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="text-muted hover:text-ink shrink-0 -mt-0.5"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}