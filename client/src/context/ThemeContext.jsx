import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Themes: 'light' | 'dark' | 'high-contrast'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('parivar_theme') || 'light';
  });

  // Font sizes: 'small' (14px) | 'normal' (16px) | 'large' (18px) | 'xlarge' (20px)
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('parivar_font_size') || 'normal';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('parivar_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('parivar_font_size', fontSize);
  }, [fontSize]);

  const toggleHighContrast = () => {
    setTheme(prev => (prev === 'high-contrast' ? 'light' : 'high-contrast'));
  };

  const toggleDarkTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => {
      if (prev === 'xlarge') return 'large';
      if (prev === 'large') return 'normal';
      return 'small';
    });
  };

  const resetFontSize = () => {
    setFontSize('normal');
  };

  const increaseFontSize = () => {
    setFontSize(prev => {
      if (prev === 'small') return 'normal';
      if (prev === 'normal') return 'large';
      return 'xlarge';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleHighContrast,
        toggleDarkTheme,
        fontSize,
        decreaseFontSize,
        resetFontSize,
        increaseFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
