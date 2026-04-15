import React from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, MessageCircle, Settings } from 'lucide-react-native';
import HomeScreen from '../screens/main/HomeScreen';
import ContactsScreen from '../screens/main/ContactsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ChatNavigator from './ChatNavigator';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/Theme';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: false, // Cleaner minimalist look
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Home color={color} size={24} strokeWidth={focused ? 2.5 : 1.5} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ContactsTab"
        component={ContactsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Users color={color} size={24} strokeWidth={focused ? 2.5 : 1.5} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <MessageCircle color={color} size={24} strokeWidth={focused ? 2.5 : 1.5} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Settings color={color} size={24} strokeWidth={focused ? 2.5 : 1.5} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      web: {
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
      }
    })
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    position: 'absolute',
    bottom: -10,
  },
});

export default TabNavigator;
