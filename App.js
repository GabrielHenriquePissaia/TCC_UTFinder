import React, { useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./navigation/stacknavigator";
import { AuthProvider } from "./hooks/useAuth";
import { startBackgroundService, stopBackgroundService } from './utils/BackgroundService';
import { registerForPushNotificationsAsync, requestUserPermission, setupFCMNotificationListener } from './notificationUtils';

export default function App() {
  useEffect(() => {
    startBackgroundService();

    return () => {
      stopBackgroundService();
    };
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
    requestUserPermission();
    setupFCMNotificationListener();
  }, []);

  return (
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
