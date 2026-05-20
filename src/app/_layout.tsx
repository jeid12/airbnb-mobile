import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="listing/[id]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="search"
          options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="photos"
          options={{ presentation: 'fullScreenModal', headerShown: false }}
        />
        <Stack.Screen
          name="amenities"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="reviews"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="report"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
