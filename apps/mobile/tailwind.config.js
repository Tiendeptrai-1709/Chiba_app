/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
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
        },

        destructive: {
          DEFAULT: "#C82333",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        // Cần load font Inter qua expo-font, xem ghi chú bên dưới
        sans: ["Inter"],
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
