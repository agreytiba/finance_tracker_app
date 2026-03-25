import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './screens/WelcomeScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import IncomeScreen from './screens/IncomeScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import AnalysisScreen from './screens/AnalysisScreen';

// Create stack navigator
const Stack = createStackNavigator();

/**
 * Main App Component
 * Sets up navigation and initializes the database
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: 'Admin Dashboard',
          }}
        />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            title: 'Add Transaction',
          }}
        />
        <Stack.Screen
          name="Income"
          component={IncomeScreen}
          options={{
            title: 'Income Management',
          }}
        />
        <Stack.Screen
          name="Expenses"
          component={ExpensesScreen}
          options={{
            title: 'Expense Management',
          }}
        />
        <Stack.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{
            title: 'Financial Analysis',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
