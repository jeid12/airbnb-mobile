import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { AuthProvider } from '@/context/auth';
import { StoreProvider } from '@/store/StoreContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2 },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="listing/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="booking/[id]" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
              <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
              <Stack.Screen name="register" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
              <Stack.Screen name="search" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
              <Stack.Screen name="photos" options={{ presentation: 'fullScreenModal', headerShown: false }} />
              <Stack.Screen name="amenities" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="reviews" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="report" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="host" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
            </Stack>
            <Toast />
          </AuthProvider>
        </StoreProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
