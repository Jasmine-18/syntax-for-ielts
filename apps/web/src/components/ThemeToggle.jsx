import React from 'react';
import {useTheme} from '../theme/useTheme'; // adjust path if this file lives elsewhere

export default function ThemeToggle({className = ''}) {
  const {theme, toggleTheme, isDark} = useTheme ();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`${className} px-3 py-2 text-sm rounded-lg transition border ${isDark ? 'border-white/10 bg-black hover:bg-white/5' : 'border-black/10 bg-white hover:bg-black/5'}`}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
