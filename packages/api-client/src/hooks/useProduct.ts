import { axiosInstance } from "./../lib/createApiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { useNotificationStore } from "../stores/useNotificationStore";

export const useCreateProduct = (axiosInstance: AxiosInstance) => {
  const { showError, showSuccess } = useNotificationStore();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      price: number;
      imageUrl: string;
      category: string;
    }) => {
      const { data } = await axiosInstance.post("/product/create", payload);
      return { data };
    },

    onSuccess: () => {
      showSuccess("Thêm sản phẩm thành công");
    },

    onError: () => {
      showError("Thêm sản phẩm thất bại");
    },
  });
};

export const useGetProduct = (axiosInstance: AxiosInstance, id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/product/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useGetAllProduct = (axiosInstance: AxiosInstance) => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/product");
      return data;
    },
    initialData: [],
  });
};

export const useUpdateProduct = (axiosInstance: AxiosInstance) => {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        name: string;
        price: number;
        imageUrl: string;
        category: string;
      };
    }) => {
      const { data } = await axiosInstance.patch(`/product/${id}`, payload);
      return data;
    },
  });
};

export const useDeleteProduct = (axiosInstance: AxiosInstance) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/product/${id}`);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
