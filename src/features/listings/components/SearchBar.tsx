import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by city or listing"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b4a66',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4deeb',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
});
