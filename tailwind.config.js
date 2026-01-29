/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom dark theme colors
                dark: {
                    950: '#030712', // Added deep background
                    900: '#0a0f1c',
                    800: '#111827',
                    700: '#1f2937',
                    600: '#374151',
                },
                // Brand colors
                primary: {
                    DEFAULT: '#3b82f6',
                    light: '#60a5fa',
                    dark: '#2563eb',
                },
                secondary: {
                    DEFAULT: '#8b5cf6',
                    light: '#a78bfa',
                },
                // Category colors
                dream: '#f59e0b',
                target: '#3b82f6',
                safe: '#10b981',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-slow': 'pulse 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
