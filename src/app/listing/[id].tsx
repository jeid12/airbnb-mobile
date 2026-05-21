import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useListing } from '@/features/listings/hooks/useListing';
import { useListingReviews } from '@/features/listings/hooks/useReviews';
import { api, getListingImages, parseLocation, type ApiListingDetail, type ApiReview } from '@/services/api';
import Spinner from '@/shared/components/Spinner';

const { width: SCREEN_W } = Dimensions.get('window');

function formatPrice(n: number) {
  return `$${n.toLocaleString()}`;
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
          <Ionicons key={i} name={i <= review.rating ? 'star' : 'star-outline'} size={11} color={Colors.text} />
        ))}
      </View>
      <Text style={styles.reviewBody} numberOfLines={4}>{review.comment}</Text>
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

// ─── Reserve Footer ───────────────────────────────────────────────────────────
function ReserveFooter({ listing }: { listing: ApiListingDetail }) {
  const { token } = useAuth();

  function handleReserve() {
    if (!token) { router.push('/login'); return; }
    router.push(`/booking/${listing.id}` as any);
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
      <Pressable style={styles.reserveBtn} onPress={handleReserve}>
        <Text style={styles.reserveBtnText}>{token ? 'Reserve' : 'Log in to Reserve'}</Text>
      </Pressable>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Use TanStack Query hooks — no manual useEffect needed
  const { data: listing, isLoading, error } = useListing(id ?? '');
  const { data: reviewsRes } = useListingReviews(id ?? '', { limit: 10 });

  const [imgIndex, setImgIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </Pressable>
        <Spinner />
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
          <Text style={styles.errorText}>{error?.message ?? 'Listing not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = getListingImages(listing);
  const loc = parseLocation(listing.location);
  const amenities = listing.amenities;
  const reviews = reviewsRes?.data ?? [];
  const reviewCount = reviewsRes?.meta.total ?? reviews.length;

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* ── Photo gallery ── */}
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}>
            {images.map((img, i) => (
              <Pressable key={i} onPress={() => router.push({ pathname: '/photos', params: { listingId: listing.id, index: i } })}>
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
            {listing.guests} guests
            {listing.bedrooms != null ? ` · ${listing.bedrooms} bedroom${listing.bedrooms !== 1 ? 's' : ''}` : ''}
            {listing.beds != null ? ` · ${listing.beds} bed${listing.beds !== 1 ? 's' : ''}` : ''}
            {listing.bathrooms != null ? ` · ${listing.bathrooms} bath${listing.bathrooms !== 1 ? 's' : ''}` : ''}
          </Text>

          {listing.rating != null && (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={14} color={Colors.text} />
              <Text style={styles.ratingPillText}>
                {Number(listing.rating).toFixed(1)} · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

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
              {listing.host.isSuperhost && <Text style={styles.superhostLabel}>Superhost</Text>}
            </View>
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
              Every booking includes free protection from host cancellations, listing inaccuracies, and other issues.
            </Text>
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
          {amenities.length > 0 && (
            <>
              <Text style={styles.sectionHeading}>What this place offers</Text>
              <View style={styles.amenitiesList}>
                {amenities.slice(0, 6).map((amenity) => (
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
            </>
          )}

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
                  {Number(listing.rating ?? 0).toFixed(1)} · {reviewCount} reviews
                </Text>
              </View>
              <View style={styles.ratingBreakdown}>
                <RatingBar label="Overall" value={Number(listing.rating ?? 0)} />
              </View>
              {reviews.slice(0, 3).map((r) => <ReviewCard key={r.id} review={r} />)}
              {reviewCount > 3 && (
                <Pressable
                  style={styles.showAllBtn}
                  onPress={() => router.push({ pathname: '/reviews', params: { listingId: listing.id } })}>
                  <Text style={styles.showAllBtnText}>Show all {reviewCount} reviews</Text>
                </Pressable>
              )}
              <Divider />
            </>
          )}

          {/* AI Review Summary */}
          {reviews.length >= 3 && (
            <>
              {aiSummary ? (
                <View style={styles.aiSummaryBox}>
                  <View style={styles.aiSummaryHeader}>
                    <Ionicons name="sparkles" size={16} color={Colors.brand} />
                    <Text style={styles.aiSummaryTitle}>AI Review Summary</Text>
                  </View>
                  <Text style={styles.aiSummaryText}>{aiSummary}</Text>
                </View>
              ) : (
                <Pressable
                  style={styles.aiSummaryCta}
                  disabled={aiSummaryLoading}
                  onPress={async () => {
                    setAiSummaryLoading(true);
                    try {
                      const res = await api.aiReviewSummary(listing.id);
                      setAiSummary(res.summary);
                    } catch { setAiSummary('Could not load AI summary.'); }
                    finally { setAiSummaryLoading(false); }
                  }}>
                  {aiSummaryLoading
                    ? <ActivityIndicator color={Colors.brand} size="small" />
                    : <>
                        <Ionicons name="sparkles-outline" size={16} color={Colors.brand} />
                        <Text style={styles.aiSummaryCtaText}>Summarise reviews with AI</Text>
                      </>}
                </Pressable>
              )}
              <Divider />
            </>
          )}

          {/* Host card */}
          <Text style={styles.sectionHeading}>Hosted by {listing.host.name}</Text>
          <View style={styles.hostCard}>
            <Image
              source={{ uri: listing.host.avatar ?? 'https://i.pravatar.cc/100' }}
              style={styles.hostCardAvatar}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.hostCardName}>{listing.host.name}</Text>
              {listing.host.isSuperhost && (
                <View style={styles.superhostBadge}>
                  <Ionicons name="medal-outline" size={14} color={Colors.brand} />
                  <Text style={styles.superhostText}>Superhost</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Pressable
              style={[styles.contactBtn, { flex: 1 }]}
              onPress={() => listing.host.id && router.push(`/messages/${listing.host.id}` as any)}>
              <Text style={styles.contactBtnText}>Message Host</Text>
            </Pressable>
            <Pressable
              style={styles.aiBtn}
              onPress={() => router.push({ pathname: '/ai/chat', params: { listingId: listing.id } } as any)}>
              <Ionicons name="sparkles" size={18} color={Colors.brand} />
            </Pressable>
          </View>

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

      <ReserveFooter listing={listing} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.lg },

  galleryWrap: { position: 'relative', backgroundColor: Colors.backgroundSecondary },
  galleryImage: { width: SCREEN_W, height: SCREEN_W * 0.7 },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 16, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.sm, zIndex: 10 },
  galleryActions: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 16, right: 16, flexDirection: 'row', gap: Spacing.sm },
  galleryAction: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  galleryDots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  galDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  galDotActive: { backgroundColor: Colors.white, width: 7, height: 7 },

  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  listingTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  listingSubtitle: { fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 4 },
  capacityText: { fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 4 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingPillText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  hostRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  hostAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.backgroundSecondary },
  hostName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  superhostLabel: { fontSize: FontSize.xs, color: Colors.brand, fontWeight: '600', marginTop: 2 },

  highlights: { gap: Spacing.md },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  highlightText: { flex: 1, fontSize: FontSize.base, color: Colors.text, fontWeight: '500' },

  aircoverBox: { gap: 8 },
  aircoverTitle: { fontSize: FontSize.xl },
  aircoverBody: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  sectionHeading: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  descText: { fontSize: FontSize.base, color: Colors.text, lineHeight: 22 },
  showMoreBtn: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text, marginTop: Spacing.sm },

  amenitiesList: { gap: Spacing.md },
  amenityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  amenityName: { fontSize: FontSize.base, color: Colors.text },
  showAllBtn: { marginTop: Spacing.md, paddingVertical: 12, paddingHorizontal: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.text, alignItems: 'center' },
  showAllBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },

  mapPlaceholder: { height: 160, borderRadius: Radius.xl, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, gap: 8 },
  mapCity: { fontSize: FontSize.base, color: Colors.textSecondary },

  reviewsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  reviewsHeading: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  ratingBreakdown: { gap: Spacing.sm, marginBottom: Spacing.lg },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ratingBarLabel: { width: 80, fontSize: FontSize.sm, color: Colors.text },
  ratingBarTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight, overflow: 'hidden' },
  ratingBarFill: { height: '100%', backgroundColor: Colors.text, borderRadius: 2 },
  ratingBarValue: { width: 28, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right' },
  reviewCard: { marginBottom: Spacing.lg, padding: Spacing.md, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.backgroundSecondary },
  reviewAuthor: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  reviewDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reviewStars: { flexDirection: 'row', gap: 2, marginBottom: Spacing.sm },
  reviewBody: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  hostCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  hostCardAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.backgroundSecondary },
  hostCardName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  superhostBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: 4 },
  superhostText: { fontSize: FontSize.xs, color: Colors.brand, fontWeight: '600' },
  contactBtn: { paddingVertical: 12, paddingHorizontal: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.text, alignItems: 'center' },
  contactBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  aiBtn: { width: 44, height: 44, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: '#ffd6e0', backgroundColor: '#fff0f3', alignItems: 'center', justifyContent: 'center' },
  aiSummaryBox: { backgroundColor: '#fff0f3', borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  aiSummaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiSummaryTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.brand },
  aiSummaryText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  aiSummaryCta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  aiSummaryCtaText: { fontSize: FontSize.sm, color: Colors.brand, fontWeight: '600', textDecorationLine: 'underline' },

  reportRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  reportText: { fontSize: FontSize.sm, color: Colors.textSecondary, textDecorationLine: 'underline' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  footerLeft: { gap: 2 },
  footerPrice: { fontSize: FontSize.base },
  footerPriceBold: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  footerPriceNight: { fontWeight: '400', color: Colors.text },
  footerSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reserveBtn: { backgroundColor: Colors.brand, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: 14 },
  reserveBtnText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },
});
