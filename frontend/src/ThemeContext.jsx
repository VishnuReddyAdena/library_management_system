import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ isDark: true, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('lms_theme') !== 'light'; } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('lms_theme', isDark ? 'dark' : 'light'); } catch {}
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('lms-light');
      html.classList.add('lms-dark');
      document.body.classList.remove('admin-light-mode');
    } else {
      html.classList.remove('lms-dark');
      html.classList.add('lms-light');
      document.body.classList.add('admin-light-mode');
    }
  }, [isDark]);

  const toggle = () => setIsDark(d => !d);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
