import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosInstance } from "axios";
import { useNotificationStore } from "../stores/useNotificationStore";

export const useCreateProduct = (axiosInstance: AxiosInstance) => {
  const { showError, showSuccess } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      price: number;
      imageUrl:
        | File
        | {
            uri: string;
            name: string;
            type: string;
          };
      category: string;
    }) => {
      console.log(
        "🚀 ~ file: useProduct.ts:17 ~ mutationFn: ~ payload:",
        payload,
      );
      const formData = new FormData();

      formData.append("name", payload.name);
      formData.append("price", String(payload.price));
      formData.append("category", payload.category);

      // KHÔNG cần biết đang chạy web hay mobile — chỉ cần hỏi:
      // "object này có phải Blob/File thật không?"
      // - true  -> web, append trực tiếp (không cần fetch lại từ URI)
      // - false -> mobile, append object {uri,name,type} y như nó vốn có
      const isRealBlob =
        typeof Blob !== "undefined" && payload.imageUrl instanceof Blob;

      if (isRealBlob) {
        const file = payload.imageUrl as File;
        formData.append("image", file, file.name || "product.jpg");
      } else {
        formData.append("image", payload.imageUrl as any);
      }

      const { data } = await axiosInstance.post("/product/create", formData);
      console.log("🚀 ~ file: useProduct.ts:35 ~ mutationFn: ~ data:", data);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      showSuccess("Thêm sản phẩm thành công");
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showError(error.response?.data?.message ?? "Thêm sản phẩm thất bại");
      } else {
        showError("Thêm sản phẩm thất bại");
      }
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
  const { showError, showSuccess } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        name: string;
        price: number;
        imageUrl:
          | File
          | {
              uri: string;
              name: string;
              type: string;
            };
        category: string;
      };
    }) => {
      console.log("update hooks: ", id, payload);
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("price", String(payload.price));
      formData.append("category", payload.category);

      // Chỉ gửi image nếu user chọn ảnh mới
      if (payload.imageUrl) {
        const isRealBlob =
          typeof Blob !== "undefined" && payload.imageUrl instanceof Blob;

        if (isRealBlob) {
          const file = payload.imageUrl as File;

          formData.append("image", file, file.name || "product.jpg");
        } else {
          formData.append("image", payload.imageUrl as any);
        }
      }

      const { data } = await axiosInstance.patch(`/product/${id}`, formData);
      console.log("updatedddddd: ", data);
      return data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.id],
      });
      showSuccess("Sửa sản phẩm thành công");
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

export const useDeleteProduct = (axiosInstance: AxiosInstance) => {
  const { showError, showSuccess } = useNotificationStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/product/${id}`);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccess("Xóa sản phẩm thành công");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showError(error.response?.data?.message ?? "Xóa sản phẩm thất bại");
      } else {
        showError("Xóa sản phẩm thất bại");
      }
    },
  });
};
