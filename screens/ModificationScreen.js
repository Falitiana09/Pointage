import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  Platform, // NAMPIDIRINA
  KeyboardAvoidingView // NAMPIDIRINA
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';

const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io';

const ModificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { employee } = route.params;
  const { theme } = useTheme();

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
      // Demande la permission d'accéder à la galerie
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          // Nampiasa console.error fa tsy Alert satria Alert dia mety hanakana ny flow.
          console.error('Permission requise: L\'application a besoin d\'un accès à votre galerie.');
        }
      }
    })();
  }, []);
  
  // Fanovana ny Alert ho console.error
  const handleAlert = (titre, message) => {
    // Mampiasa console.log mba tsy hanakana ny UI
    console.log(`[ALERTE - ${titre}] ${message}`);
  };


  const handleChoosePhoto = async () => {
    // Ouvre la galerie
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

  const handleUpdate = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('prenom', prenom);
    formData.append('matricule', matricule);
    formData.append('dateDeNaissance', dateDeNaissance);
    formData.append('tel', tel);
    formData.append('mail', mail);

    if (photo) {
      // Prépare le format de l'image pour FormData
      const uriParts = photo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = photo.fileName || `photo.${fileType}`;

      formData.append('photo', {
        // Tsy maintsy mampiasa 'file://' na 'content://' ny uri anaty FormData fa tsy zavatra hafa.
        uri: photo.uri,
        name: fileName,
        type: photo.type || `image/${fileType}`,
      });
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          // Tsy tokony asiana 'Content-Type': 'multipart/form-data' raha mampiasa FormData, fa ny fetch no mametraka azy io.
          // Tsy nampidirina ny Content-Type ao anatin'ny headers mba hialana amin'ny olana amin'ny RN.
        },
        body: formData,
      });

      const data = await response.json();
      
      // Fanovana Alert ho console.log
      handleAlert('Notification', data.message);

      if (response.ok) {
        navigation.goBack();
      } else {
         // Fanovana Alert ho console.log
        handleAlert('Erreur', data.message || 'Echec de la mise à jour.');
      }
    } catch (error) {
      // Fanovana Alert ho console.log
      handleAlert('Erreur', 'Impossible de se connecter au serveur. Vérifiez votre connexion.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FAMPIDIRANA KeyboardAvoidingView
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
              // Fiverenana amin'ny style profileImageDefault raha toa ka tsy misy sary URL tena izy.
              style={currentPhotoUrl && currentPhotoUrl.startsWith('http') ? styles.profileImage : styles.profileImageDefault}
              resizeMode={currentPhotoUrl && currentPhotoUrl.startsWith('http') ? 'cover' : 'contain'}
            />
            <TouchableOpacity style={styles.photoButton} onPress={handleChoosePhoto}>
              <Icon name="photo-camera" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Nampiana 'autoCapitalize' sy 'autoCorrect' ho an'ny fampiasa tsara kokoa */}
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
            <Icon name="person" size={20} color={theme.colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Nom"
              value={nom}
              onChangeText={setNom}
              placeholderTextColor={theme.colors.placeholder}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
            <Icon name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Prénom"
              value={prenom}
              onChangeText={setPrenom}
              placeholderTextColor={theme.colors.placeholder}
              autoCapitalize="words"
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
            <Icon name="badge" size={20} color={theme.colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Matricule"
              value={matricule}
              onChangeText={setMatricule}
              placeholderTextColor={theme.colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
            <Icon name="calendar-today" size={20} color={theme.colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Date de naissance (AAAA-MM-DD)"
              value={dateDeNaissance}
              onChangeText={setDateDeNaissance}
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
            <Icon name="phone" size={20} color={theme.colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Téléphone"
              keyboardType="phone-pad"
              value={tel}
              onChangeText={setTel}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
            <Icon name="email" size={20} color={theme.colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="E-mail"
              keyboardType="email-address"
              value={mail}
              onChangeText={setMail}
              placeholderTextColor={theme.colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }]} 
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Mettre à jour</Text>
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
  container: {
    flexGrow: 1,
    padding: 10,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    marginBottom: 30,
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImageContainer: {
    width: 110,
    height: 110,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    // Navadika ho 100% ny sary mba hifanaraka amin'ny container.
    width: '100%', 
    height: '100%', 
    borderRadius: 60, 
    borderWidth: 1,
    borderColor: 'blue',
  },
  profileImageDefault: {
    width: 80,
    height: 80,
    tintColor: '#999',
    // Nesorina ireo styles tsy ilaina
    marginBottom: 0,
    marginTop: 0, 
  },
  photoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    width: '100%',
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    height: 55,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 30,
    elevation: 3,
    marginTop: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ModificationScreen;
