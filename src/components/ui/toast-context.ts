import { createContext, useContext } from 'react';

export type AppToastType = 'success' | 'error' | 'info';

export type ShowToastInput = {
  type?: AppToastType;
  title?: string;
  message: string;
  durationMs?: number;
};

export type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
  dismissToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useAppToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useAppToast must be used within AppToastProvider');
  }

  return context;
}
