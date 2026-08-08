
import { axiosInstance } from "@chiba/api-client";

export const api = axiosInstance(
  "http://localhost:3001",
);
// export const axiosInstance = axios.create({
//   baseURL:
//     process.env.NODE_ENV === "production"
//       ? process.env.PRODUCTION_URL
//       : "http://localhost:3001",
//   withCredentials: true,
// });

// //Chặn request để kiểm tra trước khi gửi về backend
// axiosInstance.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().accessToken;

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// let isRefreshing = false;

// //Lưu lại request vào hàng đợi
// let refreshQueue: (() => void)[] = [];

// //Chặn response gửi từ backend lên frontend để kiểm tra
// axiosInstance.interceptors.response.use(
//   (response) => response, //nếu gọi thành công trả về response bình thường
//   async (error) => {
//     const originalRequest = error.config; //nếu lỗi thì lưu lại lỗi

//     //Nếu bị lỗi và request chưa được gọi lại
//     const isAuthRoute =
//       originalRequest.url?.includes("/auth/login") ||
//       originalRequest.url?.includes("/auth/refresh");
//     if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
//       originalRequest._retry = true; // đánh dấu đã đc gọi 1 lần

//       const { clearAccessToken, setAccessToken } = useAuthStore.getState();

//       if (isRefreshing) {
//         //Tạo Promise tạm dừng request và đẩy vào hàng đợi
//         return new Promise((resolve) => {
//           refreshQueue.push(() => {
//             resolve(axiosInstance(originalRequest));
//           });
//         });
//       }
//       isRefreshing = true;

//       try {
//         //Gọi API cấp token mới
//         const { data } = await axios.post(
//           "http://localhost:3001/auth/refresh",
//           {},
//           { withCredentials: true },
//         );

//         setAccessToken(data.accessToken); //Cập nhật accessToken mới
//         refreshQueue.forEach(c=>c()); //Chạy các request trong hàng chờ
//         refreshQueue = []; //Xóa hàng chờ

//         //Thực hiện request còn bị lỗi 401
//         return axiosInstance(originalRequest)
//       } catch (error) {
//         //Nếu refreshToken cũng hết hạn thì xóa luôn accessToken và đá về login lại
//         clearAccessToken();
//         window.location.href="/login"
//         return Promise.reject(error) //Báo lỗi ._retry cho originRequest
//       }
//       finally{
//         isRefreshing=false;
//       }
//     }
//     return Promise.reject(error)
//   },
// );
