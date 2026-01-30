import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    950: '#020617', // Very dark background
                    900: '#0f172a', // Main background
                    800: '#1e293b', // Cards / Secondary
                    700: '#334155', // Borders
                    600: '#475569', // Muted text
                    500: '#64748b',
                    400: '#94a3b8',
                    300: '#cbd5e1',
                    200: '#e2e8f0',
                    100: '#f1f5f9',
                    50: '#f8fafc',
                },
                accent: {
                    DEFAULT: '#38bdf8', // Sky 400 - Primary Action
                    hover: '#0ea5e9',   // Sky 500
                    600: '#0284c7',     // Sky 600
                    700: '#0369a1',     // Sky 700
                    glow: 'rgba(56, 189, 248, 0.5)',
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
