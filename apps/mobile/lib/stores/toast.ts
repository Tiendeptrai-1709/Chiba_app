import { create } from 'zustand';

type ToastKind = 'success' | 'error' | 'added';

interface ToastState {
  message: string | null;
  kind: ToastKind;
  show: (message: string, kind?: ToastKind) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

// Thông báo ngắn ở đầu màn hình (components/Toast.tsx)
export const useToast = create<ToastState>((set) => ({
  message: null,
  kind: 'success',
  show: (message, kind = 'success') => {
    clearTimeout(timer);
    set({ message, kind });
    timer = setTimeout(() => set({ message: null }), kind === 'error' ? 3500 : 2200);
  },
  hide: () => set({ message: null }),
}));

export const toast = {
  success: (m: string) => useToast.getState().show(m, 'success'),
  error: (m: string) => useToast.getState().show(m, 'error'),
  // "Đã thêm <món> · Xem giỏ" giống web
  added: (name: string) => useToast.getState().show(name, 'added'),
};
