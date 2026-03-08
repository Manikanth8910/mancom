/**
 * Root Navigator
 * Switches between Auth and Main stacks based on authentication state
 */

import { AdminTabs } from './AdminTabs';
import { AdminAnnounceScreen } from '../screens/admin/AdminAnnounceScreen';
import { AdminInvoiceScreen } from '../screens/admin/AdminInvoiceScreen';
import { AdminGuardsScreen } from '../screens/admin/AdminGuardsScreen';
import { AdminSettingsScreen } from '../screens/admin/AdminSettingsScreen';
import {
  selectIsAuthenticated,
  selectIsInitialized,
  selectUser,
  restoreSession,
} from '../store/slices/authSlice';

import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { SecurityTabs } from './SecurityTabs';
import { SuperadminTabs } from './SuperadminTabs';
import { Loading } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { RootStackParamList } from '../types/navigation';
import { FamilyScreen } from '../screens/profile/FamilyScreen';
import { DocumentsScreen } from '../screens/profile/DocumentsScreen';
import { PetsScreen } from '../screens/profile/PetsScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { PrivacyScreen } from '../screens/profile/PrivacyScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { VehiclesScreen } from '../screens/vehicles/VehiclesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ...

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const user = useAppSelector(selectUser);

  // Restore session on app launch
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Show loading while checking auth state
  if (!isInitialized) {
    return <Loading message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          user?.role === 'admin' ? (
            <Stack.Group>
              <Stack.Screen name="Admin" component={AdminTabs} />
              <Stack.Screen name="AdminAnnounce" component={AdminAnnounceScreen} />
              <Stack.Screen name="AdminInvoice" component={AdminInvoiceScreen} />
              <Stack.Screen name="AdminGuards" component={AdminGuardsScreen} />
              <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
            </Stack.Group>
          ) : user?.role === 'security' ? (
            <Stack.Group>
              <Stack.Screen name="Security" component={SecurityTabs} />
            </Stack.Group>
          ) : user?.role === 'superadmin' ? (
            <Stack.Group>
              <Stack.Screen name="Superadmin" component={SuperadminTabs} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Family" component={FamilyScreen} />
              <Stack.Screen name="Documents" component={DocumentsScreen} />
              <Stack.Screen name="Pets" component={PetsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Privacy" component={PrivacyScreen} />
              <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Vehicles" component={VehiclesScreen} />
            </Stack.Group>
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
