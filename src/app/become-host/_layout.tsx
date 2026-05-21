import { Stack } from 'expo-router';
import React from 'react';
import { BecomeHostProvider } from '@/features/host/context/BecomeHostContext';

export default function BecomeHostLayout() {
  return (
    <BecomeHostProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="type" />
        <Stack.Screen name="location" />
        <Stack.Screen name="details" />
        <Stack.Screen name="amenities" />
        <Stack.Screen name="title" />
        <Stack.Screen name="description" />
        <Stack.Screen name="price" />
        <Stack.Screen name="finish" />
      </Stack>
    </BecomeHostProvider>
  );
}
