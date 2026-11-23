import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        comic: ['Bangers', 'Comic Neue', 'cursive', 'sans-serif'],
        handwritten: ['Caveat', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        desk: {
          bg: '#F5EFEB',
          cork: '#C89D7C',
          wood: '#4A3525',
          dark: '#1E293B',
          paperWhite: '#FFFDF9',
          paperCream: '#FAF3E0',
          paperYellow: '#FEF9C3',
          paperPink: '#FFE4E6',
          paperBlue: '#E0F2FE',
          paperGreen: '#DCFCE7',
          paperPurple: '#F3E8FF',
          inkNavy: '#0F172A',
          comicRed: '#EF4444',
          comicYellow: '#FBBF24',
          comicBlue: '#3B82F6',
          comicOrange: '#F97316',
          comicGreen: '#10B981',
        },
      },
      boxShadow: {
        paper: '2px 4px 12px rgba(15, 23, 42, 0.12), 0 1px 3px rgba(15, 23, 42, 0.08)',
        paperHover: '4px 12px 24px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.12)',
        paperDrag: '8px 24px 36px rgba(15, 23, 42, 0.25), 0 4px 10px rgba(15, 23, 42, 0.15)',
        comic: '3px 3px 0px #0F172A',
        comicLg: '5px 5px 0px #0F172A',
        comicPressed: '1px 1px 0px #0F172A',
      },
    },
  },
  plugins: [],
} satisfies Config;
