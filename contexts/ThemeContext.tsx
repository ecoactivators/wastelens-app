import React, { createContext, useContext, useState } from 'react';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    primary: string;
    primaryLight: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    shadow: string;
    overlay: string;
    tabBar: string;
    tabBarBorder: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    background: '#f9fafb',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    primary: '#10b981',
    primaryLight: '#dcfce7',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#e5e7eb',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    tabBar: '#ffffff',
    tabBarBorder: '#f0f0f0',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    background: '#000000',
    surface: '#0a0a0a',
    card: '#111111',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    textTertiary: '#71717a',
    primary: '#10b981',
    primaryLight: '#052e16',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#1f1f23',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.9)',
    tabBar: '#000000',
    tabBarBorder: '#1f1f23',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to light mode instead of system preference
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}