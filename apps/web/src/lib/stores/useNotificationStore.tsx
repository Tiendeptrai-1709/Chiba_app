import { create } from 'zustand';

interface NotificationState {
  error: string | null;
  success: string | null;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  error: null,
  success: null,

  showError: (message) => set({ error: message, success: null }),
  showSuccess: (message) => set({ success: message, error: null }),
  clearNotification: () => set({ error: null, success: null }),
}));