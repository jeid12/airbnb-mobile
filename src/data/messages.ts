import type { MessageThread } from '@/features/listings/types';

export const messageThreads: MessageThread[] = [
  {
    id: 'm1',
    participant: {
      id: 'h1',
      name: 'Craig',
      avatar: 'https://i.pravatar.cc/100?img=12',
    },
    listing: {
      id: '1',
      title: 'Private room in Yonkers',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&q=80',
    },
    lastMessage: {
      body: 'Great, get ready to check in.',
      sentAt: '2026-01-28T09:15:00Z',
      read: true,
      fromMe: false,
    },
    unreadCount: 0,
  },
  {
    id: 'm2',
    participant: {
      id: 'h3',
      name: 'Golwen',
      avatar: 'https://i.pravatar.cc/100?img=32',
    },
    listing: {
      id: '3',
      title: 'Graslin - Private room La Cambronne',
      image: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=300&q=80',
    },
    lastMessage: {
      body: 'New show price request.',
      sentAt: '2026-01-20T14:00:00Z',
      read: false,
      fromMe: false,
    },
    unreadCount: 1,
  },
];
