

export interface Host {
  id: string;
  name: string;
  avatar: string;
  superhost: boolean;
  joinedYear: number;
  reviewsCount: number;
  responseRate: string;
  responseTime: string;
  about: string;
}

export interface ReviewAuthor {
  id: string;
  name: string;
  avatar: string;
  location: string;
}

export interface Review {
  id: string;
  author: ReviewAuthor;
  date: string; // ISO date string
  body: string;
}

export interface RatingBreakdown {
  overall: number;
  accuracy: number;
  communication: number;
  cleanliness: number;
  location: number;
  checkIn: number;
  value: number;
  count: number;
}

export interface Capacity {
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

export interface ListingLocation {
  city: string;
  state?: string;
  country: string;
  fullAddress: string;
  lat: number;
  lng: number;
  neighborhoodDescription: string;
}

export interface PricingInfo {
  perNight: number;
  cleaningFee: number;
  serviceFee: number;
  currency: string;
}

export interface AmenityItem {
  name: string;
  icon: string;
  available: boolean;
  note?: string;
}

export interface AmenityGroup {
  category: string;
  items: AmenityItem[];
}

export interface SleepArrangement {
  name: string;
  beds: string[];
}

export type ListingCategory =
  | 'amazing-views'
  | 'beachfront'
  | 'cabins'
  | 'trending'
  | 'countryside'
  | 'arctic'
  | 'mansion'
  | 'design'
  | 'national-parks'
  | 'camping'
  | 'islands'
  | 'lakefront';

export interface Listing {
  id: string;
  title: string;
  type: string;
  description: string;
  images: string[];
  location: ListingLocation;
  price: PricingInfo;
  rating: RatingBreakdown;
  host: Host;
  capacity: Capacity;
  amenities: AmenityGroup[];
  sleepArrangements: SleepArrangement[];
  highlights: string[];
  category: ListingCategory;
  available: boolean;
  availableFrom: string;
  availableTo?: string;
  cancellationPolicy: string;
  houseRules: string[];
  safetyHighlights: string[];
  guestFavorite: boolean;
  instantBook: boolean;
  reviews: Review[];
}

// ─── Wishlist types ───────────────────────────────────────────────────────────

export interface WishlistItem {
  listingId: string;
  listing: Pick<Listing, 'id' | 'title' | 'images' | 'location' | 'price' | 'rating'>;
  savedAt: string;
}

export interface Wishlist {
  id: string;
  name: string;
  items: WishlistItem[];
  coverImages: string[];
  createdAt: string;
}

// ─── Trip types ───────────────────────────────────────────────────────────────

export interface TripListing {
  id: string;
  title: string;
  image: string;
  city: string;
  country: string;
}

export interface Trip {
  id: string;
  listing: TripListing;
  host: Pick<Host, 'id' | 'name' | 'avatar'>;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'upcoming' | 'current' | 'past' | 'cancelled';
  confirmationCode: string;
}



export interface MessageThread {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
  };
  listing?: {
    id: string;
    title: string;
    image: string;
  };
  lastMessage: {
    body: string;
    sentAt: string;
    read: boolean;
    fromMe: boolean;
  };
  unreadCount: number;
}


export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone?: string;
  joinedYear: number;
  location?: string;
  verified: boolean;
}



export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface SearchState {
  destination: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: GuestCount;
}



export interface Category {
  id: ListingCategory;
  label: string;
  icon: string;
}
