import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, ActivityIndicator, Image, Platform, KeyboardAvoidingView 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { Audio } from 'expo-av';

const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io';

const ModificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { employee } = route.params;
  const { theme, soundEnabled } = useTheme(); // 🔹 récupérer le son depuis le context

  const [nom, setNom] = useState(employee.nom);
  const [prenom, setPrenom] = useState(employee.prenom);
  const [matricule, setMatricule] = useState(employee.matricule);
  const [dateDeNaissance, setDateDeNaissance] = useState(employee.date_de_naissance ? employee.date_de_naissance.substring(0, 10) : '');
  const [tel, setTel] = useState(employee.tel);
  const [mail, setMail] = useState(employee.mail);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(employee.photo_url ? `${SERVER_URL}${employee.photo_url}` : null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') console.error('Permission requise: accès galerie refusé.');
      }
    })();
  }, []);

  // 🎵 Jouer son seulement si activé
  const playSound = async (soundFile) => {
    if (!soundEnabled) return; // si désactivé -> rien
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 1500);
    } catch (error) {
      console.warn('Erreur son:', error);
    }
  };

  const playClick = () => playSound(require('../assets/sounds/click.mp3'));
  const playSuccess = () => playSound(require('../assets/sounds/success.mp3'));
  const playError = () => playSound(require('../assets/sounds/error.mp3'));

  // 📷 Choisir photo
  const handleChoosePhoto = async () => {
    await playClick();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0]);
      setCurrentPhotoUrl(result.assets[0].uri);
    }
  };

  // 🔄 Mettre à jour l'employé
  const handleUpdate = async () => {
    await playClick();
    setLoading(true);
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('prenom', prenom);
    formData.append('matricule', matricule);
    formData.append('dateDeNaissance', dateDeNaissance);
    formData.append('tel', tel);
    formData.append('mail', mail);

    if (photo) {
      const uriParts = photo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = photo.fileName || `photo.${fileType}`;
      formData.append('photo', { uri: photo.uri, name: fileName, type: photo.type || `image/${fileType}` });
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/employees/${employee.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        await playSuccess();
        navigation.goBack();
      } else {
        await playError();
        console.log('[Erreur]', data.message || 'Echec de la mise à jour.');
      }
    } catch (error) {
      await playError();
      console.error('[Erreur]', 'Impossible de se connecter au serveur.', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (setter, value) => {
    setter(value);
    await playClick();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0} 
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.titre, { color: theme.colors.primary }]}>Modification de l'employé</Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={currentPhotoUrl ? { uri: currentPhotoUrl } : require('../assets/images/user.png')}
              style={currentPhotoUrl && currentPhotoUrl.startsWith('http') ? styles.profileImage : styles.profileImageDefault}
              resizeMode={currentPhotoUrl && currentPhotoUrl.startsWith('http') ? 'cover' : 'contain'}
            />
            <TouchableOpacity style={styles.photoButton} onPress={handleChoosePhoto}>
              <Icon name="photo-camera" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          {[{val: nom, set: setNom, placeholder: "Nom", icon: "person"},
            {val: prenom, set: setPrenom, placeholder: "Prénom", icon: "person-outline"},
            {val: matricule, set: setMatricule, placeholder: "Matricule", icon: "badge"},
            {val: dateDeNaissance, set: setDateDeNaissance, placeholder: "Date de naissance (AAAA-MM-DD)", icon: "calendar-today", keyboardType: "numbers-and-punctuation"},
            {val: tel, set: setTel, placeholder: "Téléphone", icon: "phone", keyboardType: "phone-pad"},
            {val: mail, set: setMail, placeholder: "E-mail", icon: "email", keyboardType: "email-address"}
          ].map((item, index) => (
            <View key={index} style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
              <Icon name={item.icon} size={20} color={theme.colors.textSecondary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={item.placeholder}
                value={item.val}
                onChangeText={(text) => handleInputChange(item.set, text)}
                placeholderTextColor={theme.colors.placeholder}
                keyboardType={item.keyboardType || "default"}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }]} 
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Mettre à jour</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flexGrow: 1, padding: 10, alignItems: 'center' },
  card: { width: '100%', borderRadius: 10, padding: 20, elevation: 3, marginBottom: 30 },
  titre: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  profileImageContainer: { width: 110, height: 110, borderRadius: 60, alignSelf: 'center', marginBottom: 20, overflow: 'hidden', backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  profileImage: { width: '100%', height: '100%', borderRadius: 60, borderWidth: 1, borderColor: '#00bfffff' },
  profileImageDefault: { width: 80, height: 80, tintColor: '#999' },
  photoButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderRadius: 30, paddingHorizontal: 10, width: '100%' },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 55 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 30, elevation: 3, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ModificationScreen;
