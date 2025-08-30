export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'float-1': 'float-1 6s ease-in-out infinite',
        'float-2': 'float-2 8s ease-in-out infinite',
        'float-3': 'float-3 7s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float-1': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        'float-2': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(-180deg)' },
        },
        'float-3': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-25px) rotate(90deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'noise': `
          radial-gradient(circle at 20% 80%, transparent 50%, rgba(34, 197, 94, 0.05) 100%),
          radial-gradient(circle at 80% 20%, transparent 50%, rgba(255, 255, 255, 0.05) 100%),
          radial-gradient(circle at 40% 40%, transparent 50%, rgba(34, 197, 94, 0.05) 100%)
        `,
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}