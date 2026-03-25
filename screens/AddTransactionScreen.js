import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { insertTransaction } from '../database/db';

/**
 * AddTransactionScreen - Allows users to add new income or expense transactions
 */
const AddTransactionScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // Default to expense
  const [loading, setLoading] = useState(false);

  /**
   * Handle saving the transaction
   */
  const handleSave = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the transaction');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);

    try {
      // Create date string in ISO format
      const date = new Date().toISOString();

      // Insert transaction into database
      await insertTransaction(title.trim(), parseFloat(amount), type, date);

      // Show success message
      Alert.alert(
        'Success',
        'Transaction added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to home screen
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );

      // Clear form
      setTitle('');
      setAmount('');
      setType('expense');
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        {/* Transaction Type Toggle */}
        <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === 'income' ? styles.typeButtonActive : styles.typeButtonInactive,
          ]}
          onPress={() => setType('income')}
        >
          <Text
            style={[
              styles.typeButtonText,
              type === 'income' ? styles.typeButtonTextActive : null,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === 'expense' ? styles.typeButtonActive : styles.typeButtonInactive,
          ]}
          onPress={() => setType('expense')}
        >
          <Text
            style={[
              styles.typeButtonText,
              type === 'expense' ? styles.typeButtonTextActive : null,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter transaction title (e.g., Salary, Groceries)"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ($)</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            This will be recorded as an {type.toLowerCase()}
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Transaction</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  webScrollView: {
    height: '100vh',
    overflowY: 'auto',
  },
  contentContainer: {
    padding: 20,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: 30,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeButtonInactive: {
    backgroundColor: '#fff',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddTransactionScreen;
