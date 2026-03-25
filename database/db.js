import { Platform } from 'react-native';

// Storage key
const STORAGE_KEY = 'finance_transactions';

// Check if we're in web environment
const isWeb = Platform.OS === 'web';

// Simple storage implementation using localStorage for both web and native
class UniversalStorage {
  constructor() {
    this.isWeb = isWeb;
  }

  // Get data from storage
  async getData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from storage:', error);
      return [];
    }
  }

  // Save data to storage
  async saveData(transactions) {
    try {
      const data = JSON.stringify(transactions);
      localStorage.setItem(STORAGE_KEY, data);
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  // Clear all data
  async clearData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

// Storage instance
const storage = new UniversalStorage();

// Mock database interface for compatibility
class MockDatabase {
  constructor() {
    this.isLocalStorage = true;
  }

  async execAsync(sql) {
    console.log('Mock DB executing:', sql);
    // Table creation is automatic in our storage system
    return;
  }

  async runAsync(sql, params = []) {
    console.log('Mock DB running:', sql, params);
    
    if (sql.includes('INSERT INTO transactions')) {
      const transactions = await storage.getData();
      const newTransaction = {
        id: Date.now(), // Simple ID generation
        title: params[0],
        amount: parseFloat(params[1]),
        type: params[2],
        date: params[3]
      };
      transactions.push(newTransaction);
      await storage.saveData(transactions);
      return { insertId: newTransaction.id };
    }
    
    if (sql.includes('DELETE FROM transactions')) {
      const transactions = await storage.getData();
      const id = parseInt(params[0]);
      const filteredTransactions = transactions.filter(t => t.id !== id);
      await storage.saveData(filteredTransactions);
      return { changes: 1 };
    }
    
    throw new Error('Unsupported SQL operation');
  }

  async getAllAsync(sql) {
    console.log('Mock DB getting all:', sql);
    const transactions = await storage.getData();
    
    if (sql.includes('SELECT * FROM transactions')) {
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    if (sql.includes('SELECT name FROM sqlite_master')) {
      return [{ name: 'transactions' }]; // Simulate table existence
    }
    
    if (sql.includes('SELECT SUM(amount)')) {
      const type = sql.includes('type = "income"') ? 'income' : 'expense';
      const filtered = transactions.filter(t => t.type === type);
      const total = filtered.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return [{ total }];
    }
    
    throw new Error('Unsupported SQL operation');
  }

  async getFirstAsync(sql) {
    const results = await this.getAllAsync(sql);
    return results[0] || null;
  }
}

// Database instance
let databaseInstance = null;

export async function getDatabase() {
  if (!databaseInstance) {
    databaseInstance = new MockDatabase();
  }
  return databaseInstance;
}

/**
 * Initialize database
 */
export async function initDB() {
  try {
    const database = await getDatabase();
    console.log('Database initialized successfully - using universal storage');
    return database;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Insert a new transaction into database
 */
export async function insertTransaction(title, amount, type, date) {
  try {
    const database = await getDatabase();
    const result = await database.runAsync(
      'INSERT INTO transactions (title, amount, type, date) VALUES (?, ?, ?, ?)',
      [title, amount, type, date]
    );
    console.log('Transaction inserted successfully with ID:', result.insertId);
    return result;
  } catch (error) {
    console.error('Error inserting transaction:', error);
    throw error;
  }
}

/**
 * Fetch all transactions from database
 */
export async function fetchAllTransactions() {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(
      'SELECT * FROM transactions ORDER BY date DESC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Delete a transaction by ID
 */
export async function deleteTransaction(id) {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    console.log('Transaction deleted successfully');
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

/**
 * Calculate total balance (income - expenses)
 */
export async function calculateBalance() {
  try {
    const database = await getDatabase();
    
    // Get total income
    const incomeResult = await database.getFirstAsync(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "income"'
    );
    
    // Get total expenses
    const expenseResult = await database.getFirstAsync(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "expense"'
    );
    
    const totalIncome = incomeResult?.total || 0;
    const totalExpenses = expenseResult?.total || 0;
    
    return totalIncome - totalExpenses;
  } catch (error) {
    console.error('Error calculating balance:', error);
    throw error;
  }
}

/**
 * Get total income
 */
export async function getTotalIncome() {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "income"'
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Error getting total income:', error);
    throw error;
  }
}

/**
 * Get total expenses
 */
export async function getTotalExpenses() {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "expense"'
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Error getting total expenses:', error);
    throw error;
  }
}
