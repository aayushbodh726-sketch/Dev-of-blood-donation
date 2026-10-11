import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X, Heart, Droplet } from 'lucide-react';

export function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />;
      case 'donate':
        return <Heart className="w-5 h-5 text-crimson-600 fill-crimson-100 shrink-0 animate-pulse" />;
      case 'request':
        return <Droplet className="w-5 h-5 text-crimson-600 fill-crimson-600 shrink-0" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-white';
      case 'donate':
        return 'border-crimson-200 bg-white';
      case 'request':
        return 'border-crimson-200 bg-white';
      case 'urgent':
        return 'border-orange-200 bg-white';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 max-w-sm w-full ${getBorderColor()}`}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 leading-tight">
          {toast.title}
        </h4>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition -mr-1 -mt-1"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
