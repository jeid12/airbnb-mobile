import type { Wishlist } from '@/features/listings/types';
import { listings } from './listings';

export const wishlists: Wishlist[] = [
  {
    id: 'w1',
    name: 'Nice',
    coverImages: [
      listings[3].images[0],
      listings[1].images[0],
      listings[6].images[0],
    ],
    items: [
      {
        listingId: listings[3].id,
        listing: {
          id: listings[3].id,
          title: listings[3].title,
          images: listings[3].images,
          location: listings[3].location,
          price: listings[3].price,
          rating: listings[3].rating,
        },
        savedAt: '2025-11-10T10:30:00Z',
      },
      {
        listingId: listings[1].id,
        listing: {
          id: listings[1].id,
          title: listings[1].title,
          images: listings[1].images,
          location: listings[1].location,
          price: listings[1].price,
          rating: listings[1].rating,
        },
        savedAt: '2025-11-08T14:20:00Z',
      },
    ],
    createdAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'w2',
    name: 'Chill',
    coverImages: [
      listings[4].images[0],
      listings[5].images[0],
    ],
    items: [
      {
        listingId: listings[4].id,
        listing: {
          id: listings[4].id,
          title: listings[4].title,
          images: listings[4].images,
          location: listings[4].location,
          price: listings[4].price,
          rating: listings[4].rating,
        },
        savedAt: '2025-12-01T09:00:00Z',
      },
    ],
    createdAt: '2025-11-15T12:00:00Z',
  },
];
