type ToastType = 'success' | 'error' | 'info';

interface ToastEvent {
  message: string;
  type: ToastType;
  id: number;
}

type Listener = (toast: ToastEvent) => void;

let _id = 0;
const listeners: Set<Listener> = new Set();

function emit(message: string, type: ToastType) {
  const toast: ToastEvent = { message, type, id: ++_id };
  listeners.forEach(l => l(toast));
}

export const toast = {
  success: (msg: string) => emit(msg, 'success'),
  error:   (msg: string) => emit(msg, 'error'),
  info:    (msg: string) => emit(msg, 'info'),
  subscribe:   (fn: Listener): (() => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
};

export type { ToastEvent, ToastType };
