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
  getTotalIncome,
  deleteTransaction,
} from '../database/db';

const { width, height } = Dimensions.get('window');

/**
 * IncomeScreen - Dedicated page for viewing and managing income transactions
 */
const IncomeScreen = ({ navigation }) => {
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [animatedTotal] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);

  // Load income data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadIncomeData();
    }, [])
  );

  /**
   * Load income transactions and calculate total
   */
  const loadIncomeData = async () => {
    try {
      const allTransactions = await fetchAllTransactions();
      const income = allTransactions.filter(t => t.type === 'income');
      const total = await getTotalIncome();
      
      setIncomeTransactions(income);
      setTotalIncome(total);
      
      // Animate total amount
      Animated.timing(animatedTotal, {
        toValue: total,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error('Error loading income data:', error);
    }
  };

  /**
   * Handle deleting an income transaction
   */
  const handleDeleteIncome = (id, title) => {
    Alert.alert(
      'Delete Income',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              loadIncomeData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete income transaction');
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
    await loadIncomeData();
    setRefreshing(false);
  };

  /**
   * Render income transaction item
   */
  const renderIncomeItem = ({ item }) => (
    <View style={styles.incomeItem}>
      <View style={styles.incomeDetails}>
        <Text style={styles.incomeTitle}>{item.title}</Text>
        <Text style={styles.incomeDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.incomeAmountContainer}>
        <Text style={styles.incomeAmount}>+TZS {item.amount.toLocaleString()}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteIncome(item.id, item.title)}
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
          <Text style={styles.headerTitle}>Income</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Total Income Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Income</Text>
          <Animated.Text style={styles.totalAmount}>
            TZS {animatedTotal.interpolate({
              inputRange: [0, 1],
              outputRange: [0, totalIncome],
            })._value.toLocaleString()}
          </Animated.Text>
          <Text style={styles.transactionCount}>
            {incomeTransactions.length} transaction{incomeTransactions.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Income List */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Income Transactions</Text>
          <FlatList
            data={incomeTransactions}
            renderItem={renderIncomeItem}
            keyExtractor={(item) => item.id.toString()}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No income transactions yet</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddTransaction')}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>Add Income</Text>
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
    backgroundColor: '#4CAF50',
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
      boxShadow: '0 6px 12px rgba(76, 175, 80, 0.15)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
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
    color: '#4CAF50',
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
  incomeItem: {
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
  incomeDetails: {
    flex: 1,
  },
  incomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  incomeDate: {
    fontSize: 12,
    color: '#999',
  },
  incomeAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
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

export default IncomeScreen;
