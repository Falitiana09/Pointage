import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import EnregistrementScreen from './screens/EnregistrementScreen';
import ListesScreen from './screens/ListesScreen';
import DetailsScreen from './screens/DetailsScreen';
import ModificationScreen from './screens/ModificationScreen'; 
import PointageScreen from './screens/PointageScreen';
import DashboardScreen from './screens/DashboardScreen';
import AproposScreen from './screens/AproposScreen'; 
import ParametresScreen from './screens/ParametresScreen';
import HistogrammeScreen from './screens/HistogrammeScreen';
import HistoriqueScreen from './screens/HistoriqueScreen';
import { ThemeProvider } from './contexts/ThemeContext'; // <-- Nampiana ity

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Accueil">
          <Stack.Screen
            name="Accueil"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Enregistrement"
            component={EnregistrementScreen}
            options={{ title: 'Inscription' }}
          />
          <Stack.Screen
            name="Listes des employés"
            component={ListesScreen}
            options={{ title: 'Toutes les employes' }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{ title: 'Profile d\'employe' }}
          />
          <Stack.Screen
            name="Modification"
            component={ModificationScreen}
            options={{ title: 'Mettre à jour' }}
          />
          <Stack.Screen
            name="Pointage"
            component={PointageScreen}
            options={{ title: 'connexion' }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'Mon compte' }}
          />
          <Stack.Screen
            name="Historique"
            component={HistoriqueScreen}
            options={{ title: 'Historique et status' }}
          />
          <Stack.Screen
            name="Histogramme"
            component={HistogrammeScreen}
            options={{ title: 'Statistique par semaine' }}
          />
          <Stack.Screen
            name="Apropos" 
            component={AproposScreen}
            options={{ title: 'Aide' }}
          />
          <Stack.Screen
            name="Parametres" 
            component={ParametresScreen}
            options={{ title: 'Paramètres' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}