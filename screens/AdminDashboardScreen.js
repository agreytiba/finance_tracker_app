import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchAllTransactions,
  calculateBalance,
  deleteTransaction,
  getTotalIncome,
  getTotalExpenses,
} from '../database/db';

const { width, height } = Dimensions.get('window');

/**
 * AdminDashboardScreen - Full financial dashboard for admin users
 */
const AdminDashboardScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ income: 0, expenses: 0, savings: 0 });
  const [animatedBalance] = useState(new Animated.Value(0));
  const [animatedIncome] = useState(new Animated.Value(0));
  const [animatedExpenses] = useState(new Animated.Value(0));
  const [displayBalance, setDisplayBalance] = useState('0.00');
  const [displayIncome, setDisplayIncome] = useState('0.00');
  const [displayExpenses, setDisplayExpenses] = useState('0.00');

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  /**
   * Load all financial data from database
   */
  const loadData = async () => {
    try {
      const [allTransactions, totalBalance, income, expenses] = await Promise.all([
        fetchAllTransactions(),
        calculateBalance(),
        getTotalIncome(),
        getTotalExpenses(),
      ]);
      
      setTransactions(allTransactions);
      setBalance(totalBalance);
      setTotalIncome(income);
      setTotalExpenses(expenses);
      
      // Set recent transactions (last 5)
      setRecentTransactions(allTransactions.slice(0, 5));
      
      // Calculate monthly stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTransactions = allTransactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      
      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      setMonthlyStats({
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: monthlyIncome - monthlyExpenses
      });
      
      // Animate numbers
      animateValue(animatedBalance, totalBalance, setDisplayBalance);
      animateValue(animatedIncome, income, setDisplayIncome);
      animateValue(animatedExpenses, expenses, setDisplayExpenses);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load financial data');
    }
  };
  
  const animateValue = (animatedValue, toValue, setter) => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    
    // Update display value
    setter(toValue.toFixed(2));
  };

  /**
   * Delete a transaction after confirmation
   */
  const handleDeleteTransaction = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              await loadData(); // Reload data after deletion
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  /**
   * Format date to readable format
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Render a single transaction item
   */
  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? '#4CAF50' : '#F44336' },
          ]}
        >
          {item.type === 'income' ? '+' : '-'}TZS {item.amount.toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() => handleDeleteTransaction(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      {...(Platform.OS === 'web' && {
        style: [styles.container, styles.webScrollView],
      })}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Financial Management System</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={[styles.balanceIndicator, { backgroundColor: balance >= 0 ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.indicatorText}>{balance >= 0 ? 'Positive' : 'Negative'}</Text>
          </View>
        </View>
        <Animated.Text style={[styles.balanceAmount, { color: balance >= 0 ? '#4CAF50' : '#F44336' }]}>
          TZS {balance >= 0 ? '' : '-'}{displayBalance}
        </Animated.Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetailItem}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>↑</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Income</Text>
              <Animated.Text style={styles.incomeAmount}>
                TZS {displayIncome}
              </Animated.Text>
            </View>
          </View>
          <View style={styles.balanceDetailItem}>
            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>↓</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Expenses</Text>
              <Animated.Text style={styles.expenseAmount}>
                TZS {displayExpenses}
              </Animated.Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Income')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>💰</Text>
            </View>
            <Text style={styles.actionTitle}>Income</Text>
            <Text style={styles.actionSubtitle}>View all income</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Expenses')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>💸</Text>
            </View>
            <Text style={styles.actionTitle}>Expenses</Text>
            <Text style={styles.actionSubtitle}>View all expenses</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Analysis')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📊</Text>
            </View>
            <Text style={styles.actionTitle}>Analysis</Text>
            <Text style={styles.actionSubtitle}>Monthly insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Monthly Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>TZS {monthlyStats.income.toFixed(2)}</Text>
            <Text style={styles.statTrend}>+12% from last month</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>TZS {monthlyStats.expenses.toFixed(2)}</Text>
            <Text style={styles.statTrend}>-8% from last month</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statLabel}>Savings</Text>
            <Text style={styles.statValue}>TZS {monthlyStats.savings.toFixed(2)}</Text>
            <Text style={styles.statTrend}>+5% from last month</Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={recentTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the button below to add your first transaction
              </Text>
            </View>
          }
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('AddTransaction')}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>+</Text>
            </View>
            <Text style={styles.quickActionText}>Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📊</Text>
            </View>
            <Text style={styles.quickActionText}>View Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📈</Text>
            </View>
            <Text style={styles.quickActionText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>⚙️</Text>
            </View>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Transaction Button */}
      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Text style={styles.floatingActionButtonText}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webScrollView: {
    height: '100vh',
    overflowY: 'auto',
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
        elevation: 8,
      },
    }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: -20,
    padding: 25,
    borderRadius: 20,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  balanceIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  incomeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  statsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
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
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statTrend: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quickActionsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
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
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  transactionsContainer: {
    margin: 20,
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 13,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  quickActionsContainer: {
    margin: 20,
    marginBottom: 100,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIconText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingActionButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;
