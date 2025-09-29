import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,FlatList,ActivityIndicator,SafeAreaView,TouchableOpacity,RefreshControl,Alert,Modal,Image, Platform, Pressable}
from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/fr';
import { useTheme } from '../contexts/ThemeContext';

moment.locale('fr');

const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io';
const API_URL = `${SERVER_URL}/api/`;

const HistoriqueItem = ({ item, onPress }) => {
  const { theme } = useTheme(); 
  const handlePress = () => {
    if (item.is_present !== undefined) {
      onPress(item);
    }
  };

  const formattedDate = item.date ? moment(item.date).format('DD MMMM YYYY') : '';
  const formattedTime = item.heure ? moment(item.heure, 'HH:mm:ss').format('HH:mm') : '';

  // Nesorina ny fanoloana API_URL satria ny URL base SERVER_URL ihany no ilaina ho an'ny sary
  const photoUrl = item.photo_url ? `${SERVER_URL}${item.photo_url}` : 'https://placehold.co/70x70/E5E7EB/4B5563?text=N/A';

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.itemContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
      <View style={styles.itemHeader}>
        <Image source={{ uri: photoUrl }} style={styles.profileImage} />
        <View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{`${item.nom} ${item.prenom}`}</Text>
          {item.is_present !== undefined && (
            <Text style={[styles.clickText, { color: theme.colors.textSecondary }]}>
              {item.is_present ? 'Cliquez ici' : 'Absent. '}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.details}>
        {item.date && item.heure ? (
          <>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{`Date: ${formattedDate}`}</Text>
            <Text style={[styles.time, { color: theme.colors.textSecondary }]}>{`Heure: ${formattedTime}`}</Text>
          </>
        ) : item.is_present !== undefined ? (
          <Text style={[styles.statusText, item.is_present ? styles.statusPresent : styles.statusAbsent]}>
            {item.is_present ? 'Présent' : 'Absent'}
          </Text>
        ) : (
          <Text style={[styles.statusText, { color: 'gray' }]}>Aucun pointage</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function HistoriqueScreen() {
  const { theme } = useTheme();

  const [activeList, setActiveList] = useState('today-presence');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData(activeList);
  }, [activeList]);
  
  // Nampiasa console.log fa tsy Alert
  const handleAlert = (titre, message) => {
    console.log(`[ALERTE - ${titre}] ${message}`);
  };

  const fetchData = async (listType) => {
    setLoading(true);
    setRefreshing(true);
    setError('');
    let endpoint = '';
    
    switch (listType) {
      case 'today-presence':
        endpoint = 'today-presence';
        break;
      case 'today-absence':
        endpoint = 'today-absence';
        break;
      case 'full-presence':
        endpoint = 'historique';
        break;
      case 'weekly-status':
        endpoint = 'status-per-person';
        break;
      default:
        setLoading(false);
        setRefreshing(false);
        return;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error('Erreur réseau lors de la récupération des données.');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError('Erreur de serveur.');
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleButtonPress = (listType) => {
    setActiveList(listType);
  };

  const fetchEmployeeHistory = async (employee) => {
    // Tsy miantso historique afa-tsy ho an'ireo lisitra mampiseho olona rehetra
    if (activeList !== 'full-presence' && activeList !== 'weekly-status') {
      if (!employee.is_present) return; // Raha "Absents" dia tsy mila manindry raha tsy présent
    }
    
    // Alefaso fotsiny ny fangatahana raha toa ka 'weekly-status' na 'full-presence'
    // Na koa raha manindry item avy amin'ny 'today-presence' izy ka te hijery ny antsipiriany
    if (activeList === 'weekly-status' || activeList === 'full-presence' || (activeList === 'today-presence' && employee.is_present)) {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}historique/employee/${employee.id}`);
        if (!response.ok) {
          throw new Error('Erreur réseau.');
        }
        const history = await response.json();
        setSelectedEmployee(employee);
        setSelectedEmployeeData(history);
        setModalVisible(true);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        handleAlert('Erreur', 'Aucun statut pour cet employé.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getTitle = () => {
    switch (activeList) {
      case 'today-presence':
        return 'Listes des Présents Aujourd\'hui';
      case 'today-absence':
        return 'Listes des Absents Aujourd\'hui';
      case 'full-presence':
        return 'Historique Complet de Présence';
      case 'weekly-status':
        return 'Statut par Personne';
      default:
        return 'Historique de présence';
    }
  };

  const renderModalItem = ({ item }) => {
    const formattedDate = item.date ? moment(item.date).format('DD MMMM YYYY') : '';
    const formattedTime = item.heure ? moment(item.heure, 'HH:mm:ss').format('HH:mm') : '';
    return (
      <View style={[styles.modalItem, { backgroundColor: theme.colors.inputBackground }]}>
        <Text style={[styles.modalText, { color: theme.colors.text }]}>{`Date: ${formattedDate}`}</Text>
        <Text style={[styles.modalText, { color: theme.colors.text }]}>{`Heure : ${formattedTime}`}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.buttonGrid}>
        <View style={styles.row}>
          {/* Fanovana ho Pressable ho an'ny effet tsindry (hover/active) */}
          <Pressable
            onPress={() => handleButtonPress('today-presence')}
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: '#4CAF50' }, 
              // Ampiana styles.activeButton rehefa ity no voafidy (focus)
              activeList === 'today-presence' && styles.activeButton,
              pressed && styles.buttonPressed
            ]}>
            <Icon name="checkmark-circle-outline" size={30} color="#fff" />
            <Text style={styles.buttonText}>Présents</Text>
          </Pressable>
          
          <Pressable
            onPress={() => handleButtonPress('today-absence')}
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: '#FF5733' }, 
              // Ampiana styles.activeButton rehefa ity no voafidy (focus)
              activeList === 'today-absence' && styles.activeButton,
              pressed && styles.buttonPressed
            ]}>
            <Icon name="close-circle-outline" size={30} color="#fff" />
            <Text style={styles.buttonText}>Absents</Text>
          </Pressable>
          
          <Pressable
            onPress={() => handleButtonPress('full-presence')}
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: '#3498DB' }, 
              // Ampiana styles.activeButton rehefa ity no voafidy (focus)
              activeList === 'full-presence' && styles.activeButton,
              pressed && styles.buttonPressed
            ]}>
            <Icon name="calendar-outline" size={30} color="#fff" />
            <Text style={styles.buttonText}>Historique</Text>
          </Pressable>
          
          <Pressable
            onPress={() => handleButtonPress('weekly-status')}
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: '#9B59B6' }, 
              // Ampiana styles.activeButton rehefa ity no voafidy (focus)
              activeList === 'weekly-status' && styles.activeButton,
              pressed && styles.buttonPressed
            ]}>
            <Icon name="person-circle-outline" size={30} color="#fff" />
            <Text style={styles.buttonText}>Statut</Text>
          </Pressable>
        </View>
      </View>
      
      <Text style={[styles.listTitleText, { color: theme.colors.text }]}>{getTitle()}</Text>
      
      {loading && data.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={({ item }) => (
            <HistoriqueItem 
              item={item} 
              onPress={fetchEmployeeHistory} 
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(activeList)} />
          }
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                {activeList === 'today-absence' ? 'Bravo, tous les employés sont présents.' : 'Aucune donnée trouvée pour le moment.'}
              </Text>
            </View>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.modalBackground }]}>
          <View style={[styles.modalView, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            
            {/* FANAVANANA: Famindrana ilay bokotra X amin'ny zorony ambony havanana */}
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="red" />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Historique de {selectedEmployee?.nom} {selectedEmployee?.prenom}
            </Text>
            
            <FlatList
              data={selectedEmployeeData}
              keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
              renderItem={renderModalItem}
              contentContainerStyle={styles.modalListContent} // Nampiana style mba hanome padding
              ListEmptyComponent={() => (
                <Text style={[styles.noDataText, { color: theme.colors.textSecondary, textAlign: 'center' }]}>Aucun historique de pointage.</Text>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  buttonGrid: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginVertical: 0,
    elevation: 3,
    // Nanampy border transparent ho an'ny bokotra rehetra mba tsy hisy CLS rehefa active ny iray
    borderWidth: 2, 
    borderColor: 'transparent',
  },
  // Style ho an'ny bokotra voafidy (izay mitovy amin'ny focus)
  activeButton: {
    borderColor: 'white',
    borderWidth: 2,
  },
  // Mbola ampiasaina ho an'ny effet tsindry (pressed/active)
  buttonPressed: {
    opacity: 0.5, // Manamaizina kely rehefa tsindriana
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10, // Kely kokoa ny font
    marginTop: 5,
    textAlign: 'center',
  },
  listTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  itemContainer: {
    padding: 5,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor:'blue',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  clickText: {
    fontSize: 12,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 70,
    marginTop: -20, 
  },
  date: {
    fontSize: 14,
  },
  time: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusPresent: {
    color: 'green',
  },
  statusAbsent: {
    color: 'red',
  },
  noDataText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 15, // Natao boribory kokoa
    paddingTop: 40, // Namela toerana ho an'ny bokotra X
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalListContent: {
    paddingTop: 5, // Fanamorana ny fahitana ny lohateny
  },
  modalItem: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
  },
  // STYLE VAOVAO HO AN'NY BOKOTRA FANAKATONANA
  modalCloseButton: {
    position: 'absolute',
    top: 10, 
    right: 10, 
    width: 40,
    height: 40,
    borderRadius: 20, // Natao boribory (antsasaky ny width/height)
    backgroundColor: 'transparent', // Fiaviana fotsy kely
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Mba hivoaka eo ambony
    borderWidth: 2,
    borderColor: 'red',
    elevation: 5,
  },
});
