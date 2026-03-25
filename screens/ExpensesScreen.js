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
  getTotalExpenses,
  deleteTransaction,
} from '../database/db';

const { width, height } = Dimensions.get('window');

/**
 * ExpensesScreen - Dedicated page for viewing and managing expense transactions
 */
const ExpensesScreen = ({ navigation }) => {
  const [expenseTransactions, setExpenseTransactions] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [animatedTotal] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);

  // Load expense data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadExpenseData();
    }, [])
  );

  /**
   * Load expense transactions and calculate total
   */
  const loadExpenseData = async () => {
    try {
      const allTransactions = await fetchAllTransactions();
      const expenses = allTransactions.filter(t => t.type === 'expense');
      const total = await getTotalExpenses();
      
      setExpenseTransactions(expenses);
      setTotalExpenses(total);
      
      // Animate total amount
      Animated.timing(animatedTotal, {
        toValue: total,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error('Error loading expense data:', error);
    }
  };

  /**
   * Handle deleting an expense transaction
   */
  const handleDeleteExpense = (id, title) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              loadExpenseData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense transaction');
            }
          },
        },
      ]
    );
  };

  /**
   * Refresh data
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenseData();
    setRefreshing(false);
  };

  /**
   * Render expense transaction item
   */
  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.expenseAmountContainer}>
        <Text style={styles.expenseAmount}>-TZS {item.amount.toLocaleString()}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteExpense(item.id, item.title)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>Expenses</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Total Expenses Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <Animated.Text style={styles.totalAmount}>
            TZS {animatedTotal.interpolate({
              inputRange: [0, 1],
              outputRange: [0, totalExpenses],
            })._value.toLocaleString()}
          </Animated.Text>
          <Text style={styles.transactionCount}>
            {expenseTransactions.length} transaction{expenseTransactions.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Expense List */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Expense Transactions</Text>
          <FlatList
            data={expenseTransactions}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id.toString()}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expense transactions yet</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddTransaction')}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>Add Expense</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction')}
          style={styles.floatingButton}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FF5252',
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
  totalCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 12px rgba(255, 82, 82, 0.15)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#FF5252',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5252',
    marginBottom: 8,
  },
  transactionCount: {
    fontSize: 14,
    color: '#999',
  },
  listContainer: {
    flex: 1,
    margin: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 100,
  },
  expenseItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
  },
  expenseAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
    marginRight: 15,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 8px rgba(255, 82, 82, 0.3)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#FF5252',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ExpensesScreen;
