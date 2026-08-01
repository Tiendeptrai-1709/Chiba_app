import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useProfile = () => {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/users/profile");
      return data;
    },
    enabled: !!accessToken,
  });
};

export const useDeleteProfile = () => {
  const router = useRouter();

  const clearAccessToken = useAuthStore((s) => s.clearAccessToken);

  return useMutation({
    mutationFn: async (typeDel: "HARD" | "SOFT") => {
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
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.patch("/users/profile", data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    }
  });
};
