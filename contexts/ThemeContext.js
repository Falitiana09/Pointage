import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

// Famaritana ny thèmes roa
const lightTheme = {
  colors: {
    header: '#fff',
    background: '#f5f5f5',
    text: '#000',
    text_rgb: '0, 0, 0', // RGB for black
    border: '#ddd',
    placeholder: '#999',
    primary: '#007bff', // Loko manga
    primary_rgb: '0, 123, 255', // RGB for #007bff
    card: '#fff',
    textSecondary: '#666',
    shadow: '#000',
    modalBackground: 'rgba(0,0,0,0.4)',
    inputBackground: '#fff',
    cancelButton: '#6c757d',
    confirmButton: '#28a745',
    codeBackground: '#e6f7ff',
    codeText: '#d9534f',
    resultBackground: '#e6f7ff',
    resultBorder: '#b3e0ff',
  },
  soundEnabled: true,
  vibrationEnabled: true,
};

const darkTheme = {
  colors: {
    header: '#333',
    background: '#121212',
    text: '#fff',
    text_rgb: '255, 255, 255', // RGB for white
    border: '#555',
    placeholder: '#888',
    primary: '#4CAF50',
    primary_rgb: '76, 175, 80', // RGB for #4CAF50
    card: '#1e1e1e',
    textSecondary: '#ccc',
    shadow: '#fff',
    modalBackground: 'rgba(0,0,0,0.7)',
    inputBackground: '#1e1e1e',
    cancelButton: '#6c757d',
    confirmButton: '#28a745',
    codeBackground: '#444',
    codeText: '#ffc107',
    resultBackground: '#1a324a',
    resultBorder: '#36537a',
  },
  soundEnabled: true,
  vibrationEnabled: true,
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(Appearance.getColorScheme() === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme === 'dark') {
        setCurrentTheme(darkTheme);
      } else {
        setCurrentTheme(lightTheme);
      }
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = (mode) => {
    if (mode === 'dark') {
      setCurrentTheme(darkTheme);
    } else {
      setCurrentTheme(lightTheme);
    }
  };

  const toggleSound = () => {
    setCurrentTheme(prevTheme => ({
      ...prevTheme,
      soundEnabled: !prevTheme.soundEnabled,
    }));
  };

  const toggleVibration = () => {
    setCurrentTheme(prevTheme => ({
      ...prevTheme,
      vibrationEnabled: !prevTheme.vibrationEnabled,
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, toggleSound, toggleVibration }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);