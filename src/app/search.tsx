import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import type { GuestCount } from '@/features/listings/types';

const { width: SCREEN_W } = Dimensions.get('window');

type Step = 'destination' | 'dates' | 'guests';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const suggestedRegions = [
  { label: "I'm flexible", icon: 'earth-outline' as const },
  { label: 'United States', icon: 'flag-outline' as const },
  { label: 'Japan', icon: 'flag-outline' as const },
  { label: 'Southeast Asia', icon: 'earth-outline' as const },
  { label: 'Italy', icon: 'flag-outline' as const },
  { label: 'France', icon: 'flag-outline' as const },
];

function StepHeader({
  step,
  current,
  label,
  value,
  onPress,
}: {
  step: Step;
  current: Step;
  label: string;
  value: string;
  onPress: () => void;
}) {
  const active = current === step;
  return (
    <Pressable
      style={[styles.stepCard, active && styles.stepCardActive]}
      onPress={onPress}>
      {active ? (
        <Text style={styles.stepActiveLabel}>{label}</Text>
      ) : (
        <View style={styles.stepCollapsed}>
          <Text style={styles.stepCollapsedLabel}>{label}</Text>
          <Text style={styles.stepCollapsedValue} numberOfLines={1}>{value}</Text>
        </View>
      )}
    </Pressable>
  );
}

