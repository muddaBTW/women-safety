import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import FakeCallScreen from '../screens/main/FakeCallScreen';
import SafetyTimerScreen from '../screens/main/SafetyTimerScreen';
import { COLORS } from '../constants/Theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="FakeCall"
              component={FakeCallScreen}
              options={{
                animation: 'fade',
                presentation: 'fullScreenModal',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="SafetyTimer"
              component={SafetyTimerScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.text,
                headerShadowVisible: false,
                title: '',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth">
            {(props) => <AuthNavigator {...props} onLogin={() => setIsAuthenticated(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
