import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchAllTransactions,
  getTotalIncome,
  getTotalExpenses,
  calculateBalance,
} from '../database/db';

const { width, height } = Dimensions.get('window');

/**
 * AnalysisScreen - Monthly income vs expense analysis with charts and insights
 */
const AnalysisScreen = ({ navigation }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months'); // 1month, 3months, 6months, 1year
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [animatedIncome] = useState(new Animated.Value(0));
  const [animatedExpenses] = useState(new Animated.Value(0));
  const [animatedBalance] = useState(new Animated.Value(0));

  // Load analysis data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAnalysisData();
    }, [selectedPeriod])
  );

  /**
   * Load and calculate monthly analysis data
   */
  const loadAnalysisData = async () => {
    try {
      const allTransactions = await fetchAllTransactions();
      const income = await getTotalIncome();
      const expenses = await getTotalExpenses();
      const balance = await calculateBalance();
      
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setTotalBalance(balance);
      
      // Calculate monthly data
      const monthly = calculateMonthlyData(allTransactions, selectedPeriod);
      setMonthlyData(monthly);
      
      // Animate values
      animateValues(income, expenses, balance);
    } catch (error) {
      console.error('Error loading analysis data:', error);
    }
  };

  /**
   * Calculate monthly data based on selected period
   */
  const calculateMonthlyData = (transactions, period) => {
    const months = {
      '1month': 1,
      '3months': 3,
      '6months': 6,
      '1year': 12
    };
    
    const monthsToShow = months[period] || 6;
    const now = new Date();
    const monthlyData = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        balance: monthIncome - monthExpenses,
        savings: monthIncome - monthExpenses,
      });
    }
    
    return monthlyData;
  };

  /**
   * Animate values when data loads
   */
  const animateValues = (income, expenses, balance) => {
    Animated.parallel([
      Animated.timing(animatedIncome, {
        toValue: income,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(animatedExpenses, {
        toValue: expenses,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(animatedBalance, {
        toValue: balance,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  };

  /**
   * Render monthly chart bar
   */
  const renderMonthlyBar = ({ item, index }) => {
    const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)));
    const incomeHeight = maxValue > 0 ? (item.income / maxValue) * 120 : 0;
    const expensesHeight = maxValue > 0 ? (item.expenses / maxValue) * 120 : 0;
    
    return (
      <View style={styles.barContainer}>
        <Text style={styles.monthLabel}>{item.month}</Text>
        <View style={styles.chartBar}>
          <View style={styles.barContainer}>
            <View style={[styles.incomeBar, { height: incomeHeight }]} />
            <View style={[styles.expensesBar, { height: expensesHeight }]} />
          </View>
        </View>
        <Text style={styles.balanceText}>
          TZS {item.savings.toLocaleString()}
        </Text>
      </View>
    );
  };

  /**
   * Render period selector button
   */
  const renderPeriodButton = (period, label) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.periodButtonActive,
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text style={[
        styles.periodButtonText,
        selectedPeriod === period && styles.periodButtonTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === 'web' && {
          style: [styles.scrollView, styles.webScrollView],
        })}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {renderPeriodButton('1month', '1M')}
          {renderPeriodButton('3months', '3M')}
          {renderPeriodButton('6months', '6M')}
          {renderPeriodButton('1year', '1Y')}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Animated.Text style={styles.summaryValueIncome}>
              TZS {animatedIncome.interpolate({
                inputRange: [0, 1],
                outputRange: [0, totalIncome],
              })._value.toLocaleString()}
            </Animated.Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Animated.Text style={styles.summaryValueExpenses}>
              TZS {animatedExpenses.interpolate({
                inputRange: [0, 1],
                outputRange: [0, totalExpenses],
              })._value.toLocaleString()}
            </Animated.Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Balance</Text>
            <Animated.Text style={[
              styles.summaryValueBalance,
              totalBalance >= 0 ? styles.positiveBalance : styles.negativeBalance,
            ]}>
              TZS {animatedBalance.interpolate({
                inputRange: [0, 1],
                outputRange: [0, totalBalance],
              })._value.toLocaleString()}
            </Animated.Text>
          </View>
        </View>

        {/* Monthly Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Income vs Expenses</Text>
          
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={styles.legendColorIncome} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendColorExpenses} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>
          
          <FlatList
            data={monthlyData}
            renderItem={renderMonthlyBar}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No data available for selected period</Text>
              </View>
            }
          />
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Financial Insights</Text>
          
          {monthlyData.length > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                📊 Average monthly income: TZS {Math.round(totalIncome / monthlyData.length).toLocaleString()}
              </Text>
              <Text style={styles.insightText}>
                💸 Average monthly expenses: TZS {Math.round(totalExpenses / monthlyData.length).toLocaleString()}
              </Text>
              <Text style={styles.insightText}>
                💰 Average monthly savings: TZS {Math.round(totalBalance / monthlyData.length).toLocaleString()}
              </Text>
              <Text style={[
                styles.insightText,
                totalBalance >= 0 ? styles.positiveInsight : styles.negativeInsight,
              ]}>
                {totalBalance >= 0 ? '🎉 Great job! You\'re saving money!' : '⚠️ Consider reducing expenses'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  webScrollView: {
    height: '100vh',
    overflowY: 'auto',
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9C27B0',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 60,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  periodButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValueIncome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summaryValueExpenses: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  summaryValueBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: '#4CAF50',
  },
  negativeBalance: {
    color: '#FF5252',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendColorIncome: {
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    marginRight: 5,
  },
  legendColorExpenses: {
    width: 12,
    height: 12,
    backgroundColor: '#FF5252',
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartList: {
    paddingRight: 20,
  },
  barContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  monthLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  chartBar: {
    height: 140,
    width: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
  },
  incomeBar: {
    width: 15,
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 2,
  },
  expensesBar: {
    width: 15,
    backgroundColor: '#FF5252',
    borderTopRightRadius: 2,
  },
  balanceText: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  insightsContainer: {
    margin: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  positiveInsight: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  negativeInsight: {
    color: '#FF5252',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default AnalysisScreen;
