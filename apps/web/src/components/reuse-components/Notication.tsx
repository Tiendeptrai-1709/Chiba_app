// apps/web/components/Notification.tsx
'use client';

import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { useNotificationStore } from '@chiba/api-client/src/stores/useNotificationStore';

export const Notification = () => {
  const { error, success, clearNotification } = useNotificationStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearNotification(); // reset để lần sau cùng nội dung vẫn hiện lại
    }
  }, [error, clearNotification]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      clearNotification();
    }
  }, [success, clearNotification]);

  return <Toaster position="top-center" richColors closeButton />;
};