import React, { useEffect } from 'react';
import { useVacantes } from '../context/VacantesContext';
import { Undo2, X } from 'lucide-react';

export const ToastUndo: React.FC = () => {
  const { toasts, dismissToast, undoLastAction } = useVacantes();

  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      toasts.forEach((t) => {
        if (now - t.timestamp > 6000) {
          dismissToast(t.id);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-md w-auto px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xl animate-in slide-in-from-bottom-3 fade-in duration-150"
        >
          <span className="truncate text-slate-100">
            {toast.texto}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {toast.canUndo && (
              <button
                type="button"
                onClick={() => {
                  undoLastAction();
                  dismissToast(toast.id);
                }}
                className="font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/60 underline-offset-2 transition-colors cursor-pointer"
              >
                Deshacer
              </button>
            )}

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
