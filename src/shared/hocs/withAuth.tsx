import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import { useAuth } from '../../context/auth';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

export function withAuth<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return function AuthGuarded(props: P) {
    const { user } = useAuth();
    if (!user) {
      return (
        <View style={styles.gate}>
          <Text style={styles.title}>Sign in required</Text>
          <Text style={styles.sub}>Log in to access this feature.</Text>
          <Pressable style={styles.btn} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Log in</Text>
          </Pressable>
        </View>
      );
    }
    return <Component {...props} />;
  };
}

const styles = StyleSheet.create({
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  sub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  btn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.sm },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.base },
});
