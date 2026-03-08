/**
 * Auth Stack Navigator
 * Handles navigation for unauthenticated users
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import type { AuthStackParamList } from './types';
import { theme } from '../config/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Otp"
        component={OtpScreen}
        options={{
          headerShown: true,
          headerTitle: 'Verify OTP',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

export default AuthStack;