function SimpleCalendar({
  year,
  month,
  checkIn,
  checkOut,
  onSelectDate,
}: {
  year: number;
  month: number;
  checkIn: string | null;
  checkOut: string | null;
  onSelectDate: (d: string) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null)];
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();

  return (
    <View style={styles.calendar}>
      <Text style={styles.calMonthLabel}>
        {MONTHS[month]} {year}
      </Text>
      <View style={styles.calDaysRow}>
        {DAYS.map((d, i) => (
          <Text key={i} style={styles.calDayLabel}>{d}</Text>
        ))}
      </View>
      <View style={styles.calGrid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={styles.calCell} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = new Date(iso) < today;
          const isCheckIn = checkIn === iso;
          const isCheckOut = checkOut === iso;
          const inRange =
            checkIn && checkOut && iso > checkIn && iso < checkOut;

          return (
            <Pressable
              key={i}
              style={[
                styles.calCell,
                (isCheckIn || isCheckOut) && styles.calCellSelected,
                inRange && styles.calCellRange,
                isPast && styles.calCellPast,
              ]}
              onPress={() => !isPast && onSelectDate(iso)}
              disabled={isPast}>
              <Text
                style={[
                  styles.calDayText,
                  (isCheckIn || isCheckOut) && styles.calDayTextSelected,
                  isPast && styles.calDayTextPast,
                ]}>
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function GuestCounter({
  label,
  sub,
  value,
  onInc,
  onDec,
}: {
  label: string;
  sub: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <View style={styles.guestRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.guestLabel}>{label}</Text>
        <Text style={styles.guestSub}>{sub}</Text>
      </View>
      <View style={styles.counterWrap}>
        <Pressable
          style={[styles.counterBtn, value === 0 && styles.counterBtnDisabled]}
          onPress={onDec}
          disabled={value === 0}>
          <Ionicons name="remove" size={18} color={value === 0 ? Colors.border : Colors.text} />
        </Pressable>
        <Text style={styles.counterValue}>{value}</Text>
        <Pressable style={styles.counterBtn} onPress={onInc}>
          <Ionicons name="add" size={18} color={Colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

export default function SearchModal() {
  const [step, setStep] = useState<Step>('destination');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [dateMode, setDateMode] = useState<'dates' | 'months' | 'flexible'>('dates');
  const [guests, setGuests] = useState<GuestCount>({ adults: 0, children: 0, infants: 0, pets: 0 });

  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const handleDateSelect = (iso: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso);
      setCheckOut(null);
    } else if (iso > checkIn) {
      setCheckOut(iso);
    } else {
      setCheckIn(iso);
    }
  };

  const totalGuests = guests.adults + guests.children;
  const guestSummary =
    totalGuests > 0
      ? `${totalGuests} guest${totalGuests > 1 ? 's' : ''}${guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? 's' : ''}` : ''}${guests.pets > 0 ? `, ${guests.pets} pet${guests.pets > 1 ? 's' : ''}` : ''}`
      : 'Add guests';

  const dateSummary = checkIn && checkOut
    ? `${checkIn} – ${checkOut}`
    : checkIn
    ? checkIn
    : 'Any week';

  const handleSearch = () => {
    router.back();
    // Navigate to home with search params
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={Colors.text} />
        </Pressable>
        <View style={styles.headerTabs}>
          <Pressable style={styles.headerTab}>
            <Text style={styles.headerTabActive}>Stays</Text>
            <View style={styles.headerTabUnderline} />
          </Pressable>
          <Pressable style={styles.headerTab}>
            <Text style={styles.headerTabInactive}>Experiences</Text>
          </Pressable>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Step 1: Where */}
        <StepHeader
          step="destination"
          current={step}
          label="Where to?"
          value={destination || 'Anywhere'}
          onPress={() => setStep('destination')}
        />
        {step === 'destination' && (
          <View style={styles.stepContent}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInputText}
                placeholder="Search destinations"
                placeholderTextColor={Colors.textSecondary}
                value={destination}
                onChangeText={setDestination}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => setStep('dates')}
              />
              {destination.length > 0 && (
                <Pressable onPress={() => setDestination('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </Pressable>
              )}
            </View>

            {destination.length === 0 && (
              <View style={styles.suggestionsWrap}>
                {suggestedRegions.map((r) => (
                  <Pressable
                    key={r.label}
                    style={styles.suggestionRow}
                    onPress={() => {
                      setDestination(r.label);
                      setStep('dates');
                    }}>
                    <View style={styles.suggestionIcon}>
                      <Ionicons name={r.icon} size={20} color={Colors.text} />
                    </View>
                    <Text style={styles.suggestionLabel}>{r.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Step 2: When */}
        <View style={styles.divider} />
        <StepHeader
          step="dates"
          current={step}
          label="When's your trip?"
          value={dateSummary}
          onPress={() => setStep('dates')}
        />
        {step === 'dates' && (
          <View style={styles.stepContent}>
            {/* Mode switcher */}
            <View style={styles.modeSwitcher}>
              {(['dates', 'months', 'flexible'] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[styles.modeBtn, dateMode === m && styles.modeBtnActive]}
                  onPress={() => setDateMode(m)}>
                  <Text style={[styles.modeBtnText, dateMode === m && styles.modeBtnTextActive]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {dateMode === 'dates' && (
              <>
                <View style={styles.calNav}>
                  <Pressable
                    onPress={() => {
                      if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
                      else setCalMonth(m => m - 1);
                    }}>
                    <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
                  </Pressable>
                  <Text style={styles.calNavLabel}>{MONTHS[calMonth]} {calYear}</Text>
                  <Pressable
                    onPress={() => {
                      if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
                      else setCalMonth(m => m + 1);
                    }}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                  </Pressable>
                </View>
                <SimpleCalendar
                  year={calYear}
                  month={calMonth}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelectDate={handleDateSelect}
                />

                {/* Duration pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.md }}>
                  {['Exact dates', '± 1 day', '± 2 days', '± 3 days'].map((d) => (
                    <Pressable key={d} style={styles.durationPill}>
                      <Text style={styles.durationText}>{d}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {dateMode === 'flexible' && (
              <View style={styles.flexWrap}>
                <Text style={styles.flexTitle}>Stay for a week</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['Weekend', 'Week', 'Month'].map((d) => (
                    <Pressable key={d} style={styles.flexPill}>
                      <Text style={styles.flexPillText}>{d}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={[styles.flexTitle, { marginTop: Spacing.md }]}>Go anytime</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'].map((m) => (
                    <Pressable key={m} style={styles.monthPill}>
                      <Text style={styles.monthPillText}>{m}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Guests */}
        <View style={styles.divider} />
        <StepHeader
          step="guests"
          current={step}
          label="Who's coming?"
          value={guestSummary}
          onPress={() => setStep('guests')}
        />
        {step === 'guests' && (
          <View style={styles.stepContent}>
            <GuestCounter
              label="Adults"
              sub="Ages 13 or above"
              value={guests.adults}
              onInc={() => setGuests((g) => ({ ...g, adults: g.adults + 1 }))}
              onDec={() => setGuests((g) => ({ ...g, adults: Math.max(0, g.adults - 1) }))}
            />
            <View style={styles.divider} />
            <GuestCounter
              label="Children"
              sub="Ages 2–12"
              value={guests.children}
              onInc={() => setGuests((g) => ({ ...g, children: g.children + 1 }))}
              onDec={() => setGuests((g) => ({ ...g, children: Math.max(0, g.children - 1) }))}
            />
            <View style={styles.divider} />
            <GuestCounter
              label="Infants"
              sub="Under 2"
              value={guests.infants}
              onInc={() => setGuests((g) => ({ ...g, infants: g.infants + 1 }))}
              onDec={() => setGuests((g) => ({ ...g, infants: Math.max(0, g.infants - 1) }))}
            />
            <View style={styles.divider} />
            <GuestCounter
              label="Pets"
              sub="Bringing a service animal?"
              value={guests.pets}
              onInc={() => setGuests((g) => ({ ...g, pets: g.pets + 1 }))}
              onDec={() => setGuests((g) => ({ ...g, pets: Math.max(0, g.pets - 1) }))}
            />
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            setDestination('');
            setCheckIn(null);
            setCheckOut(null);
            setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
          }}>
          <Text style={styles.clearAll}>Clear all</Text>
        </Pressable>
        <Pressable style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={18} color={Colors.white} />
          <Text style={styles.searchBtnText}>Search</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTabs: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl },
  headerTab: { alignItems: 'center', paddingBottom: 4 },
  headerTabActive: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  headerTabInactive: { fontSize: FontSize.base, color: Colors.textSecondary },
  headerTabUnderline: { height: 2, backgroundColor: Colors.text, borderRadius: 1, width: '100%', marginTop: 4 },

  // Step card
  stepCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  stepCardActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.text,
    ...Shadow.md,
  },
  stepActiveLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  stepCollapsed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepCollapsedLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  stepCollapsedValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: Spacing.sm },

  stepContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  // Search input
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  searchInputText: { flex: 1, fontSize: FontSize.base, color: Colors.text },

  // Suggestions
  suggestionsWrap: { marginTop: Spacing.md, gap: 2 },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.md,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionLabel: { fontSize: FontSize.base, color: Colors.text },

  // Calendar
  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  calNavLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  calendar: { gap: Spacing.sm },
  calMonthLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  calDaysRow: { flexDirection: 'row' },
  calDayLabel: {
    width: (SCREEN_W - Spacing.md * 4) / 7,
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: (SCREEN_W - Spacing.md * 4) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellSelected: { backgroundColor: Colors.text, borderRadius: 20 },
  calCellRange: { backgroundColor: Colors.backgroundSecondary },
  calCellPast: { opacity: 0.3 },
  calDayText: { fontSize: FontSize.base, color: Colors.text },
  calDayTextSelected: { color: Colors.white, fontWeight: '700' },
  calDayTextPast: { color: Colors.textSecondary },

  // Duration pills
  durationPill: {
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationText: { fontSize: FontSize.sm, color: Colors.text },

  // Mode switcher
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.full,
    padding: 3,
    marginBottom: Spacing.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  modeBtnActive: { backgroundColor: Colors.white, ...Shadow.sm },
  modeBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.text, fontWeight: '600' },

  // Flexible
  flexWrap: { gap: Spacing.sm },
  flexTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  flexPill: {
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  flexPillText: { fontSize: FontSize.base, color: Colors.text },
  monthPill: {
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthPillText: { fontSize: FontSize.base, color: Colors.text },

  // Guest counters
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  guestLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  guestSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  counterWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: { borderColor: Colors.borderLight },
  counterValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, minWidth: 24, textAlign: 'center' },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  clearAll: { fontSize: FontSize.base, color: Colors.text, textDecorationLine: 'underline', fontWeight: '600' },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  searchBtnText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },
});
