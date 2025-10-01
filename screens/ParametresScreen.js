// Parametres.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext'; // Ampiana mba hampiasa ny contexte

export default function ParametresScreen() {
  const navigation = useNavigation();
  const { theme, toggleTheme, toggleSound, toggleVibration } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.main}>
        {/* Fizarana momba ny Thème */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Thème</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.themeButton} onPress={() => toggleTheme('light')}>
              <Icon name="light-mode" size={24} color="#000" />
              <Text style={styles.themeButtonText}>Clair</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.themeButton} onPress={() => toggleTheme('dark')}>
              <Icon name="dark-mode" size={24} color="#fff" />
              <Text style={[styles.themeButtonText, { color: '#fff' }]}>Sombre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fizarana momba ny feo sy vibration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sons & Vibrations</Text>
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Activer les sons</Text>
            <Switch onValueChange={toggleSound} value={theme.soundEnabled} />
          </View>
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Activer les vibrations</Text>
            <Switch onValueChange={toggleVibration} value={theme.vibrationEnabled} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  main: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  themeButtonText: {
    marginLeft: 5,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionLabel: {
    fontSize: 16,
  },
});