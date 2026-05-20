import type { Trip } from '@/features/listings/types';

export const trips: Trip[] = [
  {
    id: 't1',
    listing: {
      id: '1',
      title: 'Private room in Yonkers close to bus/train station',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=700&q=80',
      city: 'Yonkers',
      country: 'United States',
    },
    host: {
      id: 'h1',
      name: 'Craig',
      avatar: 'https://i.pravatar.cc/100?img=12',
    },
    checkIn: '2026-02-13',
    checkOut: '2026-02-18',
    guests: 2,
    totalPrice: 616,
    status: 'upcoming',
    confirmationCode: 'HMFDK9B3X',
  },
];

export const pastTrips: Trip[] = [];
