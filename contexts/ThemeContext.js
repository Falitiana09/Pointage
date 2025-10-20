import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext({
  theme: {},
  toggleTheme: () => {},
  toggleSound: () => {},
  toggleVibration: () => {},
  soundEnabled: true,      // ⚠️ ajouté ici
  vibrationEnabled: true,  // ⚠️ ajouté ici
});

// ------------------- THÈMES -------------------
const lightTheme = {
  colors: {
    header: '#fff',
    background: '#f5f5f5',
    text: '#000',
    text_rgb: '0, 0, 0',
    border: '#ddd',
    placeholder: '#999',
    primary: '#007bff',
    primary_rgb: '0, 123, 255',
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
    text_rgb: '255, 255, 255',
    border: '#555',
    placeholder: '#888',
    primary: '#4CAF50',
    primary_rgb: '76, 175, 80',
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

// ------------------- PROVIDER -------------------
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(
    Appearance.getColorScheme() === 'dark' ? darkTheme : lightTheme
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setCurrentTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = (mode) => {
    setCurrentTheme(mode === 'dark' ? darkTheme : lightTheme);
  };

  const toggleSound = () => {
    setCurrentTheme(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleVibration = () => {
    setCurrentTheme(prev => ({ ...prev, vibrationEnabled: !prev.vibrationEnabled }));
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: currentTheme, 
      toggleTheme, 
      toggleSound, 
      toggleVibration,
      soundEnabled: currentTheme.soundEnabled,      // ✅ ajouté
      vibrationEnabled: currentTheme.vibrationEnabled, // ✅ ajouté
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ------------------- HOOK -------------------
export const useTheme = () => useContext(ThemeContext);
