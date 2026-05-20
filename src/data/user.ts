import type { User } from '@/features/listings/types';

export const currentUser: User = {
  id: 'me',
  name: 'John Travolta',
  avatar: 'https://i.pravatar.cc/100?img=52',
  email: 'john.travolta@example.com',
  phone: '+1 555-0100',
  joinedYear: 2023,
  location: 'New York, NY',
  verified: true,
};
