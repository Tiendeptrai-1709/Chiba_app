import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { OrderType } from "../types";
import { useAuthStore } from "../stores/useAuthStore";

export interface CreateOrderPayload {
  orderType: OrderType;
  deliveryAddress?: string;
  pointsUsed?: number;
  note?: string;
}

export const useCheckout = (axiosInstance: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      console.log("useCheckout: ", payload);
      await axiosInstance.post("/order/checkout", payload);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orders"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["profile"],
        }),
      ]);
    },
  });
};

export const useGetOrders = (axiosInstance: AxiosInstance) => {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/order");
      return data;
    },
    enabled: !!accessToken,
  });
};

export const useUpdateOrderStatus = (axiosInstance: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: {
      orderId: string;
      newStatus: string;
    }) => {
      await axiosInstance.patch(`/order/${orderId}`, { newStatus });
    },
    onSuccess: (_data, variables) => {
      // Tải lại danh sách đơn hàng
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      // Tải lại chi tiết đơn vừa cập nhật
      queryClient.invalidateQueries({
        queryKey: ["order", variables.orderId],
      });
    },
  });
};

export const useGetOrderById = (
  axiosInstance: AxiosInstance,
  orderId: string,
) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/order/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useCancelOrder = (axiosInstance: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await axiosInstance.patch(`/order/${orderId}/cancel`);

      return data;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["orders"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["order"],
        }),
      ]);
    },
  });
};
