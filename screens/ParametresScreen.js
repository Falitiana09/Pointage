import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

export default function ParametresScreen() {
  const { theme, toggleTheme, toggleSound } = useTheme(); 

  // Déterminer le mode actuel selon theme.colors.background
  const currentMode = theme.colors.background === '#121212' ? 'dark' : 'light';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.main}>
        {/* Thème */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Thème</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.themeButton, currentMode === 'light' && styles.activeThemeButton]}
              onPress={() => toggleTheme('light')}
            >
              <Icon name="light-mode" size={24} color="#000" />
              <Text style={styles.themeButtonText}>Clair</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeButton, currentMode === 'dark' && styles.activeThemeButton]}
              onPress={() => toggleTheme('dark')}
            >
              <Icon name="dark-mode" size={24} color="#fff" />
              <Text style={[styles.themeButtonText, { color: '#fff' }]}>Sombre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Son */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Son</Text>
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Activer le son</Text>
            <Switch
              value={theme.soundEnabled} // ← utilisation correcte
              onValueChange={toggleSound} // bascule le son
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={theme.soundEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  main: { padding: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  optionsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  activeThemeButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  themeButtonText: { marginLeft: 5, fontWeight: 'bold' },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionLabel: { fontSize: 16 },
});
