import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";
import { AxiosInstance } from "axios";

export const useProfile = (axiosInstance:AxiosInstance) => {
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

export const useDeleteProfile = (axiosInstance:AxiosInstance) => {

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
    },
  });
};

export const useUpdateProfile = (axiosInstance:AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.patch("/users/profile", data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};
