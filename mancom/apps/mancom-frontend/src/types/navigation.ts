/**
 * Navigation type definitions
 * Provides type safety for navigation props throughout the app
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Otp: { phoneNumber: string; otpUserId: string };
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Community: undefined;
  Visitors: undefined;
  Payments: undefined;
  Helpdesk: undefined;
  Profile: undefined;
};

// Admin Tab Navigator
export type AdminTabParamList = {
  AdminOverview: undefined;
  AdminFinances: undefined;
  AdminAlerts: undefined;
  AdminSettings: undefined;
};

// Security Tab Navigator
export type SecurityTabParamList = {
  SecurityGate: undefined;
  SecurityLogs: undefined;
  SecurityResidents: undefined;
  SecurityProfile: undefined;
};

// Superadmin Tab Navigator
export type SuperadminTabParamList = {
  SuperadminDashboard: undefined;
  SuperadminSocieties: undefined;
  SuperadminUsers: undefined;
  SuperadminSettings: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Admin: NavigatorScreenParams<AdminTabParamList>;
  Security: NavigatorScreenParams<SecurityTabParamList>;
  Superadmin: NavigatorScreenParams<SuperadminTabParamList>;
  Family: undefined;
  Documents: undefined;
  Pets: undefined;
  Settings: undefined;
  Privacy: undefined;
  HelpSupport: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  AdminAnnounce: undefined;
  AdminInvoice: undefined;
  AdminGuards: undefined;
  AdminSettings: undefined;
  Vehicles: undefined;
};

// Screen Props Types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type AdminTabScreenProps<T extends keyof AdminTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SecurityTabScreenProps<T extends keyof SecurityTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<SecurityTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SuperadminTabScreenProps<T extends keyof SuperadminTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<SuperadminTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

// Declare global types for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
