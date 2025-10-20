import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Linking, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Audio } from 'expo-av';
import logo from '../assets/images/icon.png';

const AideScreen = () => {
  const [showFullText, setShowFullText] = useState({
    registration: false,
    list: false,
    pointage: false,
    historique: false,
    statistiques: false,
    remarque: false,
  });
  const [isLogoModalVisible, setIsLogoModalVisible] = useState(false);

  const { theme, soundEnabled } = useTheme(); // ajout soundEnabled pour gérer son global

  // -------------------- SON CLICK --------------------
  const playClickSound = async () => {
    if (!soundEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/click.mp3'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (err) {
      console.log('Erreur son click:', err);
    }
  };
  // ---------------------------------------------------

  const toggleShowText = (section) => {
    setShowFullText((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  const openFacebookProfile = () => {
    const facebookURL = 'https://www.facebook.com/share/1D3gQZeEYn/?mibextid=wwXIfr';
    Linking.canOpenURL(facebookURL)
      .then((supported) => {
        if (supported) {
          Linking.openURL(facebookURL);
        } else {
          console.log(`Impossible d'ouvrir l'URL: ${facebookURL}`);
        }
      })
      .catch((err) => console.error('Erreur ouverture URL:', err));
  };

  // -------------------- TEXTES --------------------
  const registrationText = `La page Enregistrement est destinée aux nouveaux employés ou à ceux qui n'ont pas encore finalisé leur inscription, et pour s'inscrire, il suffit de renseigner le nom (entièrement en majuscules), le prénom (commençant par une majuscule), le matricule exact, la date de naissance au format année/mois/jour, le numéro de téléphone, une adresse email valide, le mot de passe (à ne pas oublier), et d'ajouter une photo appropriée.`;
  const listText = `La page de liste est la liste de ceux qui ont déjà effectué leur inscription. Attention à ton mot de passe, car si quelqu’un d’autre le connaît, il aura l’autorisation de modifier tes informations et pourra faire n'importe quoi avec ton compte. Ainsi, toi seul as le droit de modifier tes informations et de supprimer ton compte. Il est important de savoir que toutes tes informations peuvent être modifiées sauf le mot de passe. Pour changer ton mot de passe ou si tu l’as oublié, tu dois contacter la personne qui a créé cette application.`;
  const pointageText = `La page de pointages est destinée uniquement à l’enregistrement de la présence : le matin, à midi et aussi le soir. On saisit le numéro de téléphone et le mot de passe pour se connecter, puis on demande le code de validation et le code de pointage via le bouton Générer un code. Tu reçois alors le code et une notification apparaît — il faut appuyer sur “OK”, copier le code depuis la notification, puis le coller immédiatement dans le champ Valide la présence et cliquer sur le bouton vert Valider la présence. Attention : tu n’as que 15 secondes pour copier ce code, il faut donc le faire très rapidement et sans erreur. Si le code est incorrect ou que la copie échoue, tu disposes encore 3 tentatives. Pour éviter que quelqu’un d’autre abuse en demandant ton code, protège et garde précieusement ton mot de passe.`;
  const historiqueText = `L’Historique permet de consulter, selon les catégories, l’assiduité de chacun. En cliquant sur le bouton Présences (vert), on peut voir les personnes qui sont venues travailler aujourd’hui. En cliquant sur le bouton Absents (rouge), on peut voir celles qui ne sont pas venues ou qui se sont absentées. Pour consulter tous les historiques, il faut utiliser le bouton Historique complet (bleu). Enfin, dans la section Statut (bouton violet), on trouve le statut de chaque personne : cela permet de savoir si elle est présente ou absente. Si quelqu’un est absent, un texte en rouge indiquant Absent s’affiche à côté de son nom dans la liste. Si la personne est présente, ce texte rouge devient vert et affiche Présent. On peut également cliquer sur le nom de chaque personne pour voir les dates et les heures exactes de ses arrivées et de ses sorties.`;
  const statistiquesText = `La page Statistiques affiche la présence sous forme de graphique. L'axe vertical (Y) représente le nombre d'employés et l'axe horizontal (X) correspond aux jours de la semaine. Cela permet d'avoir une représentation visuelle de l'assiduité des employés chaque semaine et de pouvoir consulter les semaines passées à l'aide des boutons Précédent et Suivant.`;
  const remarqueText = `Fais bien attention et protège soigneusement ton mot de passe, et lis attentivement ces instructions. Souviens-toi qu’il n’est pas encore possible de modifier le mot de passe. En cas de fraude ou d’oubli, tu peux contacter les développeurs mentionnés ci-dessous.`;

  const shortText = (text) => text.substring(0, 100) + '...';

  // -------------------- RENDER --------------------
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* MODALE LOGO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoModalVisible}
        onRequestClose={() => setIsLogoModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
              onPress={() => { playClickSound(); setIsLogoModalVisible(false); }}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>X</Text>
            </TouchableOpacity>
            <Image source={logo} style={styles.fullScreenLogo} resizeMode="contain" />
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <TouchableOpacity style={styles.header} onPress={() => { playClickSound(); setIsLogoModalVisible(true); }}>
        <Image source={logo} style={styles.logo} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Centre d'aide</Text>
      </TouchableOpacity>

      {/* BIENVENUE */}
      <View style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Bienvenue dans le centre d'aide de l'application NY HAVANA. Ce guide vous expliquera comment utiliser l'application pour gérer vos pointages de manière simple et rapide.
        </Text>
      </View>

      {/* SECTIONS */}
      {[
        { key: 'registration', title: 'Enregistrement', text: registrationText },
        { key: 'list', title: 'Listes', text: listText },
        { key: 'pointage', title: 'Pointages', text: pointageText },
        { key: 'historique', title: 'Historique', text: historiqueText },
        { key: 'statistiques', title: 'Statistiques', text: statistiquesText },
        { key: 'remarque', title: 'Remarque', text: remarqueText },
      ].map(section => (
        <View key={section.key} style={[styles.content, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
          <Text style={[styles.paragraph, styles.sectionTitle, { color: theme.colors.primary }]}>
            {section.title}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Text style={[styles.paragraph, { color: theme.colors.text, marginBottom: 0 }]}>
              {showFullText[section.key] ? section.text : shortText(section.text)}
            </Text>
            <TouchableOpacity onPress={() => { playClickSound(); toggleShowText(section.key); }}>
              <Text style={styles.link}>
                {showFullText[section.key] ? 'Masqué' : 'Afficher la suite'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* FOOTER */}
      <TouchableOpacity onPress={() => { playClickSound(); openFacebookProfile(); }} style={[styles.footerContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
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
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
    color: 'gray',
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 20,
  },
  fullScreenLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    borderRadius: 15,
    padding: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default AideScreen;
