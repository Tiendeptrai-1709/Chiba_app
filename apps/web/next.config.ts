import type { NextConfig } from "next";
import { networkInterfaces } from "os";

// Các địa chỉ được phép mở web khi chạy `next dev` ngoài localhost:
// - IP mạng LAN của máy (điện thoại cùng Wi-Fi: http://<IP>:3000)
// - Link Cloudflare Tunnel tạm (https://xxx.trycloudflare.com)
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [...lanAddresses, "*.trycloudflare.com"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
