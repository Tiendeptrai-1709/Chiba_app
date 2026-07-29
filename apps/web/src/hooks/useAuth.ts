import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const { setAccessToken } = useAuthStore();
  const { showSuccess, showError } = useNotificationStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await axiosInstance.post("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      showSuccess("Đăng nhập thành công");
      router.replace("/")

      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showError(error.response?.data.message ?? "Đăng nhập thất bại");
      } else {
        showError("Có lỗi xảy ra");
      }
    },
  });
}

export const useRegister = () => {
  const { showSuccess, showError } = useNotificationStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      fullName: string;
    }) => {
      const { data } = await axiosInstance.post("/auth/register", payload);
      return data;
    },
    onSuccess: () => {
      showSuccess("Tạo tài khoản thành công");
      router.replace("/login");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showError(error.response?.data.message);
      }else{
        showError("Có lỗi xảy ra")
      }
    },
  });
}

export const useLogout = () => {
  const { clearAccessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/logout");
      return data;
    },
    onSuccess: () => {
      clearAccessToken();
      queryClient.removeQueries({
        queryKey: ["profile"],
      });
      router.replace("/login"); // Hoặc trang bạn muốn sau khi logout
    },
  });
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return data;
    },
  });
}

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: { token: string; newPassword: string }) => {
      const { data } = await axiosInstance.post(
        "/auth/reset-password",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      router.replace("/login"); // Hoặc trang bạn muốn sau khi logout
    },
  });
}
