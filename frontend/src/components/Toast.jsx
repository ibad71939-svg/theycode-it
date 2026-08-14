import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

const VARIANTS = {
  error: {
    border: 'border-danger/20',
    bar: 'bg-danger',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-danger shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm.75-11.5a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4ZM10 13.5a.9.9 0 100 1.8.9.9 0 000-1.8Z" clipRule="evenodd" />
      </svg>
    ),
  },
  success: {
    border: 'border-mint/20',
    bar: 'bg-mint',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-mint-dark shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.53-9.72a.75.75 0 00-1.06-1.06L9 10.69 7.53 9.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4-4Z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    border: 'border-muted/20',
    bar: 'bg-muted',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-muted shrink-0">
        <path fillRule="evenodd" d="M18 10A8 8 0 111.999 10 8 8 0 0118 10Zm-8-4.5a.75.75 0 100 1.5.75.75 0 000-1.5ZM9 9a.75.75 0 000 1.5h.25v3.25H9a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-.25V9.75A.75.75 0 0010.5 9H9Z" clipRule="evenodd" />
      </svg>
    ),
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
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
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
