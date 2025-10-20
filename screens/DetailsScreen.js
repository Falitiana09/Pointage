import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  Alert, Modal, TextInput, ActivityIndicator, Dimensions 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/fr';
import { useTheme } from '../contexts/ThemeContext';
import { Audio } from 'expo-av';

const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io';

export default function DetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { employee } = route.params;
  const { theme, soundEnabled } = useTheme();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [actionType, setActionType] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [clickSound, setClickSound] = useState(null);
  const [successSound, setSuccessSound] = useState(null);

  const photoSource = employee.photo_url 
    ? { uri: `${SERVER_URL}${employee.photo_url}` } 
    : require('../assets/images/user.png');

  // Charger les sons une seule fois
  useEffect(() => {
    const loadSounds = async () => {
      if (!soundEnabled) return;
      const { sound: click } = await Audio.Sound.createAsync(require('../assets/sounds/click.mp3'));
      const { sound: success } = await Audio.Sound.createAsync(require('../assets/sounds/success.mp3'));
      setClickSound(click);
      setSuccessSound(success);
    };
    loadSounds();
    return () => {
      clickSound?.unloadAsync();
      successSound?.unloadAsync();
    };
  }, []);

  const playClick = async () => { if(soundEnabled && clickSound) await clickSound.replayAsync(); };
  const playSuccess = async () => { if(soundEnabled && successSound) await successSound.replayAsync(); };

  // Validation mot de passe pour modifier/supprimer
  const validatePassword = async () => {
    await playClick();
    if (!passwordInput) {
      Alert.alert('Erreur', 'Veuillez entrer le mot de passe.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/validate-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule: employee.matricule, motDePasse: passwordInput })
      });
      const data = await response.json();
      if (response.ok) {
        if (actionType === 'delete') deleteEmployee();
        else if (actionType === 'modify') navigation.navigate('Modification', { employee });
      } else {
        Alert.alert('Erreur', data.message || 'Mot de passe incorrect.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de valider le mot de passe.');
      console.error(error);
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setPasswordInput('');
      setActionType(null);
    }
  };

  const deleteEmployee = async () => {
    await playClick();
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cet employé ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            await playClick();
            try {
              const response = await fetch(`${SERVER_URL}/api/employees/${employee.id}`, { method: 'DELETE' });
              const data = await response.json();
              if (response.ok) {
                await playSuccess();
                Alert.alert('Succès', data.message);
                navigation.goBack();
              } else {
                Alert.alert('Erreur', data.message || 'Impossible de supprimer l\'employé.');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const formattedDate = moment(employee.date_de_naissance).locale('fr').format('DD MMMM YYYY');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Carte Profil */}
      <View style={[styles.profileCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
        <TouchableOpacity onPress={async () => { await playClick(); if (employee.photo_url) setIsPhotoModalVisible(true); }}>
          <Image source={photoSource} style={[styles.profileImage, !employee.photo_url && styles.defaultImageStyle]} />
        </TouchableOpacity>
        <Text style={[styles.nameText, { color: theme.colors.text }]}>{employee.nom} {employee.prenom}</Text>

        {/* Informations */}
        <View style={styles.infoContainer}>
          {[
            { icon: 'badge', label: 'Matricule', value: employee.matricule },
            { icon: 'phone', label: 'Téléphone', value: employee.tel },
            { icon: 'email', label: 'E-mail', value: employee.mail },
            { icon: 'calendar-today', label: 'Date de naissance', value: formattedDate }
          ].map((info, index) => (
            <View key={index} style={styles.infoRow}>
              <Icon name={info.icon} size={20} color={theme.colors.textSecondary} style={styles.infoIcon} />
              <Text style={[styles.infoLabel, { color: theme.colors.text }]}>{info.label}:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{info.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Boutons Modifier / Supprimer */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.modifyButton]} onPress={async () => { await playClick(); setActionType('modify'); setIsModalVisible(true); }}>
          <Icon name="edit" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={async () => { await playClick(); setActionType('delete'); setIsModalVisible(true); }}>
          <Icon name="delete" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>

      {/* Modal mot de passe */}
      <Modal animationType="fade" transparent visible={isModalVisible} onRequestClose={async () => { await playClick(); setIsModalVisible(false); }}>
        <View style={[styles.centeredView, { backgroundColor: theme.colors.modalBackground }]}>
          <View style={[styles.modalView, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Confirmer l'action</Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>Veuillez saisir le mot de passe de l'employé.</Text>
            <View style={[styles.passwordContainer, { borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.colors.text, backgroundColor: theme.colors.inputBackground }]}
                placeholder="Mot de passe"
                placeholderTextColor={theme.colors.placeholder}
                secureTextEntry={!showPassword}
                value={passwordInput}
                onChangeText={setPasswordInput}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={async () => { await playClick(); setShowPassword(!showPassword); }}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.colors.cancelButton }]} onPress={async () => { await playClick(); setIsModalVisible(false); }}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.colors.confirmButton }]} onPress={validatePassword} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Confirmer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal photo plein écran */}
      <Modal visible={isPhotoModalVisible} transparent onRequestClose={async () => { await playClick(); setIsPhotoModalVisible(false); }}>
        <View style={styles.fullScreenPhotoContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={async () => { await playClick(); setIsPhotoModalVisible(false); }}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={photoSource} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 10 },
  profileCard: { width: '100%', borderRadius: 10, padding: 10, marginTop: 20, alignItems: 'center', elevation: 3, marginBottom: 80 },
  profileImage: { resizeMode: 'cover', width: 110, height: 110, borderRadius: 100, marginBottom: 30, marginTop: 50, borderWidth: 1, borderColor: '#00bfffff' },
  defaultImageStyle: { width: 80, height: 80, tintColor: '#999', resizeMode: 'contain' },
  nameText: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  infoContainer: { width: '100%', paddingHorizontal: 5, marginTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoIcon: { marginRight: 15, width: 25, textAlign: 'center' },
  infoLabel: { fontSize: 16, fontWeight: 'bold', marginRight: 5 },
  infoValue: { fontSize: 16, flexShrink: 1 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 15, borderRadius: 10, elevation: 3 },
  modifyButton: { backgroundColor: '#bbbbbbff' },
  deleteButton: { backgroundColor: '#bbbbbbff' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalView: { width: '95%', borderRadius: 10, padding: 25, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { textAlign: 'center', marginBottom: 20 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 45, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20 },
  passwordInput: { flex: 1, fontSize: 16 },
  eyeIcon: { padding: 0 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, padding: 23, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  fullScreenPhotoContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width, height },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
});
