// EnregistrementScreen.js
import React, { useState } from 'react';
import { 
  KeyboardAvoidingView, 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Alert, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';

const EnregistrementScreen = () => {
  const { theme, soundEnabled } = useTheme(); // 🔊 Récupère le son activé

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [dateDeNaissance, setDateDeNaissance] = useState('');
  const [tel, setTel] = useState('');
  const [mail, setMail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io';

  // --- Fonction générique pour jouer un son seulement si activé ---
  const playSound = async (soundFile) => {
    if (!soundEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.warn('Erreur audio :', error);
    }
  };

  const playClick = () => playSound(require('../assets/sounds/click.mp3'));
  const playSuccess = () => playSound(require('../assets/sounds/success.mp3'));
  const playError = () => playSound(require('../assets/sounds/error.mp3'));

  /**
   * Choisir une image
   */
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "Pour enregistrer une photo, nous avons besoin d'accéder à votre galerie.");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setImage(pickerResult.assets[0].uri);
      await playClick(); // 🔊 Son quand on sélectionne une image
    }
  };

  /**
   * Envoi des données
   */
  const enregistrer = async () => {
    if (!nom || !prenom || !matricule || !dateDeNaissance || !tel || !mail || !motDePasse || !image) {
      await playError();
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et sélectionner une photo.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateDeNaissance)) {
      await playError();
      Alert.alert('Erreur de Format', 'Utilisez le format AAAA-MM-JJ (ex: 2004-09-27).');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nom', nom);
      formData.append('prenom', prenom);
      formData.append('matricule', matricule);
      formData.append('dateDeNaissance', dateDeNaissance);
      formData.append('tel', tel);
      formData.append('mail', mail);
      formData.append('motDePasse', motDePasse);

      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const mimeType = fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : `image/${fileType}`;

      formData.append('photo', {
        uri: image,
        name: `photo_${matricule}.${fileType}`,
        type: mimeType,
      });

      const response = await fetch(`${SERVER_URL}/api/register`, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch { data.message = text; }

      if (response.ok) {
        await playSuccess();
        Alert.alert('Notification', 'Enregistrement réussi !');
        setNom(''); setPrenom(''); setMatricule('');
        setDateDeNaissance(''); setTel(''); setMail('');
        setMotDePasse(''); setImage(null);
      } else {
        await playError();
        Alert.alert('Erreur', data.message || `Échec : ${text}`);
      }

    } catch (error) {
      await playError();
      Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
      console.error("Erreur d'enregistrement:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.titre, { color: theme.colors.text }]}>Enregistrement d'un employé</Text>

        <View style={[styles.form, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={[styles.imagePlaceholder, { borderColor: theme.colors.border }]}>
                <Icon name="camera-plus" size={50} color={theme.colors.textSecondary} />
                <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>Ajouter une photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Champs avec son click */}
          <TextInput style={styles.input} placeholder="Nom" value={nom} onFocus={playClick} onChangeText={setNom} />
          <TextInput style={styles.input} placeholder="Prénom" value={prenom} onFocus={playClick} onChangeText={setPrenom} />
          <TextInput style={styles.input} placeholder="Matricule" value={matricule} onFocus={playClick} onChangeText={setMatricule} />
          <TextInput style={styles.input} placeholder="Date de naissance (AAAA-MM-JJ)" value={dateDeNaissance} onFocus={playClick} onChangeText={setDateDeNaissance} />
          <TextInput style={styles.input} placeholder="Téléphone" value={tel} keyboardType="phone-pad" onFocus={playClick} onChangeText={setTel} />
          <TextInput style={styles.input} placeholder="E-mail" value={mail} keyboardType="email-address" onFocus={playClick} onChangeText={setMail} />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mot de passe"
              secureTextEntry={!showPassword}
              value={motDePasse}
              onFocus={playClick}
              onChangeText={setMotDePasse}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#555"style={styles.eye} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={enregistrer} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 10, alignItems: 'center' },
  titre: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  form: { width: '100%', alignItems: 'center', padding: 10, borderRadius: 10 },
  imagePicker: { width: 110, height: 110, borderRadius: 75, marginBottom: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder: { width: '100%', height: '100%', borderRadius: 75, borderWidth: 3, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderText: { marginTop: 5, fontSize: 10 },
  input: { width: '100%', height: 45, borderRadius: 30, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ccc' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 45, borderRadius: 30, borderWidth: 1, borderColor: '#ccc', marginBottom: 15 },
  passwordInput: { flex: 1, paddingHorizontal: 15, paddingRight: 5, },
  button: { width: '100%', padding: 12, borderRadius: 30, alignItems: 'center', marginTop: 10, backgroundColor: '#2196F3' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  eye: {paddingRight: 10}
});

export default EnregistrementScreen;
