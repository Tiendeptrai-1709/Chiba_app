
import { useNotificationStore } from "@chiba/api-client/src/stores/useNotificationStore";
import { toast } from "sonner-native";
import { useEffect } from "react";

const Notification = () => {
  const { error, success, clearNotification } =
    useNotificationStore();

  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 3000,
      });

      clearNotification();
    } else if (success) {
      toast.success(success, {
        duration: 3000,
      });

      clearNotification();
    }
  }, [error, success, clearNotification]);

  return null;
};

export default Notification;
