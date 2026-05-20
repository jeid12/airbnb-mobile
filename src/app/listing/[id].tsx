import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { api, getListingImages, parseLocation, type ApiListingDetail, type ApiReview } from '@/services/api';

const { width: SCREEN_W } = Dimensions.get('window');

function formatPrice(n: number) {
  return `$${n.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function Divider() {
  return <View style={divStyle.divider} />;
}
const divStyle = StyleSheet.create({
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.lg },
});

function HighlightRow({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.highlightRow}>
      <Ionicons name={icon} size={22} color={Colors.text} />
      <Text style={styles.highlightText}>{label}</Text>
    </View>
  );
}

function ReviewCard({ review }: { review: ApiReview }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: review.user.avatar ?? 'https://i.pravatar.cc/100' }}
          style={styles.reviewAvatar}
          contentFit="cover"
        />
        <View>
          <Text style={styles.reviewAuthor}>{review.user.name}</Text>
          <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= review.rating ? 'star' : 'star-outline'}
            size={11}
            color={Colors.text}
          />
        ))}
      </View>
      <Text style={styles.reviewBody} numberOfLines={4}>
        {review.comment}
      </Text>
    </View>
  );
}

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

// ─── Booking modal state ──────────────────────────────────────────────────────
function ReserveFooter({ listing }: { listing: ApiListingDetail }) {
  const { token } = useAuth();
  const [booking, setBooking] = useState(false);

  async function handleReserve() {
    if (!token) {
      router.push('/login');
      return;
    }
    if (booking) return;
    setBooking(true);
    try {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 1);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 3);
      await api.createBooking(token, {
        listingId: listing.id,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        guests: 1,
      });
      Alert.alert('Booking confirmed!', 'Your reservation has been placed successfully.', [
        { text: 'View trips', onPress: () => router.push('/(tabs)/trips') },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      Alert.alert('Booking failed', e.message ?? 'Please try again.');
    } finally {
      setBooking(false);
    }
  }

  return (
    <View style={styles.footer}>
      <View style={styles.footerLeft}>
        <Text style={styles.footerPrice}>
          <Text style={styles.footerPriceBold}>{formatPrice(listing.pricePerNight)}</Text>
          <Text style={styles.footerPriceNight}> night</Text>
        </Text>
        <Text style={styles.footerSub}>{listing.guests} guests max</Text>
      </View>
      <Pressable style={[styles.reserveBtn, booking && { opacity: 0.7 }]} onPress={handleReserve} disabled={booking}>
        {booking ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={styles.reserveBtnText}>{token ? 'Reserve' : 'Log in to Reserve'}</Text>
        )}
      </Pressable>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [listing, setListing] = useState<ApiListingDetail | null>(null);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [detail, revRes] = await Promise.all([
          api.getListing(id, token),
          api.getListingReviews(id, { limit: 10 }),
        ]);
        if (!cancelled) {
          setListing(detail);
          setReviews(revRes.data);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Failed to load listing');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, token]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error ?? 'Listing not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = getListingImages(listing);
  const loc = parseLocation(listing.location);
  const amenities = listing.amenities;
  const shownAmenities = amenities.slice(0, 6);

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* ── Photo gallery ── */}
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setImgIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
            }}>
            {images.map((img, i) => (
              <Pressable
                key={i}
                onPress={() => router.push({ pathname: '/photos', params: { listingId: listing.id, index: i } })}>
                <Image source={{ uri: img }} style={styles.galleryImage} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </Pressable>

          <View style={styles.galleryActions}>
            <Pressable style={styles.galleryAction}>
              <Ionicons name="share-outline" size={20} color={Colors.text} />
            </Pressable>
            <Pressable style={styles.galleryAction} onPress={() => setSaved((s) => !s)}>
              <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? Colors.brand : Colors.text} />
            </Pressable>
          </View>

          <View style={styles.galleryDots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.galDot, i === imgIndex && styles.galDotActive]} />
            ))}
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingSubtitle}>
            {listing.type.charAt(0) + listing.type.slice(1).toLowerCase()} · {loc.city}
            {loc.region ? `, ${loc.region}` : ''}
          </Text>

          <Text style={styles.capacityText}>
            {listing.guests} guests · {listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'} ·{' '}
            {listing.beds} {listing.beds === 1 ? 'bed' : 'beds'} · {listing.bathrooms}{' '}
            {listing.bathrooms === 1 ? 'bath' : 'baths'}
          </Text>

          <View style={styles.ratingPill}>
            <Ionicons name="star" size={14} color={Colors.text} />
            <Text style={styles.ratingPillText}>
              {listing.rating.toFixed(1)} · {reviews.length} reviews
            </Text>
          </View>

          <Divider />

          {/* Host */}
          <View style={styles.hostRow}>
            <Image
              source={{ uri: listing.host.avatar ?? 'https://i.pravatar.cc/100' }}
              style={styles.hostAvatar}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.hostName}>Hosted by {listing.host.name}</Text>
              <Text style={styles.hostMeta}>
                {listing.host.isSuperhost ? 'Superhost · ' : ''}
                {new Date(listing.host.createdAt).getFullYear()} · {listing.bookings.length} bookings
              </Text>
            </View>
            {listing.host.isSuperhost && (
              <View style={styles.superhostBadge}>
                <Ionicons name="medal-outline" size={14} color={Colors.brand} />
                <Text style={styles.superhostText}>Superhost</Text>
              </View>
            )}
          </View>

          <Divider />

          {/* Highlights */}
          <View style={styles.highlights}>
            <HighlightRow icon="key-outline" label="Self check-in" />
            {listing.host.isSuperhost && (
              <HighlightRow icon="medal-outline" label={`${listing.host.name} is a Superhost`} />
            )}
            <HighlightRow icon="calendar-outline" label="Free cancellation available" />
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

          {/* Amenities */}
          <Text style={styles.sectionHeading}>What this place offers</Text>
          <View style={styles.amenitiesList}>
            {shownAmenities.map((amenity) => (
              <View key={amenity} style={styles.amenityRow}>
                <Ionicons name="checkmark" size={18} color={Colors.text} />
                <Text style={styles.amenityName}>{amenity}</Text>
              </View>
            ))}
          </View>
          {amenities.length > 6 && (
            <Pressable
              style={styles.showAllBtn}
              onPress={() => router.push({ pathname: '/amenities', params: { listingId: listing.id } })}>
              <Text style={styles.showAllBtnText}>Show all {amenities.length} amenities</Text>
            </Pressable>
          )}

          <Divider />

          {/* Location */}
          <Text style={styles.sectionHeading}>Where you'll be</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color={Colors.border} />
            <Text style={styles.mapCity}>{listing.location}</Text>
          </View>

          <Divider />

          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <View style={styles.reviewsHeader}>
                <Ionicons name="star" size={16} color={Colors.text} />
                <Text style={styles.reviewsHeading}>
                  {listing.rating.toFixed(1)} · {reviews.length} reviews
                </Text>
              </View>

              <View style={styles.ratingBreakdown}>
                <RatingBar label="Overall" value={listing.rating} />
              </View>

              {reviews.slice(0, 3).map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}

              {reviews.length > 3 && (
                <Pressable
                  style={styles.showAllBtn}
                  onPress={() => router.push({ pathname: '/reviews', params: { listingId: listing.id } })}>
                  <Text style={styles.showAllBtnText}>Show all {reviews.length} reviews</Text>
                </Pressable>
              )}

              <Divider />
            </>
          )}

          {/* Full host card */}
          <Text style={styles.sectionHeading}>Hosted by {listing.host.name}</Text>
          <View style={styles.hostCard}>
            <Image
              source={{ uri: listing.host.avatar ?? 'https://i.pravatar.cc/100' }}
              style={styles.hostCardAvatar}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.hostCardName}>{listing.host.name}</Text>
              <Text style={styles.hostCardMeta}>
                {listing.bookings.length} bookings ·{' '}
                {listing.host.isSuperhost ? 'Superhost' : `Since ${new Date(listing.host.createdAt).getFullYear()}`}
              </Text>
            </View>
          </View>
          {listing.host.bio && (
            <Text style={styles.hostAbout} numberOfLines={4}>
              {listing.host.bio}
            </Text>
          )}
          <View style={styles.hostMeta2}>
            <View style={styles.hostMetaRow}>
              <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.hostMetaText}>Response rate available on request</Text>
            </View>
          </View>
          <Pressable style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Contact Host</Text>
          </Pressable>

          <Divider />

          {/* Report */}
          <Pressable
            style={styles.reportRow}
            onPress={() => router.push({ pathname: '/report', params: { listingId: listing.id } })}>
            <Ionicons name="flag-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.reportText}>Report this listing</Text>
          </Pressable>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Sticky booking footer ── */}
      <ReserveFooter listing={listing} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.lg },

  // Gallery
  galleryWrap: { position: 'relative', backgroundColor: Colors.backgroundSecondary },
  galleryImage: { width: SCREEN_W, height: SCREEN_W * 0.7 },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm, zIndex: 10,
  },
  galleryActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    right: 16,
    flexDirection: 'row', gap: Spacing.sm,
  },
  galleryAction: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  galleryDots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
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

  // Host inline
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  hostAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.backgroundSecondary },
  hostName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  hostMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  superhostBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full,
  },
  superhostText: { fontSize: FontSize.xs, color: Colors.brand, fontWeight: '600' },

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

  // Amenities
  amenitiesList: { gap: Spacing.md },
  amenityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  amenityName: { fontSize: FontSize.base, color: Colors.text },
  showAllBtn: {
    marginTop: Spacing.md, paddingVertical: 12, paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.text, alignItems: 'center',
  },
  showAllBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  // Map
  mapPlaceholder: {
    height: 160, borderRadius: Radius.xl,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, gap: 8,
  },
  mapCity: { fontSize: FontSize.base, color: Colors.textSecondary },

  // Reviews
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  reviewsHeading: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  ratingBreakdown: { gap: Spacing.sm, marginBottom: Spacing.lg },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ratingBarLabel: { width: 80, fontSize: FontSize.sm, color: Colors.text },
  ratingBarTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight, overflow: 'hidden' },
  ratingBarFill: { height: '100%', backgroundColor: Colors.text, borderRadius: 2 },
  ratingBarValue: { width: 28, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right' },
  reviewCard: {
    marginBottom: Spacing.lg, padding: Spacing.md,
    borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.backgroundSecondary },
  reviewAuthor: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  reviewDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reviewStars: { flexDirection: 'row', gap: 2, marginBottom: Spacing.sm },
  reviewBody: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  // Host card section
  hostCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  hostCardAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.backgroundSecondary },
  hostCardName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  hostCardMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  hostAbout: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: Spacing.md },
  hostMeta2: { gap: Spacing.sm, marginBottom: Spacing.md },
  hostMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  hostMetaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  contactBtn: {
    paddingVertical: 12, paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.text, alignItems: 'center',
  },
  contactBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  // Report
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  reportText: { fontSize: FontSize.sm, color: Colors.textSecondary, textDecorationLine: 'underline' },

  // Footer
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white,
  },
  footerLeft: { gap: 2 },
  footerPrice: { fontSize: FontSize.base },
  footerPriceBold: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  footerPriceNight: { fontWeight: '400', color: Colors.text },
  footerSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reserveBtn: {
    backgroundColor: Colors.brand, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl, paddingVertical: 14,
  },
  reserveBtnText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },
});
