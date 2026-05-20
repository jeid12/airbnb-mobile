import type {
  Listing,
  Review,
  Wishlist,
  Trip,
  MessageThread,
  User,
} from '@/features/listings/types';

// ─── Generic response shapes ──────────────────────────────────────────────────

/**
 * All list endpoints return this paginated shape.
 * Backend must implement pagination via `page` + `perPage` query params.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code: string;       // e.g. "NOT_FOUND", "UNAUTHORIZED"
  statusCode: number;
}

export interface ApiSuccess {
  success: boolean;
  message?: string;
}

// ─── Request payloads ─────────────────────────────────────────────────────────

/**
 * Query params for GET /api/listings
 * All fields are optional; omit to get unfiltered results.
 */
export interface SearchFilters {
  destination?: string;
  checkIn?: string;       // ISO-8601: "2025-07-01"
  checkOut?: string;      // ISO-8601: "2025-07-07"
  adults?: number;
  children?: number;
  infants?: number;
  pets?: number;
  priceMin?: number;
  priceMax?: number;
  category?: string;
  amenities?: string[];   // e.g. ["wifi", "pool"]
  instantBook?: boolean;
  superhost?: boolean;
  page?: number;
  perPage?: number;
}

/** POST /api/listings/:id/report */
export interface ReportListingRequest {
  listingId: string;
  /** "inaccurate" | "not_a_real_place" | "scam" | "offensive" | "disturbing" | "something_else" */
  reason: string;
  details?: string;
}

/** POST /api/wishlists */
export interface CreateWishlistRequest {
  name: string;
}

/** POST /api/wishlists/:id/items */
export interface AddToWishlistRequest {
  listingId: string;
}

/** POST /api/messages/:threadId */
export interface SendMessageRequest {
  body: string;
}

// ─── REST endpoint reference ──────────────────────────────────────────────────
//
// Listings:
//   GET    /api/listings                  → PaginatedResponse<Listing>   (query: SearchFilters)
//   GET    /api/listings/:id              → Listing
//   GET    /api/listings/:id/reviews      → PaginatedResponse<Review>
//   GET    /api/categories                → Category[]
//   POST   /api/listings/:id/report       → ApiSuccess
//
// Wishlists:
//   GET    /api/wishlists                 → Wishlist[]
//   POST   /api/wishlists                 → Wishlist
//   POST   /api/wishlists/:id/items       → WishlistItem
//   DELETE /api/wishlists/:id/items/:lid  → ApiSuccess
//
// Trips:
//   GET    /api/trips                     → PaginatedResponse<Trip>
//   GET    /api/trips/:id                 → Trip
//
// Inbox:
//   GET    /api/messages                  → MessageThread[]
//   GET    /api/messages/:threadId        → Message[]
//   POST   /api/messages/:threadId        → Message
//
// Auth / Profile:
//   GET    /api/auth/me                   → User
//   PATCH  /api/auth/me                   → User
//   POST   /api/auth/logout               → ApiSuccess
//
// ─── API base URL ─────────────────────────────────────────────────────────────
// Set EXPO_PUBLIC_API_URL in your .env file:
//   EXPO_PUBLIC_API_URL=https://api.yourproject.com/v1
