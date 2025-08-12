import React, {createContext, useEffect, useMemo, useState} from 'react';

const ThemeContext = createContext (undefined);

export default function ThemeProvider({children}) {
  const [theme, setTheme] = useState (
    () =>
      typeof window !== 'undefined'
        ? localStorage.getItem ('theme') || 'dark'
        : 'dark'
  );

  useEffect (
    () => {
      // Apply Tailwind dark class to <html>
      document.documentElement.classList.toggle ('dark', theme === 'dark');
      try {
        localStorage.setItem ('theme', theme);
      } catch (err) {
        // Safari private mode or blocked storage
        console.error ('Failed to save theme', err);
      }
    },
    [theme]
  );

  const toggleTheme = () =>
    setTheme (prev => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo (
    () => ({theme, toggleTheme, isDark: theme === 'dark'}),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// export for the hook file
export {ThemeContext};
