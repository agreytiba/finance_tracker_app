# Finance App - Quick Start Guide

A complete React Native mobile application using Expo that manages personal finances with local SQLite storage.

## 📁 Project Structure

```
finance-app/
├── App.js                          # Main app component with navigation setup
├── database/
│   └── db.js                       # SQLite database configuration and queries
├── screens/
│   ├── HomeScreen.js               # Displays balance and transaction list
│   └── AddTransactionScreen.js     # Form to add new transactions
└── package.json                    # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for testing on mobile device)

### Installation

1. Navigate to the project directory:
```bash
cd finance-app
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
expo start
```

### Running the App

**On Android:**
- Scan the QR code with the Expo Go app (Android version)
- Or press `a` in the terminal to open on Android emulator

**On iOS:**
- Scan the QR code with the Camera app or Expo Go app
- Or press `i` in the terminal to open on iOS simulator (requires macOS)

**On Web:**
- Press `w` in the terminal to open in web browser

## 🎯 Features

### Home Screen
- ✅ Display total balance (income - expenses)
- ✅ Show income and expenses breakdown
- ✅ List all transactions in chronological order
- ✅ Pull-to-refresh functionality
- ✅ Delete transactions with confirmation
- ✅ Color-coded transactions (Green for income, Red for expenses)
- ✅ Readable date format

### Add Transaction Screen
- ✅ Toggle between Income/Expense type
- ✅ Input fields for title and amount
- ✅ Form validation
- ✅ Success/error alerts
- ✅ Auto-navigation back to home after saving

## 💾 Database Schema

**Table:** `transactions`
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `title` - TEXT (transaction name)
- `amount` - REAL (transaction amount)
- `type` - TEXT ('income' or 'expense')
- `date` - TEXT (ISO date string)

## 🔧 Database Operations

The app includes the following database functions in `database/db.js`:

- `initDB()` - Initialize database and create tables
- `insertTransaction(title, amount, type, date)` - Add new transaction
- `fetchAllTransactions()` - Get all transactions ordered by date
- `deleteTransaction(id)` - Remove a transaction
- `calculateBalance()` - Calculate total balance
- `getTotalIncome()` - Get sum of all income
- `getTotalExpenses()` - Get sum of all expenses

## 🎨 UI Design

- **Clean and modern interface** using native React Native components
- **Color scheme:**
  - Primary: Blue (#2196F3)
  - Income: Green (#4CAF50)
  - Expense: Red (#F44336)
  - Background: Light Gray (#f5f5f5)
- **Card-based layout** with subtle shadows
- **Responsive design** that adapts to different screen sizes

## 📝 Usage Instructions

1. **Add a Transaction:**
   - Tap the "+ Add Transaction" button on the home screen
   - Select Income or Expense type
   - Enter a title (e.g., "Salary", "Groceries")
   - Enter the amount
   - Tap "Save Transaction"

2. **View Transactions:**
   - All transactions are displayed on the home screen
   - Income appears in green with + prefix
   - Expenses appear in red with - prefix
   - Each transaction shows title, date, and amount

3. **Delete a Transaction:**
   - Tap the "Delete" button on any transaction
   - Confirm deletion in the alert dialog

4. **Refresh Data:**
   - Pull down on the transaction list to refresh
   - Balance and totals update automatically

## 🛠️ Technical Details

### React Hooks Used
- `useState` - Component state management
- `useEffect` - Side effects and lifecycle events
- `useCallback` - Memoized callbacks
- `useFocusEffect` - Navigation focus handling

### Navigation
- React Navigation v7 with Stack Navigator
- Smooth transitions between screens
- Header styling with consistent theme

### Data Storage
- Local SQLite database using expo-sqlite
- Persistent storage (data persists after app closes)
- Async/await for all database operations

## 🐛 Troubleshooting

**Database not initializing?**
- Make sure expo-sqlite is properly installed
- Check console logs for error messages

**Navigation not working?**
- Verify @react-navigation packages are installed
- Restart the Expo development server

**Styling issues?**
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📱 Testing Recommendations

1. Test adding multiple income transactions
2. Test adding multiple expense transactions
3. Verify balance calculation is correct
4. Test delete functionality
5. Test pull-to-refresh
6. Test form validation (empty fields, invalid amounts)
7. Test with many transactions to verify scrolling performance

## 🎉 Next Steps

You can extend this app with additional features like:
- Edit transaction functionality
- Transaction categories
- Date range filtering
- Charts and analytics
- Export data to CSV
- Budget tracking
- Search functionality
- Monthly/yearly summaries

## 📄 License

This project is created for educational purposes.

---

**Happy Coding! 💰📱**
