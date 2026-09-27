// apps/web/components/Notification.tsx
'use client';

<<<<<<< Updated upstream:apps/web/src/components/ui/Notication.tsx
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useEffect } from "react";
=======
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useNotificationStore } from '@chiba/api-client/src/stores/useNotificationStore';
>>>>>>> Stashed changes:apps/web/src/components/reuse-components/Notication.tsx

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