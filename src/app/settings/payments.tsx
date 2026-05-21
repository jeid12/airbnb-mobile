import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

// Static card display — no payment processing backend exists yet.
interface Card { id: string; brand: string; last4: string; expiry: string; isDefault: boolean }

const INITIAL_CARDS: Card[] = [
  { id: '1', brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
];

const BRAND_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  Visa: 'card-outline',
  Mastercard: 'card-outline',
  Amex: 'card-outline',
};

function CardRow({ card, onRemove, onSetDefault }: { card: Card; onRemove: () => void; onSetDefault: () => void }) {
  return (
    <View style={styles.cardRow}>
      <View style={styles.cardLeft}>
        <Ionicons name={BRAND_ICONS[card.brand] ?? 'card-outline'} size={28} color={Colors.brand} />
        <View>
          <Text style={styles.cardBrand}>{card.brand} ••••{card.last4}</Text>
          <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
          {card.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardActions}>
        {!card.isDefault && (
          <Pressable style={styles.setDefaultBtn} onPress={onSetDefault}>
            <Text style={styles.setDefaultText}>Set default</Text>
          </Pressable>
        )}
        <Pressable onPress={onRemove}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}

export default function PaymentsScreen() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);

  function removeCard(id: string) {
    Alert.alert('Remove card', 'Remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setCards((c) => c.filter((x) => x.id !== id));
          Toast.show({ type: 'success', text1: 'Card removed' });
        },
      },
    ]);
  }

  function setDefault(id: string) {
    setCards((c) => c.map((x) => ({ ...x, isDefault: x.id === id })));
    Toast.show({ type: 'success', text1: 'Default card updated' });
  }

  function addCard() {
    // In a real app, open Stripe payment sheet or navigate to add-card form.
    Toast.show({ type: 'info', text1: 'Add card', text2: 'Payment processing coming soon.' });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Payments & payouts</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Payment methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment methods</Text>
          {cards.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="card-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyText}>No payment methods added yet.</Text>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {cards.map((c, i) => (
                <View key={c.id}>
                  <CardRow card={c} onRemove={() => removeCard(c.id)} onSetDefault={() => setDefault(c.id)} />
                  {i < cards.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          )}
          <Pressable style={styles.addBtn} onPress={addCard}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.brand} />
            <Text style={styles.addBtnText}>Add payment method</Text>
          </Pressable>
        </View>

        {/* Payout info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payouts</Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.brand} />
            <Text style={styles.infoText}>
              Payouts are processed within 1–3 business days after a guest checks in. Set up a bank account to receive payments as a host.
            </Text>
          </View>
          <Pressable style={styles.bankBtn} onPress={() => Toast.show({ type: 'info', text1: 'Payout setup coming soon.' })}>
            <Text style={styles.bankBtnText}>Set up payout account</Text>
          </Pressable>
        </View>

        {/* Transaction history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction history</Text>
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={36} color={Colors.border} />
            <Text style={styles.emptyText}>No transactions yet.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  section: { padding: Spacing.md, gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardsList: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.white, ...Shadow.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardBrand: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  cardExpiry: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  defaultBadge: { backgroundColor: '#e6f4ea', borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  defaultText: { fontSize: FontSize.xs, color: '#1e7e34', fontWeight: '600' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  setDefaultBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  setDefaultText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 60 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  addBtnText: { fontSize: FontSize.base, color: Colors.brand, fontWeight: '600' },
  emptyCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  infoBox: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#fff0f3', borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  bankBtn: { borderWidth: 1.5, borderColor: Colors.text, borderRadius: Radius.lg, paddingVertical: 12, alignItems: 'center' },
  bankBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
});
