const BASE_URL = 'https://airbnb-listing-api.onrender.com/api/v1';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginated<T> {
  data: T[];
  meta: ApiMeta;
}

export type ListingType = 'APARTMENT' | 'VILLA' | 'CABIN' | 'HOUSE';

export interface ApiListingItem {
  id: string;
  title: string;
  location: string; // "Downtown, New York"
  pricePerNight: number;
  type: ListingType;
  guests: number;
  amenities: string[];
  rating: number;
  createdAt: string;
  host: { name: string; avatar: string | null };
  _count: { bookings: number };
}

export interface ApiListingDetail extends Omit<ApiListingItem, '_count'> {
  description: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  category: string;
  hostId: string;
  updatedAt: string;
  host: ApiHost;
  bookings: ApiBooking[];
  photos: Array<{ id: string; url: string }>;
}

export interface ApiHost {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  isSuperhost: boolean;
  createdAt: string;
}

export interface ApiReview {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  listingId: string;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

export interface ApiBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  guestId: string;
  listingId: string;
  guest: { name: string; avatar?: string | null };
  listing: { title: string; location: string };
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  isSuperhost: boolean;
  createdAt: string;
  updatedAt: string;
  bookings?: ApiBooking[];
}

export interface ApiWishlistItem {
  id: string;
  wishlistId: string;
  listingId: string;
  addedAt: string;
  listing: { id: string; title: string; location: string; pricePerNight: number };
}

export interface ApiWishlist {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  items: ApiWishlistItem[];
}

// ─── Request helper ───────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = body?.message ?? body?.error ?? `Request failed (${res.status})`;
    throw new Error(String(msg));
  }

  return body as T;
}

function qs(params: Record<string, unknown>): string {
  const pairs = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!pairs.length) return '';
  return '?' + pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

// ─── API surface ──────────────────────────────────────────────────────────────

export const api = {
  // Listings
  getListings(params: { page?: number; limit?: number; search?: string; type?: string } = {}, token?: string | null) {
    return request<ApiPaginated<ApiListingItem>>(`/listings${qs(params)}`, {}, token);
  },

  getListing(id: string, token?: string | null) {
    return request<ApiListingDetail>(`/listings/${id}`, {}, token);
  },

  getListingReviews(id: string, params: { page?: number; limit?: number } = {}) {
    return request<ApiPaginated<ApiReview>>(`/listings/${id}/reviews${qs(params)}`);
  },

  // Auth
  login(email: string, password: string) {
    return request<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(data: { name: string; email: string; username: string; phone: string; password: string }) {
    return request<ApiUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe(token: string) {
    return request<ApiUser>('/auth/me', {}, token);
  },

  // Bookings
  getBookings(token: string) {
    return request<ApiPaginated<ApiBooking>>('/bookings', {}, token);
  },

  createBooking(token: string, data: { listingId: string; checkIn: string; checkOut: string; guests: number }) {
    return request<ApiBooking>('/bookings', { method: 'POST', body: JSON.stringify(data) }, token);
  },

  // Wishlists
  getWishlists(token: string) {
    return request<ApiWishlist[]>('/wishlists', {}, token);
  },

  createWishlist(token: string, name = 'My Wishlist') {
    return request<ApiWishlist>('/wishlists', { method: 'POST', body: JSON.stringify({ name }) }, token);
  },

  addToWishlist(token: string, wishlistId: string, listingId: string) {
    return request<ApiWishlistItem>(
      `/wishlists/${wishlistId}/items`,
      { method: 'POST', body: JSON.stringify({ listingId }) },
      token,
    );
  },

  removeFromWishlist(token: string, wishlistId: string, itemId: string) {
    return request<void>(`/wishlists/${wishlistId}/items/${itemId}`, { method: 'DELETE' }, token);
  },
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

// API has no listing photos, use Unsplash fallbacks by type.
const FALLBACK_IMAGES: Record<string, string[]> = {
  APARTMENT: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
    'https://images.unsplash.com/photo-1505693314127-087d7ca7d3d9?w=800&q=80',
  ],
  VILLA: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1499916078519-93a5e38d7cf9?w=800&q=80',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
  ],
  CABIN: [
    'https://images.unsplash.com/photo-1566073771259-470b7fe8bf71?w=800&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
  ],
  HOUSE: [
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80',
    'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&q=80',
    'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80',
  ],
};

export function getListingImages(listing: { type: string; photos?: Array<{ url: string }> }): string[] {
  if (listing.photos && listing.photos.length > 0) return listing.photos.map((p) => p.url);
  return FALLBACK_IMAGES[listing.type] ?? ['https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80'];
}

/** Parse "Downtown, New York" → { city: "Downtown", region: "New York" } */
export function parseLocation(location: string): { city: string; region: string } {
  const parts = location.split(',').map((s) => s.trim());
  return { city: parts[0] ?? location, region: parts.slice(1).join(', ') };
}

/** Map a local UI category id to the API `type` param (undefined = no filter). */
export function categoryToApiType(categoryId: string): string | undefined {
  const map: Record<string, string> = {
    cabins: 'CABIN',
    mansion: 'VILLA',
    trending: 'APARTMENT',
    design: 'APARTMENT',
    countryside: 'HOUSE',
  };
  return map[categoryId];
}
