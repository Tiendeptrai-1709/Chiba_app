import { axiosInstance } from "./../lib/createApiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { Cart } from "../types";

export const useGetCart = (axiosInstance: AxiosInstance) => {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/cart");
      return data;
    },
    enabled: !!accessToken,
  });
};

export const useAddCartItems = (axiosInstance: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      quantity: number;
      toppingIds: string[];
    }) => {
      console.log("first", payload);
      await axiosInstance.post("/cart/items", payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};

export const useUpdateItem = (axiosInstance: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      await axiosInstance.patch(`/cart/items/${itemId}`, { quantity });
    },

    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData(["cart"]);
      queryClient.setQueryData(["cart"], (old: Cart) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        };
      });
      return { previousCart };
    },

    onError: (_error, _variables, context) => {
      // API fail → rollback
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },

    onSettled: () => {
      // Đồng bộ lại với server
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};

export const useRemoveItem = (axiosInstance: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await axiosInstance.delete(`/cart/items/${itemId}`);
    },

    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData(["cart"]);
      queryClient.setQueryData(["cart"], (old: Cart) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.filter((item) => item.id !== itemId),
        };
      });
      return { previousCart };
    },

    onError: (_error, _variables, context) => {
      // API fail → rollback
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },

    onSettled: () => {
      // Đồng bộ lại với server
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};

export const useClearCart = (axiosInstance: AxiosInstance) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete("/cart");
    },
    onSuccess: async () => {
      // Cập nhật cache ngay sau khi API thành công
      queryClient.setQueryData(["cart"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: [],
        };
      });

      // Tiếp tục đồng bộ với backend
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};
