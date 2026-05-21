export const BASE_URL = 'https://airbnb-listing-api.onrender.com/api/v1';

// ─── Shared types ─────────────────────────────────────────────────────────────

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

export type ListingType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN';
export type UserRole   = 'HOST' | 'GUEST' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

// ─── Domain types (match API schema exactly) ──────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: UserRole;
  avatar: string | null;
  bio: string | null;
  isSuperhost: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated by GET /auth/me / GET /users/:id
  listings?: ApiListingItem[];
  bookings?: ApiBooking[];
}

export interface ApiListingItem {
  id: string;
  title: string;
  description: string;
  location: string;          // e.g. "Downtown, New York"
  pricePerNight: number;
  guests: number;
  beds?: number;
  bedrooms?: number;
  bathrooms?: number;
  type: ListingType;
  category?: string;
  amenities: string[];
  rating: number | null;
  hostId: string;
  createdAt: string;
  updatedAt?: string;
  host: {
    id?: string;
    name: string;
    avatar: string | null;
    isSuperhost?: boolean;
  };
  photos?: Array<{ id: string; url: string }>;
  bookings?: ApiBooking[];
  _count?: { bookings: number };
}

// Alias — detail endpoint returns same shape with more fields populated
export type ApiListingDetail = ApiListingItem;

export interface ApiMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  listingId: string | null;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
  receiver?: { id: string; name: string; avatar: string | null };
}

export interface AiChatResponse {
  reply: string;
  sessionId: string;
}

export interface AiSearchResponse {
  data: ApiListingItem[];
  filters: { location: string | null; type: string | null; maxPrice: number | null; guests: number | null };
  meta: ApiMeta;
}

export interface AiReviewSummary {
  summary: string;
  positives: string[];
  negatives: string[];
}

export interface ApiReview {
  id: string;
  rating: number;           // 1-5
  comment: string;
  userId: string;
  listingId: string;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

export interface ApiBooking {
  id: string;
  checkIn: string;          // ISO datetime
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  guestId: string;
  listingId: string;
  guests?: number;
  createdAt: string;
  guest?: { name: string; avatar?: string | null };
  listing?: { title: string; location: string; id?: string };
}

export interface ApiStats {
  totalListings: number;
  averagePrice: number;
  byLocation: Array<{ location: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
}

export interface ApiUserStats {
  totalUsers: number;
  byRole: Array<{ role: string; count: number }>;
}

// ─── Request helpers ──────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Don't set Content-Type for FormData (browser sets it with boundary)
  const isFormData = options.body instanceof FormData;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    // Disable HTTP caching so the server never responds with 304 (no-body).
    // React Native's fetch doesn't maintain a browser cache, so 304 would
    // produce an empty body and silently break real-time endpoints.
    cache: 'no-store',
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> ?? {}),
      'Cache-Control': 'no-cache',
    },
  });

  // 304 Not Modified — treat as success with no new data (use TanStack cache)
  if (res.status === 304) {
    return undefined as unknown as T;
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { error?: string; message?: string }).error
      ?? (body as { error?: string; message?: string }).message
      ?? `Request failed (${res.status})`;
    throw new Error(String(msg));
  }
  return body as T;
}

function qs(params: Record<string, unknown>): string {
  const pairs = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return pairs.length ? '?' + pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&') : '';
}

// ─── API surface ──────────────────────────────────────────────────────────────

