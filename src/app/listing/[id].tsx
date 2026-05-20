import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { listings } from '@/data/listings';
import type { AmenityGroup, Review } from '@/features/listings/types';

const { width: SCREEN_W } = Dimensions.get('window');

function formatPrice(n: number) {
  return `$${n.toLocaleString()}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Star rating display ──────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={12}
          color={Colors.text}
        />
      ))}
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return <View style={divStyle.divider} />;
}
const divStyle = StyleSheet.create({ divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.lg } });

// ─── Highlight badge ──────────────────────────────────────────────────────────
function HighlightRow({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.highlightRow}>
      <Ionicons name={icon} size={22} color={Colors.text} />
      <Text style={styles.highlightText}>{label}</Text>
    </View>
  );
}

// ─── Review card ─────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: review.author.avatar }}
          style={styles.reviewAvatar}
          contentFit="cover"
        />
        <View>
          <Text style={styles.reviewAuthor}>{review.author.name}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </View>
      <Text style={styles.reviewBody} numberOfLines={4}>
        {review.body}
      </Text>
    </View>
  );
}

// ─── Amenity row ─────────────────────────────────────────────────────────────
function AmenityRow({ item }: { item: { name: string; available: boolean; note?: string } }) {
  return (
    <View style={[styles.amenityRow, !item.available && { opacity: 0.4 }]}>
      <Ionicons
        name={item.available ? 'checkmark' : 'close'}
        size={18}
        color={item.available ? Colors.text : Colors.textSecondary}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.amenityName, !item.available && { textDecorationLine: 'line-through' }]}>
          {item.name}
        </Text>
        {item.note && <Text style={styles.amenityNote}>{item.note}</Text>}
      </View>
    </View>
  );
}

// ─── Rating bar ──────────────────────────────────────────────────────────────
function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingBarLabel}>{label}</Text>
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${(value / 5) * 100}%` }]} />
      </View>
      <Text style={styles.ratingBarValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = listings.find((l) => l.id === id);

  const [imgIndex, setImgIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Listing not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allAmenities = listing.amenities.flatMap((g) => g.items);
  const shownAmenities = allAmenities.slice(0, 6);
  const hasMoreAmenities = allAmenities.length > 6;

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* ── Photo gallery header ── */}
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setImgIndex(idx);
            }}>
            {listing.images.map((img, i) => (
              <Pressable
                key={i}
                onPress={() =>
                  router.push({
                    pathname: '/photos',
                    params: { listingId: listing.id, index: i },
                  })
                }>
                <Image source={{ uri: img }} style={styles.galleryImage} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>

          {/* Back button */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </Pressable>

          {/* Share + heart */}
          <View style={styles.galleryActions}>
            <Pressable style={styles.galleryAction}>
              <Ionicons name="share-outline" size={20} color={Colors.text} />
            </Pressable>
            <Pressable style={styles.galleryAction} onPress={() => setSaved((s) => !s)}>
              <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? Colors.brand : Colors.text} />
            </Pressable>
          </View>

          {/* Dots */}
          <View style={styles.galleryDots}>
            {listing.images.map((_, i) => (
              <View key={i} style={[styles.galDot, i === imgIndex && styles.galDotActive]} />
            ))}
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingSubtitle}>
            {listing.type} · hosted by {listing.host.name}
          </Text>

          {/* Capacity */}
          <Text style={styles.capacityText}>
            {listing.capacity.guests} guests · {listing.capacity.bedrooms}{' '}
            {listing.capacity.bedrooms === 1 ? 'bedroom' : 'bedrooms'} · {listing.capacity.beds}{' '}
            {listing.capacity.beds === 1 ? 'bed' : 'beds'} · {listing.capacity.bathrooms}{' '}
            {listing.capacity.bathrooms === 1 ? 'bath' : 'baths'}
          </Text>

          {/* Rating */}
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={14} color={Colors.text} />
            <Text style={styles.ratingPillText}>
              {listing.rating.overall.toFixed(2)} · {listing.rating.count} reviews
            </Text>
          </View>

          <Divider />

          {/* Highlights */}
          <View style={styles.highlights}>
            {listing.highlights.map((h) => {
              let icon: React.ComponentProps<typeof Ionicons>['name'] = 'checkmark-circle-outline';
              if (h.toLowerCase().includes('self')) icon = 'key-outline';
              else if (h.toLowerCase().includes('location')) icon = 'location-outline';
              else if (h.toLowerCase().includes('cancellation')) icon = 'calendar-outline';
              return <HighlightRow key={h} icon={icon} label={h} />;
            })}
          </View>

          <Divider />

          {/* Aircover */}
          <View style={styles.aircoverBox}>
            <Text style={styles.aircoverTitle}>
              <Text style={{ fontStyle: 'italic' }}>air</Text>
              <Text style={{ fontStyle: 'italic', fontWeight: '700' }}>cover</Text>
            </Text>
            <Text style={styles.aircoverBody}>
              Every booking includes free protection from host cancellations, listing inaccuracies,
              and other issues like trouble checking in.
            </Text>
            <Pressable>
              <Text style={styles.learnMore}>Learn more</Text>
            </Pressable>
          </View>

          <Divider />

          {/* Description */}
          <Text style={styles.sectionHeading}>About this place</Text>
          <Text style={styles.descText} numberOfLines={descExpanded ? undefined : 4}>
            {listing.description}
          </Text>
          <Pressable onPress={() => setDescExpanded((x) => !x)}>
            <Text style={styles.showMoreBtn}>
              {descExpanded ? 'Show less' : 'Show more'}{' '}
              <Ionicons name={descExpanded ? 'chevron-up' : 'chevron-forward'} size={12} />
            </Text>
          </Pressable>

          <Divider />

          {/* Sleep arrangements */}
          <Text style={styles.sectionHeading}>Where you'll sleep</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.md }}>
            {listing.sleepArrangements.map((s) => (
              <View key={s.name} style={styles.sleepCard}>
                <Ionicons name="bed-outline" size={28} color={Colors.text} />
                <Text style={styles.sleepName}>{s.name}</Text>
                <Text style={styles.sleepBeds}>{s.beds.join(', ')}</Text>
              </View>
            ))}
          </ScrollView>

          <Divider />

          {/* Amenities */}
          <Text style={styles.sectionHeading}>What this place offers</Text>
          <View style={styles.amenitiesList}>
            {shownAmenities.map((item) => (
              <AmenityRow key={item.name} item={item} />
            ))}
          </View>
          {hasMoreAmenities && (
            <Pressable
              style={styles.showAllBtn}
              onPress={() =>
                router.push({
                  pathname: '/amenities',
                  params: { listingId: listing.id },
                })
              }>
              <Text style={styles.showAllBtnText}>
                Show all {allAmenities.length} amenities
              </Text>
            </Pressable>
          )}

          <Divider />

          {/* Location */}
          <Text style={styles.sectionHeading}>Where you'll be</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color={Colors.border} />
            <Text style={styles.mapCity}>
              {listing.location.city}
              {listing.location.state ? `, ${listing.location.state}` : ''},{' '}
              {listing.location.country}
            </Text>
          </View>
          <Text style={styles.neighborhoodText} numberOfLines={3}>
            {listing.location.neighborhoodDescription}
          </Text>
          <Pressable>
            <Text style={styles.showMoreBtn}>Show more <Ionicons name="chevron-forward" size={12} /></Text>
          </Pressable>

          <Divider />

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Ionicons name="star" size={16} color={Colors.text} />
            <Text style={styles.reviewsHeading}>
              {listing.rating.overall.toFixed(2)} · {listing.rating.count} reviews
            </Text>
          </View>

          {/* Rating breakdown */}
          <View style={styles.ratingBreakdown}>
            <RatingBar label="Cleanliness" value={listing.rating.cleanliness} />
            <RatingBar label="Accuracy" value={listing.rating.accuracy} />
            <RatingBar label="Communication" value={listing.rating.communication} />
            <RatingBar label="Location" value={listing.rating.location} />
            <RatingBar label="Check-in" value={listing.rating.checkIn} />
            <RatingBar label="Value" value={listing.rating.value} />
          </View>

          {listing.reviews.slice(0, 2).map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}

          {listing.reviews.length > 2 && (
            <Pressable
              style={styles.showAllBtn}
              onPress={() =>
                router.push({ pathname: '/reviews', params: { listingId: listing.id } })
              }>
              <Text style={styles.showAllBtnText}>
                Show all {listing.reviews.length} reviews
              </Text>
            </Pressable>
          )}

          <Divider />

          {/* Host */}
          <Text style={styles.sectionHeading}>Hosted by {listing.host.name}</Text>
          <View style={styles.hostCard}>
            <Image
              source={{ uri: listing.host.avatar }}
              style={styles.hostAvatar}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.hostName}>{listing.host.name}</Text>
              <Text style={styles.hostMeta}>
                {listing.host.reviewsCount} Reviews ·{' '}
                {listing.host.superhost ? 'Superhost' : `Since ${listing.host.joinedYear}`}
              </Text>
            </View>
            {listing.host.superhost && (
              <View style={styles.superhostBadge}>
                <Ionicons name="medal-outline" size={14} color={Colors.brand} />
                <Text style={styles.superhostText}>Superhost</Text>
              </View>
            )}
          </View>
          <Text style={styles.hostAbout} numberOfLines={4}>{listing.host.about}</Text>
          <View style={styles.hostMeta2}>
            <View style={styles.hostMetaRow}>
              <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.hostMetaText}>Response rate: {listing.host.responseRate}</Text>
            </View>
            <View style={styles.hostMetaRow}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.hostMetaText}>Responds {listing.host.responseTime}</Text>
            </View>
          </View>
          <Pressable style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Contact Host</Text>
          </Pressable>

          <Divider />

          {/* Availability, rules, safety, cancellation */}
          {[
            { label: 'Availability', sub: `${formatDate(listing.availableFrom)} – ${listing.availableTo ? formatDate(listing.availableTo) : 'Flexible'}` },
            { label: 'House rules', sub: `Checkout before ${listing.houseRules.find(r => r.includes('Checkout'))?.replace('Checkout: ', '') ?? '11:00 AM'}` },
            { label: 'Health & safety', sub: 'Carbon monoxide alarm and 2 more' },
            { label: 'Cancellation policy', sub: listing.cancellationPolicy.split('.')[0] },
          ].map((item) => (
            <Pressable key={item.label} style={styles.collapseRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.collapseLabel}>{item.label}</Text>
                <Text style={styles.collapseSub} numberOfLines={1}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </Pressable>
          ))}

          <Divider />

          {/* Report */}
          <Pressable
            style={styles.reportRow}
            onPress={() =>
              router.push({ pathname: '/report', params: { listingId: listing.id } })
            }>
            <Ionicons name="flag-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.reportText}>Report this listing</Text>
          </Pressable>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Sticky booking footer ── */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerPrice}>
            <Text style={styles.footerPriceBold}>{formatPrice(listing.price.perNight)}</Text>
            <Text style={styles.footerPriceNight}> night</Text>
          </Text>
          <Text style={styles.footerDates}>
            {formatDate(listing.availableFrom)}
            {listing.availableTo ? ` – ${formatDate(listing.availableTo)}` : ''}
          </Text>
        </View>
        <Pressable style={styles.reserveBtn}>
          <Text style={styles.reserveBtnText}>Reserve</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  // Gallery
  galleryWrap: { position: 'relative', backgroundColor: Colors.backgroundSecondary },
  galleryImage: { width: SCREEN_W, height: SCREEN_W * 0.7 },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
    zIndex: 10,
  },
  galleryActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    right: 16,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  galleryAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  galleryDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  galDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  galDotActive: { backgroundColor: Colors.white, width: 7, height: 7 },

  // Content
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },

  listingTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  listingSubtitle: { fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 4 },
  capacityText: { fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 4 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingPillText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  // Highlights
  highlights: { gap: Spacing.md },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  highlightText: { flex: 1, fontSize: FontSize.base, color: Colors.text, fontWeight: '500' },

  // Aircover
  aircoverBox: { gap: 8 },
  aircoverTitle: { fontSize: FontSize.xl },
  aircoverBody: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  learnMore: { fontSize: FontSize.base, fontWeight: '600', textDecorationLine: 'underline', color: Colors.text },

  // Section
  sectionHeading: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  descText: { fontSize: FontSize.base, color: Colors.text, lineHeight: 22 },
  showMoreBtn: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, marginTop: Spacing.sm },

  // Sleep
  sleepCard: {
    width: 160,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    gap: 6,
  },
  sleepName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  sleepBeds: { fontSize: FontSize.sm, color: Colors.textSecondary },

  // Amenities
  amenitiesList: { gap: Spacing.md },
  amenityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  amenityName: { fontSize: FontSize.base, color: Colors.text },
  amenityNote: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  showAllBtn: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.text,
    alignItems: 'center',
  },
  showAllBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  // Map
  mapPlaceholder: {
    height: 180,
    borderRadius: Radius.xl,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  mapCity: { fontSize: FontSize.base, color: Colors.textSecondary },
  neighborhoodText: { fontSize: FontSize.base, color: Colors.text, lineHeight: 22 },

  // Reviews
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  reviewsHeading: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  ratingBreakdown: { gap: Spacing.sm, marginBottom: Spacing.lg },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ratingBarLabel: { width: 100, fontSize: FontSize.sm, color: Colors.text },
  ratingBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  ratingBarFill: { height: '100%', backgroundColor: Colors.text, borderRadius: 2 },
  ratingBarValue: { width: 28, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right' },

  reviewCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.backgroundSecondary },
  reviewAuthor: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  reviewDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reviewBody: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  // Host
  hostCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  hostAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.backgroundSecondary },
  hostName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  hostMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  superhostBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  superhostText: { fontSize: FontSize.xs, color: Colors.brand, fontWeight: '600' },
  hostAbout: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: Spacing.md },
  hostMeta2: { gap: Spacing.sm, marginBottom: Spacing.md },
  hostMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  hostMetaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  contactBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.text,
    alignItems: 'center',
  },
  contactBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  // Collapse rows
  collapseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  collapseLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  collapseSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  // Report
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  reportText: { fontSize: FontSize.sm, color: Colors.textSecondary, textDecorationLine: 'underline' },

  // Not found
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary },

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
  footerLeft: { gap: 2 },
  footerPrice: { fontSize: FontSize.base },
  footerPriceBold: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  footerPriceNight: { fontWeight: '400', color: Colors.text },
  footerDates: { fontSize: FontSize.sm, color: Colors.textSecondary, textDecorationLine: 'underline' },
  reserveBtn: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
  },
  reserveBtnText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },
});
