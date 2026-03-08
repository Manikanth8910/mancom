/**
 * Mancom App
 * Root component that sets up providers and navigation
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { RootNavigator } from './navigation';
import { Loading } from './components/ui';
import { ToastProvider } from './components/ui/Toast';
import { DemoRoleSwitcher } from './components/ui/DemoRoleSwitcher';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading message="Loading..." />} persistor={persistor}>
        <SafeAreaProvider>
          <ToastProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <RootNavigator />
            <DemoRoleSwitcher />
          </ToastProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
