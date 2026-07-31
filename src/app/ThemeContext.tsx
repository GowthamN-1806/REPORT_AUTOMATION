import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkModeState] = useState(() => {
    const saved = localStorage.getItem('acutix-dark-mode');
    return saved === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('acutix-dark-mode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkModeState(prev => !prev);
  const setDarkMode = (value: boolean) => setDarkModeState(value);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
