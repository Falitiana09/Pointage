import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Image, 
  Modal, 
  Dimensions, 
  ScrollView,
  KeyboardAvoidingView, // NAMPIDIRINA
  Platform // NAMPIDIRINA
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';

// CORRECTION: Mampiasa ny adiresy Clever Cloud efa niasa tsara sy HTTPS
const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io';
const API_URL = `${SERVER_URL}/api`;

const PointageScreen = () => {
  const route = useRoute();
  const employee = route.params?.employee || {};
  const { theme } = useTheme();

  const [code, setCode] = useState('');
  const [infoPointage, setInfoPointage] = useState(null);
  const [codeGenere, setCodeGenere] = useState('');
  const [chargementGeneration, setChargementGeneration] = useState(false);
  const [chargementPointage, setChargementPointage] = useState(false);
  const [estAlerteVisible, setEstAlerteVisible] = useState(false);
  
  const [minuteur, setMinuteur] = useState(0);  
  const minuteurRef = useRef(null);  
  const [tentativesRestantes, setTentativesRestantes] = useState(2);  
  const [messageAlerte, setMessageAlerte] = useState({ titre: '', message: '' });

  // Nouveaux états : pour afficher ou masquer le modal de la photo
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  useEffect(() => { 
    return () => { 
      if (minuteurRef.current) { 
        clearInterval(minuteurRef.current); 
      } 
    }; 
  }, []); 

  useEffect(() => { 
    if (messageAlerte.titre || messageAlerte.message) { 
      setEstAlerteVisible(true); 
    } 
  }, [messageAlerte]); 

  useEffect(() => { 
    if (minuteur <= 0 && minuteurRef.current) { 
      clearInterval(minuteurRef.current); 
      minuteurRef.current = null; 
      if (codeGenere !== '') { 
        const nouvellesTentatives = tentativesRestantes - 1; 
        setTentativesRestantes(nouvellesTentatives); 
        setCodeGenere(''); 
         
        if (nouvellesTentatives >= 0) { 
            setMessageAlerte({ 
                titre: "Code expiré",  
                message: `Le code n'est plus valide. Veuillez en générer un nouveau. Il vous reste ${nouvellesTentatives} tentatives.` 
            }); 
        } else { 
            setMessageAlerte({ 
                titre: "Tentatives dépassées", 
                message: "Vous avez dépassé le nombre de tentatives. Veuillez contacter l'administrateur." 
            }); 
        } 
      } 
    } 
  }, [minuteur, codeGenere, tentativesRestantes]); 

  const gererGenerationCode = async () => { 
    setChargementGeneration(true); 
    setMessageAlerte({ titre: '', message: '' }); 
     
    if (minuteurRef.current) { 
        clearInterval(minuteurRef.current); 
        minuteurRef.current = null; 
    } 
    setMinuteur(15);  
    setCodeGenere(''); 

    try { 
      const response = await fetch(`${API_URL}/generate-code`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
        }, 
        body: JSON.stringify({ employeeId: employee.id }), 
      }); 

      const data = await response.json(); 
      if (response.ok) { 
        setCodeGenere(data.code); 
        setMessageAlerte({ titre: 'Notification', message: 'Code généré. Veuillez le saisir ci-dessous.' }); 

        minuteurRef.current = setInterval(() => { 
            setMinuteur(prevMinuteur => prevMinuteur - 1); 
        }, 1000); 

      } else { 
        setMessageAlerte({ titre: 'Erreur', message: data.message }); 
      } 
    } catch (error) { 
      setMessageAlerte({ titre: 'Erreur', message: 'Impossible de se connecter au serveur.' }); 
      console.error(error); 
    } finally { 
      setChargementGeneration(false); 
    } 
  }; 

  const gererPointage = async () => { 
    if (code === '') { 
      setMessageAlerte({ titre: 'Erreur', message: 'Veuillez saisir le code.' }); 
      return; 
    } 

    if (minuteur <= 0) { 
        const nouvellesTentatives = tentativesRestantes - 1; 
        setTentativesRestantes(nouvellesTentatives); 
        if (nouvellesTentatives >= 0) { 
            setMessageAlerte({ 
                titre: "Code invalide",  
                message: `Le code a expiré. Veuillez en générer un nouveau. Il vous reste ${nouvellesTentatives} tentatives.` 
            }); 
        } else { 
            setMessageAlerte({ 
                titre: "Tentatives dépassées", 
                message: "Vous avez dépassé le nombre de tentatives. Veuillez contacter l'administrateur." 
            }); 
        } 
        return;  
    } 
     
    setChargementPointage(true); 
    setMessageAlerte({ titre: '', message: '' }); 

    try { 
      const response = await fetch(`${API_URL}/verify-code`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
        }, 
        body: JSON.stringify({ employeeId: employee.id, code }), 
      }); 

      const data = await response.json(); 

      if (response.ok) { 
        setInfoPointage({ 
          date: data.date, 
          time: data.time, 
        }); 
        setMessageAlerte({ titre: 'Succès', message: data.message }); 
         
        if (minuteurRef.current) clearInterval(minuteurRef.current); 
        setCodeGenere(''); 
        setCode(''); 
        setMinuteur(0); 
        setTentativesRestantes(2); 
      } else { 
        setInfoPointage(null); 
        const nouvellesTentatives = tentativesRestantes - 1; 
        setTentativesRestantes(nouvellesTentatives); 
         
        if (nouvellesTentatives >= 0) { 
            setMessageAlerte({ titre: 'Erreur', message: `${data.message}. Il vous reste ${nouvellesTentatives} tentatives.` }); 
        } else { 
            setMessageAlerte({ 
                titre: "Tentatives dépassées",  
                message: "Vous avez dépassé le nombre de tentatives. Veuillez contacter l'administrateur." 
            }); 
        } 
      } 
    } catch (error) { 
      setMessageAlerte({ titre: 'Erreur', message: 'Impossible de se connecter au serveur.' }); 
      console.error(error); 
    } finally { 
      setChargementPointage(false); 
    } 
  }; 

  const photoSource = employee?.photo_url 
    ? { uri: `${SERVER_URL}${employee.photo_url}` } 
    : require('../assets/images/user.png'); 

  return ( 
    // FAMPIDIRANA KeyboardAvoidingView (MAMAHANA NY OLANA CLAVIER)
    <KeyboardAvoidingView 
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0} 
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          onPress={() => {
            // Affiche le modal de la photo s'il y a une photo
            if (employee.photo_url) {
              setIsPhotoModalVisible(true);
            }
          }}
        >
          <Image
            // Utilisation de la variable `photoSource` définie plus tôt
            source={photoSource}
            style={[
              styles.employeeImage, 
              // Application du style par défaut s'il n'y a pas de photo
              !employee.photo_url && styles.defaultImageStyle
            ]}
          />
        </TouchableOpacity>
        
        <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>{employee.prenom}</Text> 

        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}> 
          <View style={styles.cardHeader}> 
            <Icon name="access-time" size={30} color={theme.colors.textSecondary} /> 
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Horaires de travail</Text> 
          </View> 
          <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>Matin: 08h00 - 12h00</Text> 
          <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>Après-midi: 14h00 - 18h00</Text> 
        </View> 

        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}> 
          <View style={styles.cardHeader}> 
            <Icon name="qr-code" size={30} color={theme.colors.textSecondary} /> 
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Code de pointage</Text> 
          </View> 
          <TouchableOpacity 
            onPress={gererGenerationCode} 
            style={[styles.button, { backgroundColor: theme.colors.primary }]} 
            disabled={chargementGeneration} 
          > 
            {chargementGeneration ? ( 
              <ActivityIndicator size="small" color="#fff" /> 
            ) : ( 
              <Text style={styles.buttonText}>Générer un code</Text> 
            )} 
          </TouchableOpacity> 
          {codeGenere !== '' && ( 
            <View style={[styles.codeDisplay, { backgroundColor: theme.colors.inputBackground }]}> 
              <Text style={[styles.codeText, { color: theme.colors.text }]}>{codeGenere}</Text> 
              <Text style={[styles.timerText, { color: minuteur <= 7 ? 'red' : theme.colors.textSecondary }]}> 
                Temps restant: {minuteur} secondes 
              </Text> 
              <Text style={[styles.attemptsText, { color: theme.colors.textSecondary }]}> 
                Tentatives restantes: {tentativesRestantes} 
              </Text> 
            </View> 
          )} 
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Le code est valide pendant 15 secondes seulement.</Text> 
        </View> 

        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}> 
          <View style={styles.cardHeader}> 
            <Icon name="check-circle-outline" size={30} color={theme.colors.textSecondary} /> 
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Valider la présence</Text> 
          </View> 
          <TextInput 
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} 
            placeholder="Saisissez le code" 
            placeholderTextColor={theme.colors.placeholder} 
            value={code} 
            onChangeText={setCode} 
            keyboardType="numeric" // Fanampiny: Atao numeric ny keyboard ho an'ny code
          /> 
          <TouchableOpacity 
            onPress={gererPointage} 
            style={[styles.button, { backgroundColor: '#4CAF50' }]} 
            disabled={chargementPointage} 
          > 
            {chargementPointage ? ( 
              <ActivityIndicator size="small" color="#fff" /> 
            ) : ( 
              <Text style={styles.buttonText}>Valider la présence</Text> 
            )} 
          </TouchableOpacity> 
          {infoPointage && ( 
            <View style={[styles.pointageInfo, { borderColor: '#4CAF50' }]}> 
              <Text style={[styles.pointageText, { color: '#4CAF50' }]}>Date: {infoPointage.date}</Text> 
              <Text style={[styles.pointageText, { color: '#4CAF50' }]}>Heure: {infoPointage.time}</Text> 
            </View> 
          )} 
        </View> 

        {/* Modal pour les messages d'alerte */} 
        <Modal 
          animationType="fade" 
          transparent={true} 
          visible={estAlerteVisible} 
          onRequestClose={() => setEstAlerteVisible(false)} 
        > 
          <View style={[styles.modalCenteredView, { backgroundColor: theme.colors.modalBackground }]}> 
            <View style={[styles.modalView, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}> 
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{messageAlerte.titre}</Text> 
              <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>{messageAlerte.message}</Text> 
              <TouchableOpacity 
                onPress={() => { 
                  setEstAlerteVisible(false); 
                  setMessageAlerte({ titre: '', message: '' }); 
                }} 
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]} 
              > 
                <Text style={styles.modalButtonText}>OK</Text> 
              </TouchableOpacity> 
            </View> 
          </View> 
        </Modal> 

        {/* NOUVEAU MODAL POUR L'AFFICHAGE DE LA PHOTO EN PLEIN ÉCRAN */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isPhotoModalVisible}
          onRequestClose={() => setIsPhotoModalVisible(false)}
        >
          <View style={styles.photoModalContainer}>
            <TouchableOpacity 
              style={styles.photoModalCloseButton}
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <Icon name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <Image
              source={photoSource}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>

      </ScrollView> 
    </KeyboardAvoidingView> // FAMARANANA
  ); 
}; 

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({ 
  mainContainer: {
    flex: 1, // Tsy maintsy manana flex: 1 ny KeyboardAvoidingView
  },
  container: { 
    flexGrow: 1, // fanovana
    padding: 20, 
    alignItems: 'center', 
  }, 
  employeeImage: { 
    width: 150, 
    height: 150, 
    borderRadius: 100, 
    marginBottom: 20, 
    borderWidth: 3, 
    borderColor: '#0055ffff', 
  }, 
  defaultImageStyle: { 
    width: 60, 
    height: 60, 
    tintColor: '#999', 
    resizeMode: 'contain', 
  }, 
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5, 
  }, 
  welcomeText: { 
    fontSize: 30, 
    marginBottom: 20, 
    fontWeight: 'bold',
  }, 
  card: { 
    width: '100%', 
    padding: 20, 
    borderRadius: 10, 
    marginBottom: 20, 
    elevation: 3, 
  }, 
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10, 
  }, 
  cardTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginLeft: 10, 
  }, 
  cardText: { 
    fontSize: 14, 
    marginLeft: 34, 
  }, 
  button: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    alignItems: 'center', 
  }, 
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16, 
  }, 
  codeDisplay: { 
    marginTop: 15, 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
  }, 
  codeText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
  }, 
  timerText: { 
    fontSize: 16, 
    marginTop: 5, 
    fontWeight: 'bold', 
  }, 
  attemptsText: { 
    fontSize: 14, 
    marginTop: 5, 
  }, 
  infoText: { 
    fontSize: 12, 
    marginTop: 5, 
    textAlign: 'center', 
  }, 
  input: { 
    height: 45, 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    marginBottom: 15, 
  }, 
  pointageInfo: { 
    marginTop: 15, 
    padding: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
  }, 
  pointageText: { 
    fontSize: 14, 
    textAlign: 'center', 
  }, 
  // Styles pour le modal d'alerte
  modalCenteredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
  }, 
  modalView: { 
    width: '80%', 
    borderRadius: 10, 
    padding: 25, 
    alignItems: 'center', 
    elevation: 5, 
  }, 
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10, 
  }, 
  modalMessage: { 
    textAlign: 'center', 
    marginBottom: 20, 
  }, 
  modalButton: { 
    padding: 10, 
    borderRadius: 5, 
    alignItems: 'center', 
    width: '50%', 
  }, 
  modalButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
  },
  // Nouveaux styles pour le modal de la photo
  photoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullScreenImage: {
    width: width,
    height: height,
  }
}); 

export default PointageScreen;
