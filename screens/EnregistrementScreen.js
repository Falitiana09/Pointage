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
  Platform // AMPIDIRO NY PLATFORM
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';

const EnregistrementScreen = () => {
  const { theme } = useTheme();
  
  // Fandaminana ireo toetran'ny fampiharana (Traduction: Configuration des états de l'application)
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
  
  /**
   * Misafidy sary avy amin'ny galerien'ny finday.
   * (Traduction: Sélectionne une image depuis la galerie du téléphone.)
   */
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "Pour enregistrer une photo, nous avons besoin d'accéder à votre galerie d'images.");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      // Ny Expo ImagePicker dia mamerina `assets` array
      setImage(pickerResult.assets[0].uri); 
    }
  };

  /**
   * Mandefa ny angon-drakitra sy ny sary any amin'ny serveur.
   * (Traduction: Envoie les données et l'image au serveur.)
   */
  const enregistrer = async () => {
    // Fanamarinana ireo saha rehetra
    if (!nom || !prenom || !matricule || !dateDeNaissance || !tel || !mail || !motDePasse || !image) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et sélectionner une photo.');
      return;
    }

    // Fanamarinana ny format daty (AAA-MM-JJ)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateDeNaissance)) {
        Alert.alert('Erreur de Format', 'Veuillez utiliser le format de date AAAA-MM-JJ (ex: 2004-09-27) pour la date de naissance.');
        return;
    }

    setLoading(true);
    
    try {
      // Fanomanana ny FormData ho an'ny fandefasana sary
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

      // Mampiasa ny 'image/jpeg' na 'image/png' raha tsy hita ny fileType
      const mimeType = fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : `image/${fileType}`;

      formData.append('photo', {
          uri: image,
          name: `photo_${matricule}.${fileType}`,
          type: mimeType,
      });

      // Fandefasana ny fangatahana any amin'ny API
      // Tsy tokony ho ao amin'ny headers intsony ny 'Content-Type' rehefa mampiasa FormData
      const response = await fetch(`${SERVER_URL}/api/register`, {
        method: 'POST',
        body: formData,
        // TSY AMPIDIRINA NY 'Content-Type': 'multipart/form-data', (mankasitraka ny FormData)
      });

      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Raha tsy JSON ny valiny, dia ampiasaina ny valiny avy hatrany
        data.message = text;
      }

      if (response.ok) {
        Alert.alert('Notification', 'Enregistrement réussi !');
        // Famerenana ny toetra ho any amin'ny fotony
        setNom('');
        setPrenom('');
        setMatricule('');
        setDateDeNaissance('');
        setTel('');
        setMail('');
        setMotDePasse('');
        setImage(null);
      } else {
        Alert.alert('Erreur', data.message || `Échec de l\'enregistrement. Réponse: ${text}`);
      }

    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se connecter au serveur. Vérifiez votre connexion.');
      console.error("Erreur d'enregistrement:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FANAMBOARANA LEHIBE 1: KeyboardAvoidingView manodidina ny zava-drehetra
    <KeyboardAvoidingView 
      style={styles.mainContainer} // Mampiasa mainContainer misy flex: 1
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0} // Adjustment (44 est souvent mieux que 60 pour le header)
    >
      {/* FANAMBOARANA LEHIBE 2: ScrollView MIALOHA ny olana amin'ny container */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}>
        
        <Text style={[styles.titre, { color: theme.colors.text }]}>Enregistrement d'un employé</Text>

        <View style={[styles.form, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
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

          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Nom"
            placeholderTextColor={theme.colors.placeholder}
            value={nom}
            onChangeText={setNom}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Prénom"
            placeholderTextColor={theme.colors.placeholder}
            value={prenom}
            onChangeText={setPrenom}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Matricule"
            placeholderTextColor={theme.colors.placeholder}
            value={matricule}
            onChangeText={setMatricule}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Date de naissance (AAAA-MM-JJ)" // FANAMARINANA FORMAT
            placeholderTextColor={theme.colors.placeholder}
            value={dateDeNaissance}
            onChangeText={setDateDeNaissance}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Téléphone"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="phone-pad"
            value={tel}
            onChangeText={setTel}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="E-mail"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="email-address"
            value={mail}
            onChangeText={setMail}
          />
          
          <View style={[styles.passwordContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.passwordInput, { color: theme.colors.text }]}
              placeholder="Mot de passe"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={!showPassword}
              value={motDePasse}
              onChangeText={setMotDePasse}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }]} 
            onPress={enregistrer}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1, // Tsy maintsy manana flex: 1 ny KeyboardAvoidingView
  },
  scrollContent: {
    // Ity no contentContainerStyle an'ny ScrollView
    flexGrow: 1, 
    padding: 10,
    alignItems: 'center',
  },
  titre: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  form: {
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 40,
  },
  imagePicker: {
    width: 110,
    height: 110,
    borderRadius: 75,
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderText: {
    marginTop: 5,
    fontSize: 11,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderRadius: 30,
    marginBottom: 15,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 30,
    marginBottom: 6,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EnregistrementScreen;
