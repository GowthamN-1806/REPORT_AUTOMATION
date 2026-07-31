import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto bg-white rounded-2xl p-4 shadow-2xl border flex items-start gap-3 transform transition-all duration-300 animate-slideUp ${
            t.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
              : t.type === 'error'
              ? 'border-red-200 bg-red-50/90 text-red-950'
              : 'border-blue-200 bg-blue-50/90 text-blue-950'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}

          <div className="flex-1">
            <h4 className="text-xs font-bold font-poppins">{t.title}</h4>
            <p className="text-xs mt-0.5 opacity-90">{t.message}</p>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
