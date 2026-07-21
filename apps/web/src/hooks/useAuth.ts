import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useLogin() {
  const { setAccessToken } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await axiosInstance.post("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      router.push("/");
    },
  });
}
