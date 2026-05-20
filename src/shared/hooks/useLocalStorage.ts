import { useState } from 'react';

// React Native equivalent of useLocalStorage<T>.
// Uses in-memory state within the session.
// For true persistence across app launches, swap to expo-secure-store or
// @react-native-async-storage/async-storage.
export function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initial);
  return [value, setValue];
}
