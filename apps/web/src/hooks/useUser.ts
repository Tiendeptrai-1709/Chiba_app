import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useProfile() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/users/profile");
      return data;
    },
    enabled: !!accessToken,
  });
}

export function useDeleteProfile() {
  const router = useRouter();

  const clearAccessToken = useAuthStore((s) => s.clearAccessToken);

  return useMutation({
    mutationFn: async (typeDel: "HARD" | "SOFT") => {
      console.log("use tanstack: ", typeDel);
      await axiosInstance.delete("/users/profile", {
        data: {
          typeDel,
        },
      });
    },

    onSuccess: () => {
      clearAccessToken();

      router.replace("/login");
    },
  });
}
