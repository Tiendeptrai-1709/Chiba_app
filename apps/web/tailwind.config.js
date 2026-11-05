// Màu lấy từ biến CSS dạng kênh "R G B" trong src/app/globals.css,
// nhờ vậy các class có độ mờ như bg-primary/10 hoạt động đúng.
const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: color("background"),
        foreground: color("foreground"),
        primary: {
          DEFAULT: color("primary"),
          foreground: color("primary-foreground"),
          hover: color("primary-hover"),
        },
        card: {
          DEFAULT: color("card"),
          foreground: color("card-foreground"),
        },
        border: color("border"),
        input: color("input"),
        ring: color("ring"),
        muted: {
          DEFAULT: color("muted"),
          foreground: color("muted-foreground"),
        },
        accent: {
          DEFAULT: color("accent"),
          foreground: color("accent-foreground"),
          strong: color("accent-strong"),
        },
        caramel: {
          DEFAULT: color("caramel"),
          foreground: color("caramel-foreground"),
        },
        cream: color("cream"),
        destructive: {
          DEFAULT: color("destructive"),
          foreground: color("destructive-foreground"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      boxShadow: {
        premium: "0 8px 30px rgb(0 0 0 / 0.04)",
        floating: "0 10px 40px rgb(0 0 0 / 0.08)",
        modal: "0 20px 50px rgb(0 0 0 / 0.12)",
      },
    },
  },
  plugins: [],
};
