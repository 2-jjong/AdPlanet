export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#87DEDA",
        background: "#1D1F33",
        "text-color": "#FFFFFF",
      },
      fontFamily: {
        kravo: ["Kravo", "system-ui", "sans-serif"],
        jamsil: ['"The Jamsil"', "system-ui", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        twinkle: {
          "0%": { opacity: "0.3" },
          "100%": { opacity: "1" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(100px) rotate(0deg)" },
          "100%": {
            transform: "rotate(360deg) translateX(100px) rotate(-360deg)",
          },
        },
        breath: {
          "0%": { transform: "scale(1)", opacity: "0.88" },
          "50%": { transform: "scale(1.12)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0.88" },
        },
        "planet-breath": {
          "0%": {
            transform: "translate(-50%, 50%) scale(0.9)",
            opacity: "0.8",
          },
          "50%": {
            transform: "translate(-50%, 50%) scale(1.15)",
            opacity: "1.2",
          },
          "100%": {
            transform: "translate(-50%, 50%) scale(0.9)",
            opacity: "0.8",
          },
        },
        typing: {
          "0%": { width: "0ch" },
          "100%": { width: "10ch" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeOut: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-20px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        twinkle: "twinkle 2s ease-in-out infinite alternate",
        orbit: "orbit 20s linear infinite",
        breath: "breath 2.2s ease-in-out infinite",
        "planet-breath": "planet-breath 2.2s ease-in-out infinite",
        typing: "typing 2s steps(10) infinite alternate",
        fadeIn: "fadeIn 0.8s ease-out forwards",
        fadeInUp: "fadeInUp 1s ease-out forwards",
        fadeOut: "fadeOut 0.5s ease-out forwards",
        "fadeIn-slow": "fadeIn 1.5s ease-out forwards",
        "fadeIn-fast": "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
