import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { Button } from './button';

type AppToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  type: AppToastType;
  title: string;
  message: string;
};

type ShowToastInput = {
  type?: AppToastType;
  title?: string;
  message: string;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getDefaultTitle(type: AppToastType) {
  if (type === 'success') return 'Thành công';
  if (type === 'error') return 'Có lỗi xảy ra';
  return 'Thông báo';
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const isSuccess = item.type === 'success';
  const isError = item.type === 'error';

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur',
        isSuccess
          ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
          : isError
            ? 'border-red-200 bg-red-50/95 text-red-800'
            : 'border-sky-200 bg-sky-50/95 text-sky-800',
      ].join(' ')}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : isError ? (
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{item.title}</div>
        <div className="mt-1 text-sm leading-5">{item.message}</div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onClose}
        className="border-transparent bg-transparent"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef(new Map<number, number>());

  const dismissToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = 'info', title, message, durationMs = 3000 }: ShowToastInput) => {
      const id = idRef.current + 1;
      idRef.current = id;

      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          title: title || getDefaultTitle(type),
          message,
        },
      ]);

      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, durationMs);

      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastCard item={item} onClose={() => dismissToast(item.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useAppToast must be used within AppToastProvider');
  }

  return context;
}
