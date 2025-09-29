import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

export default function WeeklyEmployeeCountChart() {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetchData(weekOffset);
  }, [weekOffset]);

  const fetchData = async (offset) => {
    setLoading(true);
    try {
const response = await fetch(`https://app-d640882c-5f6c-40be-bdce-71d739b28d12.cleverapps.io/api/chart/weekly-employee-count?offset=${offset}`);
      if (!response.ok) {
        throw new Error('Erreur de réseau lors de la récupération des données.');
      }
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.log('Erreur lors de la récupération des données du graphique:', err);
      setError('Impossible de récupérer les données.');
    } finally {
      setLoading(false);
    }
  };

  const data = chartData ? {
    labels: chartData.labels,
    datasets: [{
      data: chartData.values
    }]
  } : {
    labels: [],
    datasets: [{ data: [] }]
  };

  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${theme.colors.primary_rgb}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.colors.text_rgb}, ${opacity})`,
    strokeWidth: 2,
    propsForLabels: {
      fontSize: 10,
    },
    barPercentage: 0.8,
  };

  const handlePreviousWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  const handleNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(weekOffset + 1);
    }
  };

  const getChartTitle = () => {
    if (weekOffset === 0) {
      return 'Nombre de pointages par jour (cette semaine)';
    } else if (weekOffset === -1) {
      return 'Nombre de pointages par jour (semaine dernière)';
    } else {
      const startOfWeek = moment().add(weekOffset, 'weeks').startOf('isoWeek');
      const endOfWeek = moment().add(weekOffset, 'weeks').endOf('isoWeek');
      return `Nombre de pointages par jour du ${startOfWeek.format('DD MMMM YYYY')} au ${endOfWeek.format('DD MMMM YYYY')}`;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{getChartTitle()}</Text>

      {/* Navigation entre les semaines */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePreviousWeek}>
          <Icon name="chevron-back-outline" size={30} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleNextWeek}>
          <Icon name="chevron-forward-outline" size={30} color={weekOffset === 0 ? theme.colors.textSecondary : theme.colors.text} />
        </TouchableOpacity>
      </View>

      {data.datasets[0].data.length > 0 ? (
        <BarChart
          data={data}
          width={chartWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>Aucune donnée de pointage pour cette semaine.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 40,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  navButton: {                
    padding: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
    paddingLeft: 0,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
