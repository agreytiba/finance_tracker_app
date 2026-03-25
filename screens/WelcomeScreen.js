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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { initDB } from '../database/db';

const { width, height } = Dimensions.get('window');

/**
 * WelcomeScreen - Main welcome screen with admin access
 */
const WelcomeScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize database on app start
    const initializeApp = async () => {
      try {
        await initDB();
        setIsInitialized(true);
        startAnimations();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const handleAdminAccess = () => {
    navigation.navigate('AdminDashboard');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        {...(Platform.OS === 'web' && {
          style: [styles.scrollView, styles.webScrollView],
        })}
      >
        {/* Welcome Content */}
        <Animated.View 
          style={[
            styles.animatedContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* App Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>💰</Text>
            </View>
            <Text style={styles.appName}>FinanceTracker</Text>
            <Text style={styles.tagline}>Smart Financial Management</Text>
          </View>
   {/* Admin Access Button */}
          <View style={styles.adminContainer}>
            <Text style={styles.adminTitle}>Administrator Access</Text>
            <Text style={styles.adminSubtitle}>
              Access the full financial dashboard and management tools
            </Text>
            
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={handleAdminAccess}
            >
              <Text style={styles.adminButtonText}>🔐 Admin Dashboard</Text>
            </TouchableOpacity>
          </View>
          {/* Welcome Message */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Karibu Sana! 🇹🇿</Text>
            <Text style={styles.welcomeSubtitle}>
              Welcome to your personal finance management system
            </Text>
            <Text style={styles.description}>
              Track income, manage expenses, and monitor your financial health 
              all in one place. Built for Tanzanian users with Tanzanian Shillings.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Key Features</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>📊</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Real-time Analytics</Text>
                <Text style={styles.featureDescription}>
                  Track your finances with beautiful charts and insights
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>💵</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>TZS Support</Text>
                <Text style={styles.featureDescription}>
                  Full support for Tanzanian Shillings and local banking
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🔒</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Secure & Private</Text>
                <Text style={styles.featureDescription}>
                  Your financial data stays private and secure
                </Text>
              </View>
            </View>
          </View>


          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with ❤️ for Tanzanian businesses and individuals
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
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
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  welcomeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  adminContainer: {
    backgroundColor: 'rgba(255, 243, 224, 0.95)',
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff9800',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(255, 152, 0, 0.2)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#ff9800',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  adminTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 10,
    textAlign: 'center',
  },
  adminSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  adminButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#ff9800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default WelcomeScreen;
