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
    accent: string;
    surfaceElevated: string;
    surfacePressed: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    background: '#fafafa',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#0a0a0a',
    textSecondary: '#525252',
    textTertiary: '#a3a3a3',
    primary: '#000000',
    primaryLight: '#f5f5f5',
    success: '#16a34a',
    warning: '#ea580c',
    error: '#dc2626',
    border: '#e5e5e5',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
    tabBar: '#ffffff',
    tabBarBorder: '#e5e5e5',
    accent: '#3b82f6',
    surfaceElevated: '#ffffff',
    surfacePressed: '#f5f5f5',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    background: '#000000',
    surface: '#0a0a0a',
    card: '#111111',
    text: '#ffffff',
    textSecondary: '#a3a3a3',
    textTertiary: '#525252',
    primary: '#ffffff',
    primaryLight: '#1a1a1a',
    success: '#16a34a',
    warning: '#ea580c',
    error: '#dc2626',
    border: '#1a1a1a',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.9)',
    tabBar: '#000000',
    tabBarBorder: '#1a1a1a',
    accent: '#3b82f6',
    surfaceElevated: '#111111',
    surfacePressed: '#1a1a1a',
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