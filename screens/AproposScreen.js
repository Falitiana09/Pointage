import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/images/logony.png';

const AideScreen = () => {
  const [showFullText, setShowFullText] = useState({
    registration: false,
    list: false,
    pointage: false,
    historique: false,
    statistiques: false,
    remarque: false,
  });

  const { theme } = useTheme();

  const handleShowMore = (section) => {
    setShowFullText((prevState) => ({
      ...prevState,
      [section]: true,
    }));
  };

  const handleShowLess = (section) => {
    setShowFullText((prevState) => ({
      ...prevState,
      [section]: false,
    }));
  };

  const openFacebookProfile = () => {
    const facebookURL = 'https://www.facebook.com/share/1D3gQZeEYn/?mibextid=wwXIfr';

    Linking.canOpenURL(facebookURL)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(facebookURL);
        } else {
          console.log(`Don't know how to open URI: ${facebookURL}`);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };
  

  const registrationText = `La page Enregistrement est destinée aux nouveaux employés ou à ceux qui n'ont pas encore finalisé leur inscription, et pour s'inscrire, il suffit de renseigner le nom (entièrement en majuscules), le prénom (commençant par une majuscule), le matricule exact, la date de naissance au format année/mois/jour, le numéro de téléphone, une adresse email valide, le mot de passe (à ne pas oublier), et d'ajouter une photo appropriée.`;
  const shortRegistrationText = registrationText.substring(0, 100) + '...';

  const listText = `La page de liste est la liste de ceux qui ont déjà effectué leur inscription. Attention à ton mot de passe, car si quelqu’un d’autre le connaît, il aura l’autorisation de modifier tes informations et pourra faire n'importe quoi avec ton compte. Ainsi, toi seul as le droit de modifier tes informations et de supprimer ton compte. Il est important de savoir que toutes tes informations peuvent être modifiées sauf le mot de passe. Pour changer ton mot de passe ou si tu l’as oublié, tu dois contacter la personne qui a créé cette application.`;
  const shortListText = listText.substring(0, 100) + '...';

  const pointageText = `La page de pointages est destinée uniquement à l’enregistrement de la présence : le matin, à midi et aussi le soir. On saisit le numéro de téléphone et le mot de passe pour se connecter, puis on demande le code de validation et le code de pointage via le bouton Générer un code.Tu reçois alors le code et une notification apparaît — il faut appuyer sur “OK”, copier le code depuis la notification, puis le coller immédiatement dans le champ Valide la présence et cliquer sur le bouton vert Valider la présence.Attention : tu n’as que 15 secondes pour copier ce code, il faut donc le faire très rapidement et sans erreur. Si le code est incorrect ou que la copie échoue, tu disposes encore de 3 tentatives. Pour éviter que quelqu’un d’autre abuse en demandant ton code, protège et garde précieusement ton mot de passe. `;
  const shortPointageText = pointageText.substring(0, 100) + '...';

  const historiqueText = `L’Historique permet de consulter, selon les catégories, l’assiduité de chacun.En cliquant sur le bouton Présences (vert), on peut voir les personnes qui sont venues travailler aujourd’hui.En cliquant sur le bouton Absents (rouge), on peut voir celles qui ne sont pas venues ou qui se sont absentées.Pour consulter tous les historiques, il faut utiliser le bouton Historique complet (bleu).Enfin, dans la section Statut (bouton violet), on trouve le statut de chaque personne : cela permet de savoir si elle est présente ou absente.Si quelqu’un est absent, un texte en rouge indiquant Absent s’affiche à côté de son nom dans la liste. Si la personne est présente, ce texte rouge devient vert et affiche Présent.On peut également cliquer sur le nom de chaque personne pour voir les dates et les heures exactes de ses arrivées et de ses sorties.`;
  const shortHistoriqueText = historiqueText.substring(0, 100) + '...';
  
  const statistiquesText = `La page Statistiques affiche la présence sous forme de graphique. L'axe vertical (Y) représente le nombre d'employés et l'axe horizontal (X) correspond aux jours de la semaine. Cela permet d'avoir une représentation visuelle de l'assiduité des employés chaque semaine et de pouvoir consulter les semaines passées à l'aide des boutons Précédent et Suivant.`;
  const shortStatistiquesText = statistiquesText.substring(0, 100) + '...';
  
  const remarqueText = `Fais bien attention et protège soigneusement ton mot de passe, et lis attentivement ces instructions.
Souviens-toi qu’il n’est pas encore possible de modifier le mot de passe. En cas de fraude ou d’oubli, tu peux contacter les développeurs mentionnés ci-dessous.`;
  const shortRemarqueText = remarqueText.substring(0, 100) + '...';


  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Centre d'aide</Text>
      </View>

      {/* Bienvenue Section */}
      <View style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Bienvenue dans le centre d'aide de l'application NY HAVANA. Ce guide vous expliquera comment utiliser l'application pour gérer vos pointages de manière simple et rapide.
        </Text>
      </View>

      {/* Enregistrement Section */}
      <View style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.paragraph, styles.sectionTitle, { color: theme.colors.primary }]}>
          Enregistrement
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={[styles.paragraph, { color: theme.colors.text, marginBottom: 0 }]}>
            {showFullText.registration ? registrationText : shortRegistrationText}
          </Text>
          <TouchableOpacity onPress={() => showFullText.registration ? handleShowLess('registration') : handleShowMore('registration')}>
            <Text style={[styles.link, { color: '#a7a7a7ff' }]}>
              {showFullText.registration ? 'Masqué' : 'Afficher la suite'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Listes Section */}
      <View style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.paragraph, styles.sectionTitle, { color: theme.colors.primary }]}>
          Listes
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={[styles.paragraph, { color: theme.colors.text, marginBottom: 0 }]}>
            {showFullText.list ? listText : shortListText}
          </Text>
          <TouchableOpacity onPress={() => showFullText.list ? handleShowLess('list') : handleShowMore('list')}>
            <Text style={[styles.link, { color: '#a7a7a7ff' }]}>
              {showFullText.list ? 'Masqué' : 'Afficher la suite'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pointage Section */}
      <View style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.paragraph, styles.sectionTitle, { color: theme.colors.primary }]}>
          Pointages
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={[styles.paragraph, { color: theme.colors.text, marginBottom: 0 }]}>
            {showFullText.pointage ? pointageText : shortPointageText}
          </Text>
          <TouchableOpacity onPress={() => showFullText.pointage ? handleShowLess('pointage') : handleShowMore('pointage')}>
            <Text style={[styles.link, { color: '#a7a7a7ff' }]}>
              {showFullText.pointage ? 'Masqué' : 'Afficher la suite'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Historique Section */}
      <View style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.paragraph, styles.sectionTitle, { color: theme.colors.primary }]}>
          Historique
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={[styles.paragraph, { color: theme.colors.text, marginBottom: 0 }]}>
            {showFullText.historique ? historiqueText : shortHistoriqueText}
          </Text>
          <TouchableOpacity onPress={() => showFullText.historique ? handleShowLess('historique') : handleShowMore('historique')}>
            <Text style={[styles.link, { color: '#a7a7a7ff' }]}>
              {showFullText.historique ? 'Masqué' : 'Afficher la suite'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistiques Section */}
      <View style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.paragraph, styles.sectionTitle, { color: theme.colors.primary }]}>
          Statistiques
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={[styles.paragraph, { color: theme.colors.text, marginBottom: 0 }]}>
            {showFullText.statistiques ? statistiquesText : shortStatistiquesText}
          </Text>
          <TouchableOpacity onPress={() => showFullText.statistiques ? handleShowLess('statistiques') : handleShowMore('statistiques')}>
            <Text style={[styles.link, { color: '#a7a7a7ff' }]}>
              {showFullText.statistiques ? 'Masqué' : 'Afficher la suite'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Remarque Section */}
      <View style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.paragraph, styles.sectionTitle, { color: theme.colors.primary }]}>
          Remarque
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={[styles.paragraph, { color: theme.colors.text, marginBottom: 0 }]}>
            {showFullText.remarque ? remarqueText : shortRemarqueText}
          </Text>
          <TouchableOpacity onPress={() => showFullText.remarque ? handleShowLess('remarque') : handleShowMore('remarque')}>
            <Text style={[styles.link, { color: '#a7a7a7ff', fontWeight:'bold', }]}>
              {showFullText.remarque ? 'Masqué' : 'Afficher la suite'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Footer Section */}
      <TouchableOpacity onPress={openFacebookProfile} style={[styles.footerContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.footerText, { color: theme.colors.primary }]}>
          Contactez le développeur : Falitiana R'ems
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 0,
  },
  footerContainer: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AideScreen;
