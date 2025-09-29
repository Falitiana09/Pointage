// Fichier: LoginScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [numTel, setNumTel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

 const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io'; 

  const handleLogin = async () => {
    if (!numTel || !motDePasse) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/api/login-pointage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tel: numTel, motDePasse }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Succès', data.message);
        // NAVIGATION MODIFIÉE : on navigue vers Dashboard et on passe les données de l'employé
        navigation.navigate('Dashboard', { employee: data.employee });
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow, }]}>
        <Text style={[styles.titre, { color: theme.colors.primary }]}>Accès au pointage</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
          <MaterialIcons name="phone" size={20} color={theme.colors.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
            value={numTel}
            onChangeText={setNumTel}
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
            onChangeText={setMotDePasse}
            placeholderTextColor={theme.colors.placeholder}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
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
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
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