import type { NextConfig } from "next";
import { networkInterfaces } from "os";

// Các địa chỉ được phép mở web khi chạy `next dev` ngoài localhost:
// - IP mạng LAN của máy (điện thoại cùng Wi-Fi: http://<IP>:3000)
// - Link Cloudflare Tunnel tạm (https://xxx.trycloudflare.com)
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

// Địa chỉ API mà máy chủ web chuyển tiếp /api/* tới.
// Máy dev: localhost:3001. Railway: địa chỉ mạng nội bộ của service API (xem docs/DEPLOY.md).
// Lưu ý: giá trị được "đóng băng" lúc build — đổi biến này phải build lại.
const apiInternalUrl = (process.env.API_INTERNAL_URL ?? "http://localhost:3001").replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [...lanAddresses, "*.trycloudflare.com"],
  // Không nén phản hồi ở tầng web: nén sẽ giữ lại luồng sự kiện đơn hàng (SSE) thay vì gửi ngay
  compress: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
