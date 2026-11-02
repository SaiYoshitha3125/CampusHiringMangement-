import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg 
        transition-all duration-200 cursor-pointer
        text-slate-500 hover:text-slate-900 hover:bg-slate-100
        dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/60
        focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2
        ${className}`}
    >
      {/* Sun icon — visible in dark mode to switch to light */}
      <Sun
        className={`absolute w-4.5 h-4.5 transition-all duration-300 ${
          isDark
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-75'
        }`}
      />
      {/* Moon icon — visible in light mode to switch to dark */}
      <Moon
        className={`absolute w-4.5 h-4.5 transition-all duration-300 ${
          isDark
            ? 'opacity-0 -rotate-90 scale-75'
            : 'opacity-100 rotate-0 scale-100'
        }`}
      />
    </button>
  );
}
