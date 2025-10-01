import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { useTheme } from '../contexts/ThemeContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, changeTheme, toggleSound, toggleVibration } = useTheme();

  // Définition des boutons (Remplacement des noms en français)
  const buttonsData = [
    { name: 'Enregistrement', icon: 'person-add', screen: 'Enregistrement', color: '#4caf50ff' },
    { name: 'Liste des employés', icon: 'people', screen: 'Listes des employés', color: '#2196f3ff' },
    { name: 'Pointage', icon: 'access-time', screen: 'Pointage', color: '#ff9800ff' }, 
    { name: 'Historique', icon: 'history', screen: 'Historique', color: '#9c27b0ff' }, 
    { name: 'Statistiques', icon: 'leaderboard', screen: 'Histogramme', color: '#f44336ff' },
    { name: 'À propos', icon: 'info', screen: 'Apropos', color: '#00bcd4ff' }, // 'Aide' devient 'À propos'
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* EN-TÊTE (HEADER) */}
      <View style={[styles.header, { backgroundColor: theme.colors.header }]}>
        <View style={styles.leftHeader}>
          {/* Correction: Enlèvement des guillemets autour du style pour de meilleures pratiques */}
          <Text style={[styles.headerText, {color: theme.colors.text, marginLeft: 10, fontSize: 30}]}>Pointage Ny Havana</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Parametres')}>
          <Icon name="settings" size={35} color='#c4c4c4ff' />
        </TouchableOpacity>
      </View>

      {/* CORPS - GRILLE DES BOUTONS */}
      <ScrollView contentContainerStyle={styles.main}>
        <View style={styles.buttonsGrid}>
          {buttonsData.map((button, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.gridButton, { backgroundColor: button.color }]}
              onPress={() => navigation.navigate(button.screen)}
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
  container: {
    flex: 1,
    paddingTop: 40,
  },

  header: {
    color: 'red',
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 30,
    fontFamily: 'monoscape',
    borderRadius: 30,
    borderColor: '#c9c9c9ff',
    borderWidth: 1,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50, 
    height: 50,
    borderRadius: 50, // 100%
  },
  headerText: {
    fontSize: 28, 
    fontWeight: 'bold',
  },
  main: {
    padding: 10, 
    marginTop: 40,
    alignItems: 'center',
    gap: 5,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-around', 
    width: '100%',
    marginBottom: 2,
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
    marginHorizontal: '2%', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 15, 
    fontWeight: 'bold',
    marginTop: 5, 
    textAlign: 'center',
  },
  buttonIcon: {
    marginBottom: 3,
  },
});