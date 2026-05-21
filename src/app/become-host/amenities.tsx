import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useBecomeHost } from '@/features/host/context/BecomeHostContext';
import StepWrapper from './_step';

const ALL_AMENITIES = [
  { label: 'WiFi', icon: 'wifi-outline' },
  { label: 'Kitchen', icon: 'restaurant-outline' },
  { label: 'Air Conditioning', icon: 'snow-outline' },
  { label: 'Heating', icon: 'flame-outline' },
  { label: 'Washer/Dryer', icon: 'water-outline' },
  { label: 'Free Parking', icon: 'car-outline' },
  { label: 'Pool', icon: 'water-outline' },
  { label: 'Hot Tub', icon: 'thermometer-outline' },
  { label: 'Gym', icon: 'barbell-outline' },
  { label: 'TV', icon: 'tv-outline' },
  { label: 'Fireplace', icon: 'flame-outline' },
  { label: 'BBQ', icon: 'flame-outline' },
  { label: 'Garden', icon: 'leaf-outline' },
  { label: 'Workspace', icon: 'laptop-outline' },
  { label: 'Elevator', icon: 'arrow-up-outline' },
  { label: 'Doorman', icon: 'person-outline' },
];

export default function StepAmenities() {
  const { draft, update } = useBecomeHost();

  function toggle(label: string) {
    const has = draft.amenities.includes(label);
    update({ amenities: has ? draft.amenities.filter((a) => a !== label) : [...draft.amenities, label] });
  }

  return (
    <StepWrapper
      step={4} total={7}
      title="What do you offer guests?"
      subtitle="Pick at least 1 amenity."
      onNext={() => router.push('/become-host/title')}
      nextDisabled={draft.amenities.length === 0}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {ALL_AMENITIES.map((a) => {
          const active = draft.amenities.includes(a.label);
          return (
            <Pressable key={a.label} style={[styles.chip, active && styles.chipActive]} onPress={() => toggle(a.label)}>
              <Ionicons name={a.icon as any} size={22} color={active ? Colors.brand : Colors.textSecondary} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{a.label}</Text>
              {active && <Ionicons name="checkmark-circle" size={16} color={Colors.brand} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingBottom: Spacing.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.sm, paddingVertical: 10, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  chipActive: { borderColor: Colors.brand, backgroundColor: '#fff0f3' },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.brand },
});
