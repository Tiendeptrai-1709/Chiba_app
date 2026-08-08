
import { useNotificationStore } from "../stores/useNotificationStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosInstance } from "axios";
import { useRouter } from "next/navigation";

export const useLogin = (axiosInstance:AxiosInstance) => {
  const { setAccessToken } = useAuthStore();
  const { showSuccess, showError } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      console.log("first1",payload)
      const { data } = await axiosInstance.post("/auth/login", payload);
      console.log("login: ", data);
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
};

export const useRegister = (axiosInstance:AxiosInstance) => {
  const { showSuccess, showError } = useNotificationStore();

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
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showError(error.response?.data.message);
      } else {
        showError("Có lỗi xảy ra");
      }
    },
  });
};

export const useLogout = (axiosInstance:AxiosInstance) => {
  const { clearAccessToken } = useAuthStore();
  const queryClient = useQueryClient();

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
    },
  });
};

export const useForgotPassword = (axiosInstance:AxiosInstance) => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return data;
    },
  });
};

export const useResetPassword = (axiosInstance:AxiosInstance) => {

  return useMutation({
    mutationFn: async (payload: { token: string; newPassword: string }) => {
      const { data } = await axiosInstance.post(
        "/auth/reset-password",
        payload,
      );
      return data;
    },
  });
};
