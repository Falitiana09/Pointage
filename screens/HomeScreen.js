// HomeScreen.js
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { Audio } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, soundEnabled } = useTheme(); // On récupère soundEnabled depuis le context

  // --- Fonction pour jouer le son seulement si soundEnabled est true ---
  const playClickSound = async () => {
    if (!soundEnabled) return; // Ne joue pas le son si désactivé
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/click.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.warn('Erreur lecture son:', error);
    }
  };

  // --- Liste des boutons ---
  const buttonsData = [
    { name: 'Enregistrement', icon: 'person-add', screen: 'Enregistrement', color: '#4caf50ff' },
    { name: 'Liste des employés', icon: 'people', screen: 'Listes des employés', color: '#2196f3ff' },
    { name: 'Pointage', icon: 'access-time', screen: 'Pointage', color: '#ff9800ff' }, 
    { name: 'Historique', icon: 'history', screen: 'Historique', color: '#9c27b0ff' }, 
    { name: 'Histogramme', icon: 'leaderboard', screen: 'Histogramme', color: '#f44336ff' },
    { name: 'À propos', icon: 'info', screen: 'Apropos', color: '#00bcd4ff' },
  ];

  // --- Action lors du clic sur un bouton ---
  const handleButtonPress = async (screen) => {
    await playClickSound();
    navigation.navigate(screen);
  };

  // --- Action sur le bouton paramètres ---
  const handleParametresPress = async () => {
    await playClickSound();
    navigation.navigate('Parametres');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.colors.header }]}>
        <View style={styles.leftHeader}>
          <Text style={[styles.headerText, {color: theme.colors.text}]}>
            Pointage Ny Havana
          </Text>
        </View>

        <TouchableOpacity onPress={handleParametresPress}>
          <Icon name="settings" size={30} color="#c4c4c4ff" />
        </TouchableOpacity>
      </View>

      {/* BOUTONS */}
      <ScrollView contentContainerStyle={styles.main}>
        <View style={styles.buttonsGrid}>
          {buttonsData.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.gridButton, { backgroundColor: button.color }]}
              onPress={() => handleButtonPress(button.screen)}
            >
              <Icon name={button.icon} size={70} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{button.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 25,
    borderRadius: 30,
    borderColor: '#c9c9c9ff',
    borderWidth: 1,
  },
  leftHeader: { flexDirection: 'row', alignItems: 'center' },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  main: { padding: 10, marginTop: 40, alignItems: 'center', gap: 5 },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  gridButton: {
    width: '45%',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    minHeight: 140,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  buttonIcon: { marginBottom: 3 },
});
