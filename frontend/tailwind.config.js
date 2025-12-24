/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFDF5",
        foreground: "#1E293B",
        muted: "#F1F5F9",
        "muted-foreground": "#64748B",
        accent: "#8B5CF6",
        "accent-foreground": "#FFFFFF",
        secondary: "#F472B6",
        tertiary: "#FBBF24",
        quaternary: "#34D399",
        border: "#E2E8F0",
        input: "#FFFFFF",
        card: "#FFFFFF",
        ring: "#8B5CF6",
      },
      fontFamily: {
        heading: ["Outfit", "system-ui", "sans-serif"],
        body: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        full: "9999px",
      },
      boxShadow: {
        pop: "4px 4px 0px 0px #1E293B",
        "pop-hover": "6px 6px 0px 0px #1E293B",
        "pop-active": "2px 2px 0px 0px #1E293B",
        "pop-pink": "8px 8px 0px #F472B6",
        "pop-violet": "8px 8px 0px #8B5CF6",
        "pop-yellow": "8px 8px 0px #FBBF24",
      },
      animation: {
        wiggle: "wiggle 0.3s ease-in-out",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        "spin-slow": "spin 3s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(3deg)" },
          "75%": { transform: "rotate(-3deg)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

