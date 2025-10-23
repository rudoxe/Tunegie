import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Define color themes
export const themes = {
  green: {
    name: 'Emerald Night',
    primary: 'emerald-500',
    primaryHover: 'emerald-600',
    primaryLight: 'emerald-400',
    primaryDark: 'emerald-700',
    accent: 'green-400',
    accentHover: 'green-300',
    background: 'from-black via-gray-900 to-emerald-900',
    backgroundSecondary: 'from-gray-900 to-emerald-800',
    surface: 'black/70',
    surfaceBorder: 'emerald-500/30',
    text: 'gray-100',
    textSecondary: 'gray-200',
    textMuted: 'gray-300',
    textNav: 'gray-100',
    cardBg: 'black/50',
    bgDark: 'black/70',
    border: 'emerald-500/30',
    ring: 'emerald-500',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]',
    css: {
      '--theme-primary': '16 185 129',
      '--theme-accent': '34 197 94',
      '--theme-glow': '16 185 129'
    }
  },
  purple: {
    name: 'Mystic Purple',
    primary: 'violet-500',
    primaryHover: 'violet-600',
    primaryLight: 'violet-400',
    primaryDark: 'violet-700',
    accent: 'purple-400',
    accentHover: 'purple-300',
    background: 'from-black via-gray-900 to-violet-900',
    backgroundSecondary: 'from-gray-900 to-purple-800',
    surface: 'black/70',
    surfaceBorder: 'violet-500/30',
    text: 'gray-100',
    textSecondary: 'gray-200',
    textMuted: 'gray-300',
    textNav: 'gray-100',
    cardBg: 'black/50',
    bgDark: 'black/70',
    border: 'violet-500/30',
    ring: 'violet-500',
    glow: 'shadow-[0_0_15px_rgba(139,69,193,0.6)]',
    css: {
      '--theme-primary': '139 69 193',
      '--theme-accent': '168 85 247',
      '--theme-glow': '139 69 193'
    }
  },
  blue: {
    name: 'Ocean Deep',
    primary: 'blue-500',
    primaryHover: 'blue-600',
    primaryLight: 'blue-400',
    primaryDark: 'blue-700',
    accent: 'cyan-400',
    accentHover: 'cyan-300',
    background: 'from-black via-gray-900 to-blue-900',
    backgroundSecondary: 'from-gray-900 to-blue-800',
    surface: 'black/70',
    surfaceBorder: 'blue-500/30',
    text: 'gray-100',
    textSecondary: 'gray-200',
    textMuted: 'gray-300',
    textNav: 'gray-100',
    cardBg: 'black/50',
    bgDark: 'black/70',
    border: 'blue-500/30',
    ring: 'blue-500',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]',
    css: {
      '--theme-primary': '59 130 246',
      '--theme-accent': '34 211 238',
      '--theme-glow': '59 130 246'
    }
  },
  orange: {
    name: 'Sunset Fire',
    primary: 'orange-500',
    primaryHover: 'orange-600',
    primaryLight: 'orange-400',
    primaryDark: 'orange-700',
    accent: 'amber-400',
    accentHover: 'amber-300',
    background: 'from-black via-gray-900 to-orange-900',
    backgroundSecondary: 'from-gray-900 to-orange-800',
    surface: 'black/70',
    surfaceBorder: 'orange-500/30',
    text: 'gray-100',
    textSecondary: 'gray-200',
    textMuted: 'gray-300',
    textNav: 'gray-100',
    cardBg: 'black/50',
    bgDark: 'black/70',
    border: 'orange-500/30',
    ring: 'orange-500',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]',
    css: {
      '--theme-primary': '249 115 22',
      '--theme-accent': '251 191 36',
      '--theme-glow': '249 115 22'
    }
  },
  red: {
    name: 'Crimson Night',
    primary: 'red-500',
    primaryHover: 'red-600',
    primaryLight: 'red-400',
    primaryDark: 'red-700',
    accent: 'rose-400',
    accentHover: 'rose-300',
    background: 'from-black via-gray-900 to-red-900',
    backgroundSecondary: 'from-gray-900 to-red-800',
    surface: 'black/70',
    surfaceBorder: 'red-500/30',
    text: 'gray-100',
    textSecondary: 'gray-200',
    textMuted: 'gray-300',
    textNav: 'gray-100',
    cardBg: 'black/50',
    bgDark: 'black/70',
    border: 'red-500/30',
    ring: 'red-500',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.6)]',
    css: {
      '--theme-primary': '239 68 68',
      '--theme-accent': '251 113 133',
      '--theme-glow': '239 68 68'
    }
  },
  pink: {
    name: 'Neon Dreams',
    primary: 'pink-500',
    primaryHover: 'pink-600',
    primaryLight: 'pink-400',
    primaryDark: 'pink-700',
    accent: 'fuchsia-400',
    accentHover: 'fuchsia-300',
    background: 'from-black via-gray-900 to-pink-900',
    backgroundSecondary: 'from-gray-900 to-pink-800',
    surface: 'black/70',
    surfaceBorder: 'pink-500/30',
    text: 'gray-100',
    textSecondary: 'gray-200',
    textMuted: 'gray-300',
    textNav: 'gray-100',
    cardBg: 'black/50',
    bgDark: 'black/70',
    border: 'pink-500/30',
    ring: 'pink-500',
    glow: 'shadow-[0_0_15px_rgba(236,72,153,0.6)]',
    css: {
      '--theme-primary': '236 72 153',
      '--theme-accent': '232 121 249',
      '--theme-glow': '236 72 153'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('green');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('tunegie_theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply CSS custom properties to root element
    const root = document.documentElement;
    const theme = themes[currentTheme];
    
    Object.entries(theme.css).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('tunegie_theme', themeName);
    }
  };

  const theme = themes[currentTheme];

  const value = {
    currentTheme,
    theme,
    themes,
    changeTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};


