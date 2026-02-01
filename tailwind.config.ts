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
                    950: '#1E2A38', // Base background - brighter, desaturated
                    900: '#253344', // Main background - lighter variant
                    800: '#2D3E52', // Cards / Secondary - brighter
                    700: '#3A4B61', // Borders - more visible
                    600: '#4A5B72', // Muted text - brighter
                    500: '#5E6F85',
                    400: '#7A8B9E',
                    300: '#9CAAB8',
                    200: '#BDC8D1',
                    100: '#DDE5EA',
                    50: '#F2F6F9',
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
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont', 
                    'SF Pro Display',
                    'SF Pro Text',
                    'Helvetica Neue',
                    'Helvetica',
                    'Arial',
                    'sans-serif'
                ],
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
