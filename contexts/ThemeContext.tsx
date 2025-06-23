import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: '#10b981',
    primaryLight: '#d1fae5',
    secondary: '#3b82f6',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#10b981',
    primaryLight: '#064e3b',
    secondary: '#3b82f6',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    border: '#374151',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveTheme = async (isDarkMode: boolean) => {
    try {
      await AsyncStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    saveTheme(newIsDark);
  };

  const setTheme = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    saveTheme(isDarkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}