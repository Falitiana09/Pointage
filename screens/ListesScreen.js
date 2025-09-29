import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const SERVER_URL = 'https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io';

const ListesScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { theme } = useTheme();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [originalEmployees, setOriginalEmployees] = useState([]);
    const [searchText, setSearchText] = useState('');

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            // L'endpoint `/api/employees` renvoie maintenant `photo_url`
            const response = await fetch(`${SERVER_URL}/api/employees`);
            if (!response.ok) {
                throw new Error('Erreur de serveur pour ajouter la liste.');
            }
            const data = await response.json();
            setEmployees(data);
            setOriginalEmployees(data);
        } catch (error) {
            Alert.alert('Erreur de connexion.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchEmployees();
        }
    }, [isFocused]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text === '') {
            setEmployees(originalEmployees);
        } else {
            const filteredEmployees = originalEmployees.filter(emp =>
                (emp.nom && emp.nom.toLowerCase().includes(text.toLowerCase())) ||
                (emp.prenom && emp.prenom.toLowerCase().includes(text.toLowerCase())) ||
                (emp.matricule && emp.matricule.toLowerCase().includes(text.toLowerCase()))
            );
            setEmployees(filteredEmployees);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}
            onPress={() => navigation.navigate('Details', { employee: item })}
        >
            <View style={[styles.profileImageContainer, { backgroundColor: theme.colors.card }]}>
                {/* Changement majeur ici : Vérifier la présence d'une photo personnalisée */}
                {item.photo_url ? (
                    <Image source={{ uri: `${SERVER_URL}${item.photo_url}` }} style={styles.profileImage} />
                ) : (
                    <Image source={require('../assets/images/user.png')} style={styles.profileImageDefault} />
                )}
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.nameText, { color: theme.colors.text }]}>{item.nom} {item.prenom}</Text>
                <Text style={[styles.matriculeText, { color: theme.colors.textSecondary }]}>Matricule: {item.matricule}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <View style={[styles.searchBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text }]}
                    placeholder="Rechercher..."
                    placeholderTextColor={theme.colors.placeholder}
                    value={searchText}
                    onChangeText={handleSearch}
                />
            </View>
            <Text style={[styles.listTitle, { color: theme.colors.text }]}>Listes des employés</Text>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Chargement de la liste des employés...</Text>
                </View>
            ) : (
                <FlatList
                    data={employees}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={() => (
                        <Text style={[styles.emptyListText, { color: theme.colors.textSecondary }]}>Aucun employé trouvé.</Text>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 30,
        paddingHorizontal: 15,
        marginBottom: 20,
        elevation: 3,

    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
    },
    profileImageContainer: {
        width: 70,
        height: 70,
        borderWidth: 0.5,
        borderColor: 'blue',
        borderRadius: 100, // Pour que l'image soit bien ronde
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginLeft: 2,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        
    },
    profileImageDefault: {
        width: 45,
        height: 45,
        tintColor: '#999', // Remarque supplémentaire pour changer la couleur de l'image par défaut
    },
    textContainer: {
        flex: 1,
    },
    nameText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    matriculeText: {
        fontSize: 12,
        fontWeight: 0,
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});

export default ListesScreen;