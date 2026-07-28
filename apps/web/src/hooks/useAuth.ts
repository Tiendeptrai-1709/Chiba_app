import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useNotificationStore } from "@/lib/stores/useNotificationStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

export function useLogin() {
  const { setAccessToken } = useAuthStore();
  const { showSuccess, showError } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await axiosInstance.post("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      showSuccess("Đăng nhập thành công");

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

export function useRegister() {
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
        showError(error.response?.data.message ?? "Đăng nhập thất bại");
      }
    },
  });
}

export function useLogout() {
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

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return data;
    },
  });
}

export function useResetPassword() {
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