export const api = {

  // ── Auth ────────────────────────────────────────────────────────────────────

  register(data: {
    name: string; email: string; username: string; phone: string;
    password: string; role?: 'HOST' | 'GUEST';
  }): Promise<ApiUser> {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  },

  login(email: string, password: string): Promise<{ token: string; user: ApiUser }> {
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },

  getMe(token: string): Promise<ApiUser> {
    return request('/auth/me', {}, token);
  },

  // PUT /auth/me — update own name, username, phone, bio, avatar
  updateMe(token: string, data: {
    name?: string; username?: string; phone?: string; bio?: string; avatar?: string | null;
  }): Promise<ApiUser> {
    return request('/auth/me', { method: 'PUT', body: JSON.stringify(data) }, token);
  },

  // GET/POST/PUT /users/:id/profile — extended profile (bio, website, country)
  getExtendedProfile(userId: string): Promise<{ bio?: string; website?: string; country?: string } | null> {
    return request(`/users/${userId}/profile`).catch(() => null);
  },

  upsertExtendedProfile(token: string, userId: string, data: { bio?: string; website?: string; country?: string }, exists: boolean): Promise<object> {
    return request(`/users/${userId}/profile`, {
      method: exists ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  changePassword(token: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }, token);
  },

  forgotPassword(email: string): Promise<{ message: string }> {
    return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },

  resetPassword(token: string, password: string): Promise<{ message: string }> {
    return request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  // ── Listings ─────────────────────────────────────────────────────────────────

  getListings(params: {
    location?: string; type?: string; maxPrice?: number;
    page?: number; limit?: number; sortBy?: 'pricePerNight' | 'createdAt';
    order?: 'asc' | 'desc';
  } = {}): Promise<ApiPaginated<ApiListingItem>> {
    return request(`/listings${qs(params)}`);
  },

  searchListings(params: {
    location?: string; type?: string; minPrice?: number; maxPrice?: number;
    guests?: number; page?: number; limit?: number;
  } = {}): Promise<ApiPaginated<ApiListingItem>> {
    return request(`/listings/search${qs(params)}`);
  },

  getListingsStats(): Promise<ApiStats> {
    return request('/listings/stats');
  },

  getListing(id: string): Promise<ApiListingDetail> {
    return request(`/listings/${id}`);
  },

  createListing(token: string, data: {
    title: string; description: string; location: string;
    pricePerNight: number; guests: number; type: ListingType; amenities: string[];
    rating?: number;
  }): Promise<ApiListingItem> {
    return request('/listings', { method: 'POST', body: JSON.stringify(data) }, token);
  },

  updateListing(token: string, id: string, data: Partial<{
    title: string; description: string; location: string;
    pricePerNight: number; guests: number; type: ListingType; amenities: string[];
  }>): Promise<ApiListingItem> {
    return request(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);
  },

  deleteListing(token: string, id: string): Promise<ApiListingItem> {
    return request(`/listings/${id}`, { method: 'DELETE' }, token);
  },

  uploadListingPhotos(token: string, id: string, files: FormData): Promise<ApiListingItem> {
    return request(`/listings/${id}/photos`, { method: 'POST', body: files }, token);
  },

  deleteListingPhoto(token: string, id: string, photoId: string): Promise<{ message: string }> {
    return request(`/listings/${id}/photos/${photoId}`, { method: 'DELETE' }, token);
  },

  // ── Reviews ──────────────────────────────────────────────────────────────────

  getListingReviews(id: string, params: { page?: number; limit?: number } = {}): Promise<ApiPaginated<ApiReview>> {
    return request(`/listings/${id}/reviews${qs(params)}`);
  },

  addReview(token: string, listingId: string, data: { rating: number; comment: string }): Promise<ApiReview> {
    return request(`/listings/${listingId}/reviews`, {
      method: 'POST', body: JSON.stringify(data),
    }, token);
  },

  deleteReview(token: string, reviewId: string): Promise<{ message: string }> {
    return request(`/reviews/${reviewId}`, { method: 'DELETE' }, token);
  },

  // ── Bookings ─────────────────────────────────────────────────────────────────

  getAllBookings(): Promise<ApiPaginated<ApiBooking>> {
    return request('/bookings');
  },

  createBooking(token: string, data: {
    listingId: string; checkIn: string; checkOut: string; guests?: number;
  }): Promise<ApiBooking> {
    return request('/bookings', { method: 'POST', body: JSON.stringify(data) }, token);
  },

  getBookingById(id: string): Promise<ApiBooking> {
    return request(`/bookings/${id}`);
  },

  cancelBooking(token: string, id: string): Promise<ApiBooking> {
    return request(`/bookings/${id}`, { method: 'DELETE' }, token);
  },

  updateBookingStatus(id: string, status: BookingStatus): Promise<ApiBooking> {
    return request(`/bookings/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
  },

  // ── Users ─────────────────────────────────────────────────────────────────────

  getUsers(): Promise<ApiUser[]> {
    return request('/users');
  },

  getUserStats(): Promise<ApiUserStats> {
    return request('/users/stats');
  },

  getUserById(id: string): Promise<ApiUser> {
    return request(`/users/${id}`);
  },

  updateUser(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
    return request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteUser(id: string): Promise<ApiUser> {
    return request(`/users/${id}`, { method: 'DELETE' });
  },

  // GET /users/:id/listings — host's own listings
  getUserListings(userId: string): Promise<ApiListingItem[]> {
    return request(`/users/${userId}/listings`);
  },

  // GET /users/:id/bookings — guest's own bookings
  getUserBookings(token: string, userId: string): Promise<ApiBooking[]> {
    return request(`/users/${userId}/bookings`, {}, token);
  },

  uploadAvatar(token: string, userId: string, form: FormData): Promise<ApiUser> {
    return request(`/users/${userId}/avatar`, { method: 'POST', body: form }, token);
  },

  removeAvatar(token: string, userId: string): Promise<{ message: string }> {
    return request(`/users/${userId}/avatar`, { method: 'DELETE' }, token);
  },

  // ── Messages ──────────────────────────────────────────────────────────────────

  getConversations(token: string): Promise<ApiMessage[]> {
    return request('/messages', {}, token);
  },

  getThread(token: string, peerId: string): Promise<ApiMessage[]> {
    return request(`/messages/${peerId}`, {}, token);
  },

  sendMessage(token: string, data: { receiverId: string; content: string; listingId?: string }): Promise<ApiMessage> {
    return request('/messages', { method: 'POST', body: JSON.stringify(data) }, token);
  },

  markRead(token: string, messageId: string): Promise<ApiMessage> {
    return request(`/messages/${messageId}/read`, { method: 'PATCH' }, token);
  },

  getUnreadCount(token: string): Promise<{ count: number }> {
    return request('/messages/unread-count', {}, token);
  },

  // ── AI ───────────────────────────────────────────────────────────────────────

  aiSearch(query: string, page = 1, limit = 10): Promise<AiSearchResponse> {
    return request(`/ai/search${qs({ page, limit })}`, {
      method: 'POST', body: JSON.stringify({ query }),
    });
  },

  aiChat(sessionId: string, message: string, listingId?: string): Promise<AiChatResponse> {
    return request('/ai/chat', {
      method: 'POST', body: JSON.stringify({ sessionId, message, ...(listingId && { listingId }) }),
    });
  },

  aiRecommend(token: string): Promise<{ data: ApiListingItem[] }> {
    return request('/ai/recommend', { method: 'POST' }, token);
  },

  aiReviewSummary(listingId: string): Promise<AiReviewSummary> {
    return request(`/ai/listings/${listingId}/review-summary`);
  },

  aiGroupedListings(groupBy: 'location' | 'host' = 'location'): Promise<{ groups: Array<{ key: string; label: string; count: number }> }> {
    return request(`/ai/listings/grouped${qs({ groupBy })}`);
  },
};

// ─── Image helpers ────────────────────────────────────────────────────────────

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

/** Parse "Downtown, New York" → { city, region } */
export function parseLocation(location: string): { city: string; region: string } {
  const parts = location.split(',').map((s) => s.trim());
  return { city: parts[0] ?? location, region: parts.slice(1).join(', ') };
}

/** Map a local UI category id → API `type` param (undefined = no filter) */
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
