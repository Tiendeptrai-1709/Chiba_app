/** @type {import('tailwindcss').Config} */
module.exports = {
  // App chỉ dùng giao diện sáng (app.json: userInterfaceStyle "light")
  darkMode: "class",
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Giá trị hex lấy trực tiếp từ :root trong globals.css bên web
        // (NativeWind không đọc được var(--xxx) như trình duyệt nên phải hardcode)
        background: "#FAF7F5",
        foreground: "#1F1914",

        primary: {
          DEFAULT: "#1E4620", // Deep Zen Green
          foreground: "#FFFFFF",
          hover: "#153216",
        },

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F1914",
        },

        border: "#EDE6DF",
        input: "#F3EAE1",
        ring: "#1E4620",

        muted: {
          DEFAULT: "#F3EAE1",
          foreground: "#6B5E53",
        },

        accent: {
          DEFAULT: "#D87D4A", // Cafe Warm Orange
          foreground: "#FFFFFF",
          strong: "#9A4A1F", // chữ cam trên nền sáng (đủ tương phản)
        },

        // Giống web (apps/web/src/app/globals.css)
        caramel: {
          DEFAULT: "#E6EFE2", // xanh nhạt — chip đang chọn, nút mềm, thanh điều hướng
          foreground: "#1E4620",
        },
        cream: "#FFFCF8",

        destructive: {
          DEFAULT: "#C82333",
          foreground: "#FFFFFF",
        },
      },
      boxShadow: {
        // Lưu ý: box-shadow trên RN chỉ hoạt động tốt trên iOS.
        // Android cần thêm "elevation" riêng (xem ghi chú).
        premium: "0 8px 30px rgba(0,0,0,0.04)",
        floating: "0 10px 40px rgba(0,0,0,0.08)",
        modal: "0 20px 50px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
