import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { Audio } from 'expo-av';

const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io'; 

const LoginScreen = () => {
  const navigation = useNavigation();
  const { theme, soundEnabled } = useTheme();
  const [numTel, setNumTel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🎵 Fonction pour jouer un son uniquement si soundEnabled = true
  const playSound = async (type = 'click') => {
    if (!soundEnabled) return; // 🔹 Ne joue pas si son désactivé
    try {
      let soundFile;
      switch(type){
        case 'success': soundFile = require('../assets/sounds/success.mp3'); break;
        case 'error': soundFile = require('../assets/sounds/error.mp3'); break;
        default: soundFile = require('../assets/sounds/click.mp3'); break;
      }
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 1000);
    } catch (error) {
      console.warn('Erreur son:', error);
    }
  };

  const handleLogin = async () => {
    await playSound('click'); // clic sur bouton
    if (!numTel || !motDePasse) {
      await playSound('error');
      alert('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/login-pointage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel: numTel, motDePasse }),
      });
      const data = await response.json();
      if (response.ok) {
        await playSound('success'); // succès login
        alert(data.message);
        navigation.navigate('Dashboard', { employee: data.employee });
      } else {
        await playSound('error'); // erreur login
        alert(data.message);
      }
    } catch (error) {
      await playSound('error');
      alert('Impossible de se connecter au serveur.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (setter, value) => {
    setter(value);
    await playSound('click'); // son à chaque saisie
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
        <Text style={[styles.titre, { color: theme.colors.primary }]}>Accès au pointage</Text>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
          <MaterialIcons name="phone" size={20} color={theme.colors.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
            value={numTel}
            onChangeText={(text) => handleInputChange(setNumTel, text)}
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>

        <View style={[styles.passwordContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
          <MaterialIcons name="lock" size={20} color={theme.colors.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.passwordInput, { color: theme.colors.text }]}
            placeholder="Mot de passe"
            secureTextEntry={!showPassword}
            value={motDePasse}
            onChangeText={(text) => handleInputChange(setMotDePasse, text)}
            placeholderTextColor={theme.colors.placeholder}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={async () => {
              setShowPassword(!showPassword);
              await playSound('click');
            }}
          >
            <MaterialCommunityIcons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 5, justifyContent: 'center', alignItems: 'center' },
  card: { width: '100%', borderRadius: 10, padding: 20, elevation: 3 },
  titre: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderRadius: 30, paddingHorizontal: 10 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 45 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 45, borderRadius: 30, marginBottom: 15, borderWidth: 1, paddingHorizontal: 10 },
  passwordInput: { flex: 1, fontSize: 16 },
  eyeIcon: { padding: 5 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 30, elevation: 3, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default LoginScreen;
